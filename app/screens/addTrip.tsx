import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { GenericButton, GenericButton2 } from "@/components/buttons";
import { addToTrips } from "@/database/databaseSqlite";
import { useSQLiteContext } from "expo-sqlite";
import { Person } from "../../classes/person";
import { Currency } from "@/classes/currency";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Home">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function AddTrip() {
    const insets = useSafeAreaInsets();
    const tripStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: 'skyblue',
            flex: 1,
        }
    })
    return (
        <View style={tripStyles.container}>
            <StatusBar barStyle={'dark-content'}/>
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
    const [currencies, setCurrencies] = useState<Currency[]>([new Currency("Singapore Dollars", "SGD")]);

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
        newPeople[index].setWeight(parseFloat(weight));
        setPeople(newPeople);
        console.log("Name:", people[index].getName(), "| Weight:", people[index].getWeight())
    }

    function addCurrency() {
        setCurrencies([...currencies, new Currency("", "")]);
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
        console.log("Confirmed");
        console.log(tripName, location, startDate.toLocaleDateString(), endDate.toLocaleDateString());
        navigation.goBack();
    }

    return (
        <View style={genericMainBodyStyles.outerContainer}>
        <ScrollView>
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

            <GenericButton2 
                text="Confirm" 
                height={45} 
                width={210} 
                colour="dodgerblue" 
                action={confirmDetails}
                fontsize={22}/>
            
            <VerticalGap height={40}/>
        </View>
        </ScrollView>
        </View>
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
            borderColor: 'grey',
            color: 'black',
            fontSize: 20,
        }
    })

    return (
        <TextInput 
            placeholder={variablePlaceHolder}
            placeholderTextColor="grey"
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
            color: 'black',
            fontSize: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        inputTitle: {
            fontSize: 15,
            fontWeight: '500',
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
                <GenericButton text="Add" height={35} width={55} 
                    colour="lime" action={addPerson} fontsize={15}/>
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
        borderColor: 'grey',
        fontSize: 20,
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
                    <Ionicons name="remove-circle-outline" size={25} color="red"/>
                </TouchableOpacity>
                <TextInput value={name} style={[memberStyles.nameField, memberStyles.field]}
                    placeholder="Name" placeholderTextColor="grey"
                    onChangeText={(newName) => {
                        setName(newName);
                        updateName(newName, index);
                    }}/>
                <TextInput value={weight} 
                    style={[memberStyles.weightField, memberStyles.field]}
                    placeholder="Weight" placeholderTextColor="grey"
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
                <GenericButton text="Add" height={35} width={55} 
                    colour="lime" action={addCurrency} fontsize={15}/>
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
                    <Ionicons name="remove-circle-outline" size={25} color="red"/>
                </TouchableOpacity>
                <TextInput value={name} style={[memberStyles.currencyField, memberStyles.field]}
                    placeholder="Currency" placeholderTextColor="grey"
                    onChangeText={(newName) => {
                        setName(newName);
                        updateCurrency(newName, index);
                    }}/>
                <TextInput value={abbreviation} 
                    style={[memberStyles.abbreviationField, memberStyles.field]}
                    placeholder="Abbreviation" placeholderTextColor="grey"
                    onChangeText={(newWeight) => {
                        setAbbreviation(newWeight);
                        updateAbbreviation(newWeight, index);
                    }}/>
            </View>
            <VerticalGap height={10}/>
        </View>
    )
}
