import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { EntryAdded } from "@/components/entryAdded";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import MyPicker from "@/components/picker";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { addExpense, getRelatedCurrencies, getRelatedPeople } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, KeyboardTypeOptions, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type RouteTypes = RouteProp<ParamsList, "AddExpense">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function AddExpense() {
    const route = useRoute<RouteTypes>();
    const { tripId } = route.params;

    const insets = useSafeAreaInsets();
    const tripStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: Colours.title,
            flex: 1,
        }
    })
    return (
        <View style={tripStyles.container}>
            <StatusBar barStyle={'light-content'}/>
            <TopSection title="Add Expense"/>
            <MainBody tripId={tripId}/>
        </View>
    )
}

interface CurrencyTableTypes {
    id: number,
    currency_name: string,
    abbreviation: string,
    trip_id: number
}
interface CurrencyPickerProps {
    value: number,
    text: string,
}
interface PeopleTableTypes {
    id: number,
    name: string,
    weight: number,
    trip_id: number,
}
function MainBody({tripId}: {tripId: number}) {
    const db = useSQLiteContext();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [confirmMessage, setConfirmMessage] = useState<boolean>(false);
    
    const [expenseName, setExpenseName] = useState<string>('');
    const [payerId, setPayerId] = useState<number>(0);
    const [amount, setAmount] = useState<string>('');
    const [currencyId, setCurrencyId] = useState<number>(0)
    const [date, setDate] = useState(new Date());
    const [people, setPeople] = useState<PeopleTableTypes[]>([]);
    const [description, setDescription] = useState<string>("");

    const [currencyList, setCurrencyList] = useState<CurrencyPickerProps[]>([]);
    const [peopleList, setPeopleList] = useState<CurrencyPickerProps[]>([]);
    
    async function convertCurrencies(): Promise<void> {
        const currencyData = await getRelatedCurrencies(db, tripId);
        const rawList = currencyData as CurrencyTableTypes[];
        const convertedList: CurrencyPickerProps[] = rawList.map((currency) => ({
            value: currency.id,
            text: currency.abbreviation,
        }))
        setCurrencyList(convertedList);
    }

    async function obtainPeople() {
        const peopleData = await getRelatedPeople(db, tripId) as PeopleTableTypes[];
        setPeople(peopleData);
        const convertedList: CurrencyPickerProps[] = peopleData.map((person) => ({
            value: person.id,
            text: person.name,
        }))
        setPeopleList(convertedList);
    }

    async function updatePeople(id: number, newWeight: string) {
        const oldData = people;
        for (let i = 0; i < oldData.length; i++) {
            if (oldData[i].id == id) {
                oldData[i].weight = parseFloat(newWeight);
            }
        }
        setPeople(oldData);
    }

    async function confirmExpense() {
        setIsLoading(true);
        //console.log(expenseName, payerId, amount, currencyId, date);
        //console.log(people);
        await addExpense(db, tripId, expenseName, payerId, parseFloat(amount), currencyId, date, people);
        setConfirmMessage(true);
        setTimeout(() => {setIsLoading(false)}, 1000);
    }

    function pressConfirm() {
        if (!isLoading) {
            confirmExpense();
        }
    }

    useEffect(() => {
        convertCurrencies();
        obtainPeople();
    }, [])
    
    return (
        <KeyboardAvoidingView style={genericMainBodyStyles.outerContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <EntryAdded isOpen={confirmMessage} setIsOpen={setConfirmMessage}/>
        <ScrollView style={{width: windowWidth}} contentContainerStyle={{alignItems: 'center'}}>
        <View style={genericMainBodyStyles.container}>
            <Details 
                tripId={tripId}
                setExpenseName={setExpenseName}
                setAmount={setAmount}
                setDate={setDate}
                setCurrencyId={setCurrencyId}
                currencyList={currencyList}
                setPayerId={setPayerId}
                peopleList={peopleList}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <DisplayMembers 
                tripId={tripId}
                people={people}
                updatePeople={updatePeople}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <GenericButton
                text="Confirm" 
                height={45} 
                width={210} 
                colour={Colours.confirmButton} 
                textColour={Colours.textColor}
                action={pressConfirm}
                fontsize={22}/>
            
            <VerticalGap height={40}/>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
    )
}

interface detailsProps {
    tripId: number;
    setExpenseName: (variable: string) => void;
    setAmount: (variable: string) => void;
    setDate: (variable: Date) => void;
    setCurrencyId: (variable: number) => void;
    currencyList: CurrencyPickerProps[];
    setPayerId: (variable: number) => void;
    peopleList: CurrencyPickerProps[];
}
const detailsStyle = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingTop: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        color: Colours.textColor,
    },
    miniContainer: {
        flexDirection: 'row',
        width: 0.8 * windowWidth,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    payerTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: Colours.textColor,
    },
    pickerContainer: {
        width: 0.27 * windowWidth,
        height: 0.08 * windowWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colours.backgroundV2,
        borderRadius: 5,
        paddingHorizontal: 8,
    },
    picker: {
        fontSize: 20,
        width: 0.17 * windowWidth,
        color: Colours.textColor,
    },
    descriptionContainer: {
        borderWidth: 2,
        borderColor: Colours.inputField,
        borderRadius: 10,
        width: windowWidth * 0.8,
        height: windowHeight * 0.1,
    },
    descriptionText: {
        position: 'absolute',
        width: windowWidth * 0.8 - 4,
        height: windowHeight * 0.1 - 4,
        padding: 5,
        color: Colours.textColor,
        fontSize: 20,
    }
})
function Details(props: detailsProps){
    const insets = useSafeAreaInsets();

    const [currencyIndex, setCurrencyIndex] = useState(0);
    const [payerIndex, setPayerIndex] = useState<number>(0);

    const [viewCurrencyPicker, setViewCurrencyPicker] = useState(false);
    const [viewPayerPicker, setViewPayerPicker] = useState(false);

    useEffect(() => {
        if (props.currencyList[0] != undefined) {
            setCurrencyIndex(0);
            props.setCurrencyId(props.currencyList[0].value);
        }
        if (props.peopleList[0] != undefined) {
            setPayerIndex(0);
            props.setPayerId(props.peopleList[0].value);
        }
    }, [props.currencyList, props.peopleList]);

    useEffect(() => {
        if (props.peopleList[0] != undefined) {
            props.setPayerId(props.peopleList[payerIndex].value);
        }
        if (props.currencyList[0] != undefined) {
            props.setCurrencyId(props.currencyList[currencyIndex].value);
        }
    }, [payerIndex, currencyIndex])

    return (
        <View style={detailsStyle.container}>
            <Text style={detailsStyle.title}>Details</Text>

            <VerticalGap height={20}/>

            <Input setVariable={props.setExpenseName} variablePlaceHolder="Expense Name" width={0.8 * windowWidth} keyboardType="default"/>

            <VerticalGap height={20}/>

            <View style={detailsStyle.miniContainer}>
                <Text style={detailsStyle.payerTitle}>By</Text>
                <Pressable style={[detailsStyle.pickerContainer, {width: 0.7 * windowWidth}]}
                        onPress={() => {setViewPayerPicker(true)}}>
                    <MyPicker isVisible={viewPayerPicker} 
                            setIsVisible={setViewPayerPicker} 
                            values={props.peopleList}
                            setIndex={setPayerIndex}
                            initialIndex={payerIndex}/>
                    <Text style={detailsStyle.picker}>{props.peopleList[0] != undefined ? props.peopleList[payerIndex].text : ""}</Text>
                    <Ionicons name="caret-down-outline" size={20} color={Colours.genericIcon}/>
                </Pressable>
            </View>

            <VerticalGap height={20}/>

            <View style={detailsStyle.miniContainer}>
                <Input setVariable={props.setAmount} variablePlaceHolder="Amount" width={0.5 * windowWidth} keyboardType="numeric"/>
                <Pressable style={[detailsStyle.pickerContainer]}
                        onPress={() => {setViewCurrencyPicker(true)}}>
                    <MyPicker isVisible={viewCurrencyPicker} 
                            setIsVisible={setViewCurrencyPicker} 
                            values={props.currencyList}
                            setIndex={setCurrencyIndex}
                            initialIndex={currencyIndex}/>
                    <Text style={detailsStyle.picker}>{props.currencyList[0] != undefined ? props.currencyList[currencyIndex].text : ""}</Text>
                    <Ionicons name="caret-down-outline" size={20} color={Colours.genericIcon}/>
                </Pressable>
            </View>

            <VerticalGap height={20}/>

            <DateInput setVariable={props.setDate} variablePlaceHolder="Date"/>

            <VerticalGap height={20}/>

            <View style={detailsStyle.descriptionContainer}>
                <TextInput placeholder="Description" placeholderTextColor={Colours.placeholder}
                    style={detailsStyle.descriptionText}
                    multiline={true}/>
            </View>
        </View>
    )
}

interface inputProps {
    setVariable: (variable: string) => void;
    variablePlaceHolder: string;
    width: number;
    keyboardType: KeyboardTypeOptions;
}
const inputStyles = StyleSheet.create({
    inputField: {
        borderBottomWidth: 2,
        borderColor: Colours.inputField,
        color: Colours.textColor,
        fontSize: 20,
    }
})
function Input({setVariable, variablePlaceHolder, width, keyboardType}: inputProps) {
    return (
        <TextInput 
            placeholder={variablePlaceHolder}
            placeholderTextColor={Colours.placeholder}
            style={[inputStyles.inputField, {width: width}]}
            onChangeText={setVariable}
            keyboardType={keyboardType}/>
    )
}

interface DateInputProps {
    setVariable: (variable: Date) => void;
    variablePlaceHolder: string;
}

function DateInput({ setVariable, variablePlaceHolder }: DateInputProps) {
    const [date, setDate] = useState(new Date());
    
    const inputMiniStyles = StyleSheet.create({
        inputField: {
            width: 0.8 * windowWidth,
            color: Colours.textColor,
            fontSize: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        inputTitle: {
            fontSize: 15,
            fontWeight: '500',
            color: Colours.textColor,
        }
    })

    function setAfterDateChange(event: DateTimePickerEvent, date?: Date | undefined) {
        if (event.type == "set") {
            setVariable(date ?? new Date());
        }
    }

    return (
        <View style={inputMiniStyles.inputField}>
            <Text style={inputMiniStyles.inputTitle}>{variablePlaceHolder}</Text>
            <RNDateTimePicker 
                value={date}
                onChange={setAfterDateChange}
                />
        </View>
    )
}

interface displayMembersProps {
    tripId: number;
    people: PeopleTableTypes[];
    updatePeople: (id: number, newWeight: string) => void;
}
const displayMembersStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colours.textColor
    },
    miniContainer: {
        flexDirection: 'row',
        width: 0.8 * windowWidth,
        alignItems: 'center',
    },
})
function DisplayMembers(props: displayMembersProps) {
    
    return (
        <View style={displayMembersStyles.container}>
            <View style={displayMembersStyles.miniContainer}>
                <Text style={displayMembersStyles.title}>Members</Text>
                <HorizontalGap width={15}/>
            </View>
            <VerticalGap height={20}/>
            {props.people.map((person) => (
                <Member key={person.id} memberId={person.id}
                    name={person.name} weight={person.weight}
                    updatePeople={props.updatePeople}/>
            ))}
        </View>
    )
}

interface memberProps {
    memberId: number;
    name: string;
    weight: number;
    updatePeople: (id: number, newWeight: string) => void;
}
const memberStyles = StyleSheet.create({
    container: {

    },
    internalContainer: {
        flexDirection: 'row',
        width: 0.8 * windowWidth,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    field: {
        borderBottomWidth: 2,
        borderColor: 'grey',
        fontSize: 20,
        width: 0.23 * windowWidth,
        color: Colours.textColor,
    },
    nameField: {
        backgroundColor: Colours.backgroundV2,
        width: 0.48 * windowWidth,
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    name: {
        fontSize: 20,
        color: Colours.textColor,
    }
})
function Member(props: memberProps) {
    const [weight, setWeight] = useState<string>(props.weight.toString());
    
    return (
        <View style={memberStyles.container}>
            <View style={memberStyles.internalContainer}>
                <View style={memberStyles.nameField}>
                    <Text style={memberStyles.name}>{props.name}</Text>
                </View>
                <TextInput style={memberStyles.field} value={weight}
                    onChangeText={(newWeight) => {
                        setWeight(newWeight);
                        props.updatePeople(props.memberId, (newWeight == "") ? "0" : newWeight);
                    }}
                    keyboardType="numeric"/>
            </View>
            <VerticalGap height={10}/>
        </View>
    )
}
