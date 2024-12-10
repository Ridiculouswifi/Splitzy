import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { TopSection } from "@/components/screenTitle";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Home">;
type RouteTypes = RouteProp<ParamsList, "Trip">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Trip() {
    const route = useRoute<RouteTypes>();
    const { tripName } = route.params;
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
            <TopSection title="Trip Details"/>
            <MainBody tripName={tripName}/>
        </View>
    )
}

interface mainBodyTypes {
    tripName: string
}
function MainBody({tripName}: mainBodyTypes) {
    const mainBodyStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'whitesmoke',
            alignItems: 'center',
            width: windowWidth - 30,
            paddingTop: 15,
        },
        outerContainer: {
            flex: 1,
            backgroundColor: 'whitesmoke',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2, // subtler shadow
            shadowRadius: 2,
            elevation: 2, // for Android shadow
            alignItems: 'center',
        },
    })
    
    return (
        <View style={mainBodyStyles.outerContainer}>
        <ScrollView>
        <View style={mainBodyStyles.container}>
            <Text>{tripName}</Text>
        </View>
        </ScrollView>
        </View>
    )
}
