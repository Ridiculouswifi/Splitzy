import { Currency } from "@/classes/currency";
import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { addMembers, addToCurrencies, addToPeople, addToTrips, createTrip, getLatestTripId } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";
import { Person } from "../../classes/person";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "AddTrip">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function AddTrip() {
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
            <TopSection title="Add Trip"/>
            <MainBody/>
        </View>
    )
}

function MainBody() {
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const db = useSQLiteContext();

    const [tripName, setTripName] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [people, setPeople] = useState<Person[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([new Currency(0, "Singapore Dollars", "SGD")]);

    function addPerson() {
        setPeople([...people, new Person("", 0)]);
        console.log("Added, Number of people:", people.length);
    }

    function deletePerson(index: number) {
        setPeople(people.filter((_, i) => i !== index));
        console.log("Removed, Number of people:", people.length);
    }

    function updateName(name: string, index: number) {
        const newPeople = [...people];
        newPeople[index].setName(name);
        setPeople(newPeople);
        console.log("Name:", people[index].getName(), "| Weight:", people[index].getWeight())
    }

    function updateWeight(weight: string, index: number) {
        const newPeople = [...people];
        newPeople[index].setWeight(parseInt(weight));
        setPeople(newPeople);
        console.log("Name:", people[index].getName(), "| Weight:", people[index].getWeight())
    }

    function addCurrency() {
        setCurrencies([...currencies, new Currency(0, "", "")]);
    }

    function deleteCurrency(index: number) {
        setCurrencies(currencies.filter((_, i) => i !== index));
    }

    function updateCurrency(name: string, index: number) {
        const newCurrencies = [...currencies];
        newCurrencies[index].setName(name);
        setCurrencies(newCurrencies);
    }

    function updateAbbreviation(abbreviation: string, index: number) {
        const newCurrencies = [...currencies];
        newCurrencies[index].setAbbreviation(abbreviation);
        setCurrencies(newCurrencies);
    }

    async function confirmDetails() {
        await addToTrips(db, tripName, location, startDate, endDate);
        console.log(tripName, location, startDate.toLocaleDateString(), endDate.toLocaleDateString());
        const data = await getLatestTripId(db) as {id: number}[];
        if (data && data.length > 0) {
            console.log(data[0].id);
        } else {
            console.error("Data is empty");
        }

        await createTrip(db, data[0].id);

        for (let i = 0; i < people.length; i++) {
            await addToPeople(db, people[i].getName(), people[i].getWeight(), data[0].id);
            console.log(people[i].getName(), people[i].getWeight());
        }
        for (let i = 0; i < currencies.length; i++) {
            await addToCurrencies(db, currencies[i].getName(), currencies[i].getAbbreviation(), data[0].id);
            console.log(currencies[i].getName(), currencies[i].getAbbreviation());
        }

        await addMembers(db, data[0].id);

        console.log("Confirmed");
        navigation.goBack();
    }

    return (
        <KeyboardAvoidingView style={[genericMainBodyStyles.outerContainer, {display: 'flex'}]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={{width: windowWidth}} contentContainerStyle={{alignItems: 'center'}}>
        <View style={genericMainBodyStyles.container}>
            <Details 
                setTripName={setTripName}
                setLocation={setLocation}
                setStartDate={setStartDate}
                setEndDate={setEndDate}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <DisplayMembers
                addPerson={addPerson}
                deletePerson={deletePerson}
                updateName={updateName}
                updateWeight={updateWeight}
                people={people}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <DisplayCurrencies
                addCurrency={addCurrency}
                deleteCurrency={deleteCurrency}
                updateCurrency={updateCurrency}
                updateAbbreviation={updateAbbreviation}
                currencies={currencies}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <GenericButton
                text="Confirm" 
                height={45} 
                width={210} 
                colour={Colours.confirmButton}
                textColour={Colours.textColor}
                action={confirmDetails}
                fontsize={22}/>
            
            <VerticalGap height={40}/>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
    )
}

interface detailsProps {
    setTripName: (variable: string) => void;
    setLocation: (variable: string) => void;
    setStartDate: (variable: Date) => void;
    setEndDate: (variable: Date) => void;
}

function Details({setTripName, setLocation, setStartDate, setEndDate}: detailsProps) {
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
        }
    })
    return (
        <View style={detailsStyle.container}>
            <Text style={detailsStyle.title}>Details</Text>
            <VerticalGap height={20}/>
            <Input setVariable={setTripName} variablePlaceHolder="Trip Name"/>
            <VerticalGap height={20}/>
            <Input setVariable={setLocation} variablePlaceHolder="Location"/>
            <VerticalGap height={20}/>
            <View style={detailsStyle.miniContainer}>
                <InputMini setVariable={setStartDate} variablePlaceHolder="Start"/>
                <InputMini setVariable={setEndDate} variablePlaceHolder="End"/>
            </View>
        </View>
    )
}

interface InputProps {
    setVariable: (variable: string) => void;
    variablePlaceHolder: string;
}

function Input({ setVariable, variablePlaceHolder }: InputProps) {
    const inputStyles = StyleSheet.create({
        inputField: {
            width: 0.8 * windowWidth,
            borderBottomWidth: 2,
            borderColor: Colours.inputField,
            color: Colours.textColor,
            fontSize: 20,
        }
    })

    return (
        <TextInput 
            placeholder={variablePlaceHolder}
            placeholderTextColor={Colours.placeholder}
            style={inputStyles.inputField}
            onChangeText={setVariable}/>
    )
}

interface InputMiniProps {
    setVariable: (variable: Date) => void;
    variablePlaceHolder: string;
}

function InputMini({ setVariable, variablePlaceHolder }: InputMiniProps) {
    const [date, setDate] = useState(new Date());
    
    const inputMiniStyles = StyleSheet.create({
        inputField: {
            width: 0.35 * windowWidth,
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
    people: Person[];
    addPerson: () => void;
    deletePerson: (index: number) => void;
    updateName: (name: string, index: number) => void;
    updateWeight: (weight: string, index: number) => void;
}
function DisplayMembers({people, addPerson, deletePerson, updateName, updateWeight}: displayMembersProps) {

    const membersStyles = StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: Colours.textColor,
        },
        miniContainer: {
            flexDirection: 'row',
            width: 0.8 * windowWidth,
            alignItems: 'center',
        },
    })

    return (
        <View style={membersStyles.container}>
            <View style={membersStyles.miniContainer}>
                <Text style={membersStyles.title}>Members</Text>
                <HorizontalGap width={15}/>
                <GenericButton 
                    text="Add" 
                    height={35} 
                    width={55} 
                    colour={Colours.greenButton} 
                    action={addPerson} 
                    fontsize={15}
                    textColour={Colours.textColorLightButton}/>
            </View>
            <VerticalGap height={20}/>
            {people.map((person, index) => (
                <Member key={index} person={person} index={index}
                    deletePerson={deletePerson}
                    updateName={updateName}
                    updateWeight={updateWeight}/>
            ))}
        </View>
    )
}

const memberStyles = StyleSheet.create({
    container: {

    },
    internalContainer: {
        flexDirection: 'row',
        width: 0.8 * windowWidth,
        justifyContent: 'space-between',
    },
    field: {
        borderBottomWidth: 2,
        borderColor: Colours.inputField,
        fontSize: 20,
        color: Colours.textColor,
    },
    nameField: {
        width: 0.48 * windowWidth,
    },
    weightField: {
        width: 0.20 * windowWidth,
    },
    currencyField: {
        width: 0.50 * windowWidth,
    },
    abbreviationField: {
        width: 0.18 * windowWidth,
    },
})
interface memberProps {
    person: Person;
    index: number;
    deletePerson: (index: number) => void;
    updateName: (name: string, index: number) => void;
    updateWeight: (weight: string, index: number) => void;
}
function Member({person, index, deletePerson, updateName, updateWeight}: memberProps) {
    const initialWeight = person.getWeight();

    const [name, setName] = useState<string>(person.getName());
    const [weight, setWeight] = useState<string>(initialWeight ? initialWeight.toString() : "");

    return (
        <View style={memberStyles.container}>
            <View style={memberStyles.internalContainer}>
                <TouchableOpacity onPress={() => deletePerson && deletePerson(index)}>
                    <Ionicons name="remove-circle-outline" size={25} color={Colours.cancel}/>
                </TouchableOpacity>
                <TextInput value={name} style={[memberStyles.nameField, memberStyles.field]}
                    placeholder="Name" placeholderTextColor={Colours.placeholder}
                    onChangeText={(newName) => {
                        setName(newName);
                        updateName(newName, index);
                    }}/>
                <TextInput value={weight} 
                    style={[memberStyles.weightField, memberStyles.field]}
                    placeholder="Weight" placeholderTextColor={Colours.placeholder}
                    keyboardType="numeric"
                    onChangeText={(newWeight) => {
                        setWeight(newWeight);
                        updateWeight(newWeight, index);
                    }}/>
            </View>
            <VerticalGap height={10}/>
        </View>
    )
}

interface displayCurrencyProps {
    currencies: Currency[];
    addCurrency: () => void;
    deleteCurrency: (index: number) => void;
    updateCurrency: (name: string, index: number) => void;
    updateAbbreviation: (abbreviation: string, index: number) => void;
}
function DisplayCurrencies({currencies, addCurrency, deleteCurrency, updateCurrency, updateAbbreviation}: displayCurrencyProps) {
    const membersStyles = StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: Colours.textColor,
        },
        miniContainer: {
            flexDirection: 'row',
            width: 0.8 * windowWidth,
            alignItems: 'center',
        },
    })

    return (
        <View style={membersStyles.container}>
            <View style={membersStyles.miniContainer}>
                <Text style={membersStyles.title}>Currencies</Text>
                <HorizontalGap width={15}/>
                <GenericButton 
                    text="Add" 
                    height={35} 
                    width={55} 
                    colour={Colours.greenButton} 
                    action={addCurrency} 
                    fontsize={15}
                    textColour={Colours.textColorLightButton}/>
            </View>
            <VerticalGap height={20}/>
            {currencies.map((currency, index) => (
                <Money key={index} currency={currency} index={index}
                    deleteCurrency={deleteCurrency}
                    updateCurrency={updateCurrency}
                    updateAbbreviation={updateAbbreviation}/>
            ))}
        </View>
    )
}

interface moneyProps {
    currency: Currency;
    index: number;
    deleteCurrency: (index: number) => void;
    updateCurrency: (name: string, index: number) => void;
    updateAbbreviation: (abbreviation: string, index: number) => void;
}
function Money({currency, index, deleteCurrency, updateCurrency, updateAbbreviation}: moneyProps) {
    const [name, setName] = useState<string>(currency.getName());
    const [abbreviation, setAbbreviation] = useState<string>(currency.getAbbreviation());

    return (
        <View style={memberStyles.container}>
            <View style={memberStyles.internalContainer}>
                <TouchableOpacity onPress={() => deleteCurrency && deleteCurrency(index)}>
                    <Ionicons name="remove-circle-outline" size={25} color={Colours.cancel}/>
                </TouchableOpacity>
                <TextInput value={name} style={[memberStyles.currencyField, memberStyles.field]}
                    placeholder="Currency" placeholderTextColor={Colours.placeholder}
                    onChangeText={(newName) => {
                        setName(newName);
                        updateCurrency(newName, index);
                    }}/>
                <TextInput value={abbreviation} 
                    style={[memberStyles.abbreviationField, memberStyles.field]}
                    placeholder="Abbreviation" placeholderTextColor={Colours.placeholder}
                    onChangeText={(newWeight) => {
                        setAbbreviation(newWeight);
                        updateAbbreviation(newWeight, index);
                    }}/>
            </View>
            <VerticalGap height={10}/>
        </View>
    )
}
