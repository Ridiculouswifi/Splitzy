import { ParamsList } from "@/app";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colours } from "./colours";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList>;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export function TopSection({title}: {title: string}) {
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const topSectionStyles = StyleSheet.create({
        container: {
            paddingHorizontal: 40,
            backgroundColor: Colours.title,
            height: 0.09 * windowHeight,
            justifyContent: 'center',
            alignItems: 'center',
        },
        horizontalContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: windowWidth,
            justifyContent: 'space-between',
            paddingHorizontal: 10,
        },
        titleMessage: {
            fontSize: 35 / windowFontScale,
            fontWeight: 'bold',
            color: Colours.textColor,
            shadowOpacity: 0.1,
            shadowColor: '#000',
            width: 270,
            textAlign: 'center',
        },
    })
    
    function returnHome() {
        navigation.pop();
    }

    return (
        <View style={topSectionStyles.container}>
            <View style={topSectionStyles.horizontalContainer}>
                <TouchableOpacity onPress={returnHome}>
                    <Ionicons name="chevron-back-outline" size={35} color={Colours.genericIcon}/>
                </TouchableOpacity>
                <Text style={topSectionStyles.titleMessage} ellipsizeMode="tail" numberOfLines={1}>{title}</Text>
                <View style={{width: 35}}></View>
            </View>
        </View>
    )
}

export const genericMainBodyStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colours.background,
        alignItems: 'center',
        width: windowWidth - 30,
        paddingTop: 15,
    },
    outerContainer: {
        backgroundColor: Colours.background,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, // subtler shadow
        shadowRadius: 2,
        elevation: 2, // for Android shadow
        alignItems: 'center',
        height: '100%',
    },
})
