import { useEffect, useState } from 'react';
//import Modal from 'react-native-modal';
import { Dimensions, Modal, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colours } from './colours';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const animationTime: number = 300;

interface filterModalProps {
    isOpen: boolean,
    closeFilter: () => void,
}

const filterModalStyles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    menu: {
        backgroundColor: Colours.background,
        width: 200,
        height: windowHeight,
        paddingLeft: 10,
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

export function FilterModal({isOpen, closeFilter}: filterModalProps) {
    const insets = useSafeAreaInsets();

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const moveX = useSharedValue(windowWidth);
    const transparency = useSharedValue(0);
    
    useEffect(() => {
        if (isOpen) {
            setModalVisible(true)
            moveX.value = withTiming(0, {duration: animationTime})
            transparency.value = withTiming(0.6, {duration: animationTime});
        }
    }, [isOpen])
;
    function handleClose() {
        moveX.value = withTiming(windowWidth, {duration: animationTime})
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
                
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}
