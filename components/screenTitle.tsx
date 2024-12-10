import { ParamsList } from "@/app";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList>;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export function TopSection({title}: {title: string}) {
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const topSectionStyles = StyleSheet.create({
        container: {
            paddingHorizontal: 40,
            backgroundColor: 'skyblue',
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
        },
    })
    
    function returnHome() {
        navigation.pop();
    }

    return (
        <View style={topSectionStyles.container}>
            <View style={topSectionStyles.horizontalContainer}>
                <TouchableOpacity onPress={returnHome}>
                    <Ionicons name="chevron-back-outline" size={35}/>
                </TouchableOpacity>
                <Text style={topSectionStyles.titleMessage}>{title}</Text>
                <View style={{width: 35}}></View>
            </View>
        </View>
    )
}
