import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const windowWidth = Dimensions.get('window').width;

const gapStyles = StyleSheet.create({
    container: {
    },
    divider: {
        borderBottomWidth: 2,
        borderColor: 'lightgrey',
        width: 0.9 * windowWidth,
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

export function Divider() {
    return (
        <View style={gapStyles.divider}></View>
    )
}
