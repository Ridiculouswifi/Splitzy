import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { GenericButton } from "./buttons";
import { Colours } from "./colours";
import { VerticalGap } from "./gap";

interface PickerProps {
    isVisible: boolean,
    setIsVisible: (variable: boolean) => void,
    values: ValueProps[],
    setIndex: (variable: number) => void,
    initialIndex: number,
}
interface ValueProps {
    value: number,
    text: string,
}

const pickerStyles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        height: 300,
        width: 350,
        paddingVertical: 20,
        backgroundColor: Colours.background,
        alignItems: 'center',
        borderRadius: 15,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
    },
    text: {
        fontSize: 27,
        fontWeight: 'bold',
        color: Colours.textColor,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
})

function onConfirm(selectedIndex: number, setIndex: (variable: number) => void, setIsVisible: (variable: boolean) => void,) {
    setIndex(selectedIndex);
    setIsVisible(false);
}
export default function MyPicker({isVisible, setIsVisible, values, setIndex, initialIndex}: PickerProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    return (
        <Modal visible={isVisible}
                transparent={true}
                animationType="fade">
            <View style={pickerStyles.background}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsVisible(false)}/>
                <View style={pickerStyles.container}>
                    <GenericButton
                            text="Confirm" 
                            height={45} 
                            width={250} 
                            colour={Colours.confirmButton} 
                            textColour={Colours.textColor}
                            action={() => onConfirm(selectedIndex, setIndex, setIsVisible)}
                            fontsize={22}/>
                    <VerticalGap height={20}/>
                    <Scroll values={values} setSelectedIndex={setSelectedIndex} initialIndex={initialIndex}/>
                </View>
            </View>
        </Modal>
    )
}

interface ScrollProps {
    setSelectedIndex: (variable: number) => void,
    initialIndex: number,
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;

const scrollStyles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    picker: {
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        width: 300,
        overflow: 'hidden',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: Colours.backgroundV2,
    },
    selectionOverlay: {
        position: 'absolute',
        top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        height: ITEM_HEIGHT,
        width: '100%',
        zIndex: 10,
        justifyContent: "space-between",
    },
    selectorLine: {
        width: '100%',
        borderWidth: 2,
        borderRadius: 2,
        borderColor: Colours.inputField,
    },
    item: {
        height: ITEM_HEIGHT,
        width: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 20,
        color: Colours.textColor,
        fontWeight: 400,
    },
})
function Scroll({values, setSelectedIndex, initialIndex}: {values: ValueProps[]} & ScrollProps) {
    function handleScroll(event: any) {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        setSelectedIndex(index);
    }
    
    return (
        <View style={scrollStyles.picker}>
            <View style={scrollStyles.selectionOverlay} pointerEvents="none">
                <View style={scrollStyles.selectorLine}></View>
                <View style={scrollStyles.selectorLine}></View>
            </View>
            <FlatList 
                    data={values}   
                    renderItem={({item}) => (
                        <View style={scrollStyles.item}>
                            <Text style={scrollStyles.itemText}>{item.text}</Text>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    contentContainerStyle={{paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2}}
                    initialScrollIndex={initialIndex}
                    getItemLayout={(_, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                    })}
            />
        </View>
    )
}
