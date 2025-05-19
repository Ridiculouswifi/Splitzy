import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Colours } from "./colours";

const entryAddedStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        height: 40,
        width: 350,
        backgroundColor: Colours.backgroundV2,
        zIndex: 10, // ensures it sits on top
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
        borderRadius: 10,
        borderColor: Colours.cancel,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: Colours.textColor,
        fontSize: 20,
        fontWeight: '600',
    }
})
export function EntryAdded({isOpen, setIsOpen}: {isOpen: boolean, setIsOpen: (variable: boolean) => void}) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isOpen) {
            opacity.value = withTiming(1, {duration: 200});
            setTimeout(() => {opacity.value = withTiming(0, {duration: 200})}, 800);
            setTimeout(() => {setIsOpen(false)}, 1000);
        }
    }, [isOpen])

    const opacityStyles = useAnimatedStyle(() => ({
        opacity: opacity.value
    }))
    
    if (!isOpen) {
        return null;
    }

    return (
        <Animated.View style={[entryAddedStyles.container, opacityStyles]}>
            <Text style={entryAddedStyles.text}>Entry Added!</Text>
        </Animated.View>
    )
}