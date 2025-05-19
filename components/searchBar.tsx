import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
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
        paddingRight: 10,
        height: 40,
        backgroundColor: Colours.backgroundV2,
    },
    input: {
        width: windowWidth * 0.8,
        color: Colours.textColor,
        fontSize: 20,
        position: 'absolute',
        paddingLeft: 40,
        paddingRight: 40,
        height: 40,
    },
    filter: {
        
    }
})
export function SearchBar({keyPhrase, setKeyPhrase, openFilter}: {keyPhrase: string, setKeyPhrase: (variable: string) => void, openFilter: () => void}) {
    const inputRef = useRef<TextInput>(null);
    
    return (
        <View style={searchBarStyles.container}>
            <View style={searchBarStyles.searchBar}>
                <Ionicons name="search" color={Colours.border} size={28}/>
                <TextInput placeholder="Search" placeholderTextColor={Colours.placeholder}
                    style={searchBarStyles.input}
                    onChangeText={setKeyPhrase}
                    ref={inputRef}/>
                {keyPhrase.length > 0 && (
                    <TouchableOpacity activeOpacity={0.65} onPress={() => {
                        inputRef.current?.clear();
                        setKeyPhrase("");
                        }}>
                        <Ionicons name="close-circle" color={Colours.border} size={20}/>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={searchBarStyles.filter} activeOpacity={0.65} onPress={openFilter}>
                <Ionicons name="filter" color={Colours.textColor} size={28}/>
            </TouchableOpacity>
        </View>
    )
}
