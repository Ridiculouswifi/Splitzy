import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface genericButtonProps {
    height: number;
    width: number;
    colour: string;
    text: string;
    textColour: string;
    action: () => void;
    fontsize: number
}

const genericButtonStyles = StyleSheet.create({
    button: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
        transform: [{translateY: 0}],
    },
    buttonPressed: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 0.2},
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        transform: [{translateY: 1.3}],
    },
    text: {
        fontWeight: 'bold',
    },
})

export function GenericButton({ action, height, width, colour, text, fontsize, textColour }: genericButtonProps) {
    const [pressed, setPressed] = useState<boolean>(false);

    return (
        <Pressable 
            style={[pressed ? genericButtonStyles.buttonPressed : genericButtonStyles.button, 
                pressed ? {height: height, width: width - 2, backgroundColor: colour} : {height: height, width: width, backgroundColor: colour}]}
            onPress={action}
            onPressIn={() => pressIn(setPressed)}
            onPressOut={() => pressOut(setPressed)}>
            <Text style={[genericButtonStyles.text, {color: textColour, fontSize: fontsize}]}>{text}</Text>
        </Pressable>
    )
}

function pressIn(setPressed: (variable: boolean) => void) {
    setPressed(true);
}

function pressOut(setPressed: (variable: boolean) => void) {
    setPressed(false);
}
