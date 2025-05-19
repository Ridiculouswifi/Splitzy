import { ReactNode, useEffect, useState } from 'react';
//import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colours } from './colours';
import { Divider, VerticalGap } from './gap';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const animationTime: number = 300;

interface filterModalProps {
    isOpen: boolean,
    closeFilter: () => void,
    child: ReactNode,
}

const filterModalStyles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    menu: {
        backgroundColor: Colours.background,
        width: 235,
        height: windowHeight,
        paddingHorizontal: 10,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#000',
    },
    filterTitle: {
        color: Colours.textColor,
        fontSize: 30,
        fontWeight: 'bold',
    }
})

export function FilterModal({isOpen, closeFilter, child}: filterModalProps) {
    const insets = useSafeAreaInsets();

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const moveX = useSharedValue(235);
    const transparency = useSharedValue(0);
    
    useEffect(() => {
        if (isOpen) {
            setModalVisible(true)
            moveX.value = withTiming(0, {duration: 500})
            transparency.value = withTiming(0.6, {duration: 500});
        }
    }, [isOpen])
;
    function handleClose() {
        moveX.value = withTiming(235, {duration: animationTime})
        transparency.value = withTiming(0, {duration: animationTime})
        setTimeout(() => setModalVisible(false), animationTime);
        closeFilter();
    }

    const backgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(0, 0, 0, ${transparency.value})`
    }));

    const menuStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: moveX.value }],
    }))
    
    return (
        <Modal visible={modalVisible}
                transparent={true}>
            <Animated.View style={[filterModalStyles.background, backgroundStyle]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}/>
                <Animated.View style={[filterModalStyles.menu, menuStyle, {paddingTop: insets.top + 10}]}>
                    <Text style={filterModalStyles.filterTitle}>Filter</Text>

                    <VerticalGap height={5}/>
                    <Divider/>
                    <Divider/>

                    {child}
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}

const checkBoxStyle = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderRadius: 5,
        borderColor: Colours.border,
        height: 25,
        width: 25,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
export function CheckBox({isCheck, setIsCheck}: {isCheck: boolean, setIsCheck: (variable: boolean) => void}) {
    return (
        <TouchableOpacity style={[checkBoxStyle.container, {backgroundColor: isCheck ? Colours.backgroundV2 : Colours.background}]} 
            activeOpacity={0.65}
            onPress={() => {setIsCheck(!isCheck)}}>
            {isCheck && <Ionicons name="checkmark" color={Colours.textColor} size={20}/>}
        </TouchableOpacity>
    )
}
