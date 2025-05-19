import React from "react";
import { Dimensions, DimensionValue, StyleSheet, View } from "react-native";
import { Colours } from "./colours";

const windowWidth = Dimensions.get('window').width;

const gapStyles = StyleSheet.create({
    container: {
    },
    divider: {
        borderBottomWidth: 2,
    }
})

export function VerticalGap({height}: {height: number}) {
    return (
        <View style={[gapStyles.container, {height: height}]}></View>
    )
}

export function HorizontalGap({width}: {width: number}) {
    return (
        <View style={[gapStyles.container, {width: width}]}></View>
    )
}

export function Divider({width = '100%', colour = Colours.divider}: {width?: DimensionValue, colour?: string}) {
    return (
        <View style={[gapStyles.divider, {width: width, borderColor: colour}]}></View>
    )
}
