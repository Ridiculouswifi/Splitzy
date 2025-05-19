import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { Divider, VerticalGap } from "@/components/gap";
import MyPicker from "@/components/picker";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { addTransaction, getRelatedCurrencies, getRelatedPeople } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type RouteTypes = RouteProp<ParamsList, "AddTransaction">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function AddTransaction() {
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
            <TopSection title="Add Transaction"/>
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
interface PeopleTableTypes {
    id: number,
    name: string,
    weight: number,
    trip_id: number,
}
interface TransactionsTableTypes {
    id: number,
    payerId: number,
    recipientId: number,
    amount: number,
    currencyId: number,
    date: Date,
}
interface PickerProps {
    value: number,
    text: string,
}

async function getData(db: SQLiteDatabase, tripId: number,
        setCurrencyList: (variable: PickerProps[]) => void, setPeopleList: (variable: PickerProps[]) => void): Promise<void> {
    const currencyData = await getRelatedCurrencies(db, tripId) as CurrencyTableTypes[];
    const currencyList: PickerProps[] = currencyData.map((currency) => ({
        value: currency.id,
        text: currency.abbreviation,
    }))
    setCurrencyList(currencyList);

    const peopleData = await getRelatedPeople(db, tripId) as PeopleTableTypes[];
    const peopleList: PickerProps[] = peopleData.map((person) => ({
        value: person.id,
        text: person.name,
    }))
    setPeopleList(peopleList);
}

function MainBody({tripId}: {tripId: number}) {
    const db = useSQLiteContext();

    const [currencyList, setCurrencyList] = useState<PickerProps[]>([]);
    const [peopleList, setPeopleList] = useState<PickerProps[]>([]);

    const detailsRef = useRef<DetailsHandle>(null);

    const [transactions, setTransactions] = useState<number[]>([0]);

    useEffect(() => {
        getData(db, tripId, setCurrencyList, setPeopleList);
    }, [])

    function pressConfirm() {
        /*
        for (let i = 0; i < transactions.length; i++) {
            detailsRef.current[i]?.add();
        }
        */
        detailsRef.current?.add();
    }

    return (
        <KeyboardAvoidingView style={genericMainBodyStyles.outerContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={{width: windowWidth}} contentContainerStyle={{alignItems: 'center'}}>
        <View style={genericMainBodyStyles.container}>
            <Details tripId={tripId} currencyList={currencyList} peopleList={peopleList} db={db} ref={detailsRef}/>  

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
    db: SQLiteDatabase;
    tripId: number;
    currencyList: PickerProps[];
    peopleList: PickerProps[];
    ref: Ref<DetailsHandle>;
}
type DetailsHandle = {
    add: () => void;
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
})
function Details(props: detailsProps){
    const insets = useSafeAreaInsets();

    const [payerId, setPayerId] = useState<number>(0);
    const [recipientId, setRecipientId] = useState<number>(0);
    const [amount, setAmount] = useState<string>('');
    const [currencyId, setCurrencyId] = useState<number>(0);
    const [date, setDate] = useState<Date>(new Date());

    const [recipientIndex, setRecipientIndex] = useState(0);
    const [payerIndex, setPayerIndex] = useState<number>(0);
    const [currencyIndex, setCurrencyIndex] = useState<number>(0);

    const [viewRecipientPicker, setViewRecipientPicker] = useState(false);
    const [viewPayerPicker, setViewPayerPicker] = useState(false);
    const [viewCurrencyPicker, setViewCurrencyPicker] = useState(false);

    useEffect(() => {
        if (props.currencyList[0] != undefined) {
            setCurrencyIndex(0);
            setCurrencyId(props.currencyList[0].value);
        }
        if (props.peopleList[0] != undefined) {
            setPayerIndex(0);
            setRecipientIndex(0);
            setPayerId(props.peopleList[0].value);
            setRecipientId(props.peopleList[0].value);
        }
    }, [props.currencyList, props.peopleList]);

    useEffect(() => {
        if (props.peopleList[0] != undefined) {
            setPayerId(props.peopleList[payerIndex].value);
            setRecipientId(props.peopleList[recipientIndex].value);
        }
        if (props.currencyList[0] != undefined) {
            setCurrencyId(props.currencyList[currencyIndex].value);
        }
    }, [payerIndex, recipientIndex, currencyIndex])

    useImperativeHandle(props.ref, () => {
        return {
            add() {
                addTransaction(props.db, props.tripId, payerId, recipientId, amount == '' ? 0 : parseFloat(amount), currencyId, date);
            }
        }
    }, [payerId, recipientId, amount, currencyId, date])

    return (
        <View style={detailsStyle.container}>
            <Text style={detailsStyle.title}>Details</Text>
            <VerticalGap height={20}/>
            <View style={detailsStyle.miniContainer}>
                <Text style={detailsStyle.payerTitle}>From</Text>
                <Pressable style={[detailsStyle.pickerContainer, {width: 0.67 * windowWidth}]}
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
                <Text style={detailsStyle.payerTitle}>To</Text>
                <Pressable style={[detailsStyle.pickerContainer, {width: 0.67 * windowWidth}]}
                        onPress={() => {setViewRecipientPicker(true)}}>
                    <MyPicker isVisible={viewRecipientPicker} 
                            setIsVisible={setViewRecipientPicker} 
                            values={props.peopleList}
                            setIndex={setRecipientIndex}
                            initialIndex={recipientIndex}/>
                    <Text style={detailsStyle.picker}>{props.peopleList[0] != undefined ? props.peopleList[recipientIndex].text : ""}</Text>
                    <Ionicons name="caret-down-outline" size={20} color={Colours.genericIcon}/>
                </Pressable>
            </View>
            <VerticalGap height={20}/>
            <View style={detailsStyle.miniContainer}>
                <Input setVariable={setAmount} variablePlaceHolder="Amount" width={0.5 * windowWidth}/>
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
            <DateInput setVariable={setDate} variablePlaceHolder="Date"/>
        </View>
    )
}

interface inputProps {
    setVariable: (variable: string) => void;
    variablePlaceHolder: string;
    width: number;
}
const inputStyles = StyleSheet.create({
    inputField: {
        borderBottomWidth: 2,
        borderColor: Colours.inputField,
        color: Colours.textColor,
        fontSize: 20,
    }
})
function Input({setVariable, variablePlaceHolder, width}: inputProps) {
    return (
        <TextInput 
            placeholder={variablePlaceHolder}
            placeholderTextColor={Colours.placeholder}
            style={[inputStyles.inputField, {width: width}]}
            onChangeText={setVariable}
            keyboardType="numeric"/>
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
