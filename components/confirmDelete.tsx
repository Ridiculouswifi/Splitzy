import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GenericButton } from "./buttons";
import { Colours } from "./colours";
import { HorizontalGap } from "./gap";

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

interface confirmDeleteProps {
    isVisible: boolean;
    setIsVisible: (variable: boolean) => void;
    confirm: () => void;
}
const confirmDeleteStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        flex: 1,
    },
    container: {
        height: 150,
        width: 350,
        paddingVertical: 20,
        backgroundColor: Colours.background,
        alignItems: 'center',
        justifyContent: 'space-between',
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
export function ConfirmDelete({isVisible, setIsVisible, confirm}: confirmDeleteProps) {
    const insets = useSafeAreaInsets();

    function cancel() {
        setIsVisible(false);
    }

    return (
        <Modal visible={isVisible} 
            transparent={true}
            animationType="fade">
            <View style={confirmDeleteStyles.background}>
            <View style={confirmDeleteStyles.modalContainer}>
                <View style={confirmDeleteStyles.container}>
                    <Text style={confirmDeleteStyles.text}>Confirm Delete?</Text>
                    <View style={confirmDeleteStyles.buttonContainer}>
                        <GenericButton 
                            text="Confirm" 
                            height={50}
                            width={150} 
                            colour={Colours.cancel}
                            action={confirm} 
                            fontsize={20}
                            textColour={Colours.textColor}
                            />
                        <HorizontalGap width={10}/>
                        <GenericButton 
                            text="Cancel" 
                            height={50}
                            width={150} 
                            colour={Colours.backgroundV2}
                            action={cancel} 
                            fontsize={20}
                            textColour={Colours.textColor}/>
                    </View>
                </View>
            </View>
            </View>
        </Modal>
    )
}
