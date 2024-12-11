import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar, StyleSheet, View } from "react-native";
import { ParamsList } from "..";
import { TopSection } from "@/components/screenTitle";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Expenses">;
type RouteTypes = RouteProp<ParamsList, "Expenses">;

export default function Expenses() {
    const insets = useSafeAreaInsets();

    const tripStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: 'skyblue',
            flex: 1,
        }
    })
    return (
        <View style={tripStyles.container}>
            <StatusBar barStyle={'dark-content'}/>
            <TopSection title="Trip"/>
        </View>
    )
}
