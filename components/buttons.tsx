import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Colours } from "./colours";

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
        transform: [{translateY: 1}],
    },
    text: {
        fontWeight: 'bold',
    },
})

export function GenericButton({ action, height, width, colour, text, fontsize, textColour }: genericButtonProps) {
    const [pressed, setPressed] = useState<boolean>(false);

    return (
        <View style={{height: height, width: width, alignItems: 'center', justifyContent: 'center'}}>
            <Pressable 
                style={[pressed ? genericButtonStyles.buttonPressed : genericButtonStyles.button, 
                    pressed ? {height: height/1.01, width: width/1.01, backgroundColor: darkenHexColor(colour, 0.95)} : {height: height, width: width, backgroundColor: colour}]}
                onPress={action}
                onPressIn={() => pressIn(setPressed)}
                onPressOut={() => pressOut(setPressed)}>
                <Text style={[genericButtonStyles.text, {color: textColour, fontSize: pressed ? fontsize/1.01 : fontsize}]}>{text}</Text>
            </Pressable>
        </View>
    )
}

function pressIn(setPressed: (variable: boolean) => void) {
    setPressed(true);
}

function pressOut(setPressed: (variable: boolean) => void) {
    setPressed(false);
}

function hexToRgb(hex: string): number[] {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('')
  );
}

// Factor is the percentage of lightness: eg. 0.9 is 90% of brightness left
export function darkenHexColor(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex).map(c => Math.round(c * factor));
  return rgbToHex(r, g, b);
}

const toggleButtonStyles = StyleSheet.create({
    container: {
        backgroundColor: Colours.backgroundV2,
        borderWidth: 2,
        borderColor: Colours.border,
        justifyContent: 'center',
        paddingHorizontal: 1,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
    },
    activeColour: {
        backgroundColor: Colours.greenButton,
        position: 'absolute',
    },
    toggle : {
        backgroundColor: Colours.textColor,
    },
})
export function ToggleButton({buttonOn, setButtonOn}: {buttonOn: boolean, setButtonOn: (variable: boolean) => void}) {
    const height: number = 26;
    const width: number = 55;

    const moveX = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const animationTime: number = 200;

    function pressed() {
        if (buttonOn) {
            setButtonOn(false);
            toggleOff();
        } else {
            setButtonOn(true);
            toggleOn();
        }
    }

    function toggleOn() {
        moveX.value = withTiming(29, {duration: animationTime});
        backgroundOpacity.value = withTiming(1, {duration: animationTime});
    }

    function toggleOff() {
        moveX.value = withTiming(0, {duration: animationTime});
        backgroundOpacity.value = withTiming(0, {duration: animationTime});
    }

    const translateStyle = useAnimatedStyle(() => ({
        transform: [{translateX: moveX.value}]
    }))

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }))

    return (
        <Pressable style={[toggleButtonStyles.container, {
            height: height,
            width: width,
            borderRadius: height / 2,
        }]} 
        onPress={pressed}>
            <Animated.View style={[toggleButtonStyles.activeColour, fadeStyle, {
                height: height - 4,
                width: width - 4,
                borderRadius: (height - 4) / 2,
            }]}></Animated.View>
            <Animated.View style={[toggleButtonStyles.toggle, translateStyle, {
                height: height - 6,
                width: height - 6,
                borderRadius: (height - 6) / 2,
            }]}></Animated.View>
        </Pressable>
    )
}
