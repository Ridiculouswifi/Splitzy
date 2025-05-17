import { Ionicons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Colours } from "./colours";

const windowWidth = Dimensions.get('window').width;

const searchBarStyles = StyleSheet.create({
    container: {
        width: 0.9 * windowWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchBar: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colours.border,
        borderRadius: 20,
        width: windowWidth * 0.8,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        height: 40,
        backgroundColor: Colours.backgroundV2,
    },
    input: {
        width: windowWidth * 0.8,
        color: Colours.textColor,
        fontSize: 20,
        position: 'absolute',
        paddingLeft: 40,
        paddingRight: 15,
        height: 40,
    },
    filter: {
        
    }
})
export function SearchBar({setKeyPhrase, openFilter}: {setKeyPhrase: (variable: string) => void, openFilter: () => void}) {
    return (
        <View style={searchBarStyles.container}>
            <View style={searchBarStyles.searchBar}>
                <Ionicons name="search" color={Colours.border} size={28}/>
                <TextInput placeholder="Search" placeholderTextColor={Colours.placeholder}
                    style={searchBarStyles.input}
                    onChangeText={setKeyPhrase}/>
            </View>
            <TouchableOpacity style={searchBarStyles.filter} activeOpacity={0.65} onPress={openFilter}>
                <Ionicons name="filter" color={Colours.textColor} size={28}/>
            </TouchableOpacity>
        </View>
    )
}