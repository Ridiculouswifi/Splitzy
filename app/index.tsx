import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Home from "./screens/home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Trip from "./screens/trip";
import AddTrip from "./screens/addTrip";

const Stack = createNativeStackNavigator<ParamsList>();

export type ParamsList = {
    Home: {name: string}
    Trip: {name: string}
    AddTrip: {name: string}
}

export default function Index() {
    return (
        <SafeAreaProvider>
            <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Home">
                <Stack.Screen name="Home" component={Home}/>
                <Stack.Screen name="Trip" component={Trip}/>
                <Stack.Screen name="AddTrip" component={AddTrip}/>
            </Stack.Navigator>
        </SafeAreaProvider>
    );
}
