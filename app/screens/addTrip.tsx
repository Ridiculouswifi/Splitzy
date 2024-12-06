import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { VerticalGap } from "@/components/gap";

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
            <VerticalGap height={0.02 * windowHeight}/>
            <Input setVariable={setLocation} variablePlaceHolder="Location"/>
            <VerticalGap height={0.02 * windowHeight}/>
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