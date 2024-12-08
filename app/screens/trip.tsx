import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Home">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Trip() {
    const insets = useSafeAreaInsets();
    const tripStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
        }
    })
    return (
        <View style={tripStyles.container}>
            <Text>Trip</Text>
        </View>
    )
}
