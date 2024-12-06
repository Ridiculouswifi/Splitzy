import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Home">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Home() {
    const insets = useSafeAreaInsets();
    const homeStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: 'skyblue',
        }
    })
    return (
        <View style={homeStyles.container}>
            <StatusBar barStyle={'dark-content'}/>
            <TopSection/>
            <MainBody/>
        </View>
    )
}

function TopSection() {
    const topSectionStyles = StyleSheet.create({
        container: {
            paddingHorizontal: 40,
            backgroundColor: 'skyblue',
            height: 0.1 * windowHeight,
            justifyContent: 'center',
        },
        titleMessage: {
            fontSize: 45 / windowFontScale,
            fontWeight: 'bold',
        },
    })
    return (
        <View style={topSectionStyles.container}>
            <Text style={topSectionStyles.titleMessage}>Splitzy</Text>
        </View>
    )
}

function MainBody() {
    const mainBodyStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'whitesmoke',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingTop: 10,
        },
        tripContainer: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            borderRadius: 15,
            borderBottomColor: 'darkgrey',
            borderBottomWidth: 2,
            height: 0.07 * windowHeight,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        titleText: {
            fontSize: 30 / windowFontScale,
            fontWeight: 'bold'
        },
    })
    return (
        <View style={mainBodyStyles.container}>
            <View style={mainBodyStyles.tripContainer}>
                <Text style={mainBodyStyles.titleText}>Your Trips</Text>
                <TouchableOpacity>
                    <Ionicons name='add-outline' size={30} color='black'/>
                </TouchableOpacity>
            </View>
        </View>
    )
}