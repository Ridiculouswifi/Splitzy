import React from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface genericButtonProps {
    height: number;
    width: number;
    colour: string;
    text: string;
    action: () => void;
}

const genericButtonStyles = StyleSheet.create({
    button: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        fontWeight: 'bold',
    },
})

export function GenericButton({ action, height, width, colour, text }: genericButtonProps) {
    return (
        <TouchableOpacity 
            style={[genericButtonStyles.button, 
                {height: height, width: width, backgroundColor: colour}]}
            activeOpacity={0.50}
            onPress={action}>
            <Text style={genericButtonStyles.text}>{text}</Text>
        </TouchableOpacity>
    )
}

export function GenericButton2({ action, height, width, colour, text, fontsize }: genericButtonProps & {fontsize: number}) {
    return (
        <TouchableOpacity 
            style={[genericButtonStyles.button, 
                {height: height, width: width, backgroundColor: colour}]}
            activeOpacity={0.50}
            onPress={action}>
            <Text style={[genericButtonStyles.text, {color: 'white', fontSize: fontsize}]}>{text}</Text>
        </TouchableOpacity>
    )
}