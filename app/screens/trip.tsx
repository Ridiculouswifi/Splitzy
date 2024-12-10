import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";

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
    return (
        <View style={genericMainBodyStyles.outerContainer}>
        <ScrollView>
        <View style={genericMainBodyStyles.container}>
            <Text>{tripName}</Text>
        </View>
        </ScrollView>
        </View>
    )
}
