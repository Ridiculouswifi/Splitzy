import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./screens/home";
import Trip from "./screens/trip";
import AddTrip from "./screens/addTrip";

import { SQLiteProvider } from "expo-sqlite";
import * as DB from "../database/databaseSqlite";

const Stack = createNativeStackNavigator<ParamsList>();

export type ParamsList = {
    Home: undefined;
    Trip: { tripId: number }
    AddTrip: undefined;
}

export default function Index() {
    return (
        <SafeAreaProvider>
            <SQLiteProvider databaseName="splitzy.db" onInit={DB.createTables}>
                <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Home">
                    <Stack.Screen name="Home" component={Home}/>
                    <Stack.Screen name="Trip" component={Trip}/>
                    <Stack.Screen name="AddTrip" component={AddTrip}/>
                </Stack.Navigator>
            </SQLiteProvider>
        </SafeAreaProvider>
    );
}
