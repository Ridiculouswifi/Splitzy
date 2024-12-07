import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import { DatePickerModal } from "react-native-paper-dates";
import { CalendarDate } from "react-native-paper-dates/lib/typescript/Date/Calendar";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { GenericButton, GenericButton2 } from "@/components/buttons";

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
            <TopSection/>
            <MainBody/>
        </View>
    )
}

function TopSection() {
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const topSectionStyles = StyleSheet.create({
        container: {
            paddingHorizontal: 40,
            backgroundColor: 'skyblue',
            height: 0.09 * windowHeight,
            justifyContent: 'center',
            alignItems: 'center',
        },
        horizontalContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: windowWidth,
            justifyContent: 'space-between',
            paddingHorizontal: 10,
        },
        titleMessage: {
            fontSize: 35 / windowFontScale,
            fontWeight: 'bold',
        },
    })
    
    function returnHome() {
        navigation.pop();
    }

    return (
        <View style={topSectionStyles.container}>
            <View style={topSectionStyles.horizontalContainer}>
                <TouchableOpacity onPress={returnHome}>
                    <Ionicons name="chevron-back-outline" size={35}/>
                </TouchableOpacity>
                <Text style={topSectionStyles.titleMessage}>Add Trip</Text>
                <View style={{width: 35}}></View>
            </View>
        </View>
    )
}

function MainBody() {
    const navigation = useNavigation<NativeStackNavigatorTypes>();

    const [tripName, setTripName] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const mainBodyStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'whitesmoke',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingTop: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2, // subtler shadow
            shadowRadius: 2,
            elevation: 2, // for Android shadow
            alignItems: 'center',
        },
    })

    function dummy() {}

    return (
        <View style={mainBodyStyles.container}>
            <Details 
                setTripName={setTripName}
                setLocation={setLocation}
                setStartDate={setStartDate}
                setEndDate={setEndDate}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <DisplayMembers/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <DisplayCurrencies/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <GenericButton2 
                text="Confirm" 
                height={45} 
                width={210} 
                colour="dodgerblue" 
                action={dummy}/>
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

function DisplayMembers() {
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

    function dummy() {}

    return (
        <View style={membersStyles.container}>
            <View style={membersStyles.miniContainer}>
                <Text style={membersStyles.title}>Members</Text>
                <HorizontalGap width={15}/>
                <GenericButton text="Add" height={35} width={55} colour="lime" action={dummy}/>
            </View>
            <VerticalGap height={10}/>
        </View>
    )
}

function Member() {
    return (
        <View>
            <Text>Member</Text>
        </View>
    )
}

function DisplayCurrencies() {
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

    function dummy() {}

    return (
        <View style={membersStyles.container}>
            <View style={membersStyles.miniContainer}>
                <Text style={membersStyles.title}>Currencies</Text>
                <HorizontalGap width={15}/>
                <GenericButton text="Add" height={35} width={55} colour="lime" action={dummy}/>
            </View>
            <VerticalGap height={10}/>
        </View>
    )
}
