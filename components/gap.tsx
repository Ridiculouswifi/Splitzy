import React from "react"
import { StyleSheet, View } from "react-native"

const verticalGapStyle = StyleSheet.create({
    container: {
    }
})

export function VerticalGap({height}: {height: number}) {
    return (
        <View style={[verticalGapStyle.container, {height: height}]}></View>
    )
}