import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { HorizontalGap, VerticalGap } from "@/components/gap";

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
            <StatusBar barStyle={"dark-content"}/>
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
        },
    })

    return (
        <View style={mainBodyStyles.container}>
            <Details/>
        </View>
    )
}

function Details() {
    const [tripName, setTripName] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const detailsStyle = StyleSheet.create({
        container: {
            alignItems: "center",
            flex: 1,
            paddingTop: 10,
        },
        miniContainer: {
            flexDirection: 'row',
            width: 0.8 * windowWidth,
            justifyContent: 'space-between',
        }
    })
    return (
        <View style={detailsStyle.container}>
            <Input setVariable={setTripName} variablePlaceHolder="Trip Name"/>
            <VerticalGap height={20}/>
            <Input setVariable={setLocation} variablePlaceHolder="Location"/>
            <VerticalGap height={20}/>
            <View style={detailsStyle.miniContainer}>
                <InputMini setVariable={setStartDate} variablePlaceHolder="Start"/>
                <InputMini setVariable={setEndDate} variablePlaceHolder="End"/>
            </View>
            <VerticalGap height={20}/>
            <DisplayMembers/>
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

function InputMini({ setVariable, variablePlaceHolder }: InputProps) {
    const inputMiniStyles = StyleSheet.create({
        inputField: {
            width: 0.35 * windowWidth,
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
            style={inputMiniStyles.inputField}
            onChangeText={setVariable}/>
    )
}

function DisplayMembers() {
    const membersStyles = StyleSheet.create({
        container: {
            width: 0.8 * windowWidth,
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
        addMemberButton: {
            width: 55,
            height: 35,
            backgroundColor: 'lime',
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        addMemberText: {
            fontSize: 16,
            fontWeight: 'bold',
        },
    })

    return (
        <View style={membersStyles.container}>
            <View style={membersStyles.miniContainer}>
                <Text style={membersStyles.title}>Members</Text>
                <HorizontalGap width={15}/>
                <TouchableOpacity 
                    style={membersStyles.addMemberButton}
                    activeOpacity={0.50}>
                    <Text style={membersStyles.addMemberText}>Add</Text>
                </TouchableOpacity>
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