import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import * as DB from "../database/databaseSqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import Home from "./screens/home";
import Trip from "./screens/trip";
import AddTrip from "./screens/addTrip";
import Expenses from "./screens/expenses";
import AddExpense from "./screens/addExpense";

const Stack = createNativeStackNavigator<ParamsList>();
const Tab = createBottomTabNavigator<ParamsList>();

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export type ParamsList = {
    TabNavigator: { tripId: number };
    
    Home: undefined;
    Details: { tripId: number }
    AddTrip: undefined;
    Expenses: { tripId: number };
    AddExpense: { tripId: number }
}

const db = openDatabaseSync("splitzy.db");

export default function Index() {
    useDrizzleStudio(db);

    return (
        <SafeAreaProvider>
            <SQLiteProvider databaseName="splitzy.db" onInit={DB.createTables}>
                <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Home">
                    <Stack.Screen name="Home" component={Home}/>
                    <Stack.Screen name="TabNavigator" component={TabNavigator}/>
                    <Stack.Screen name="AddTrip" component={AddTrip}/>
                    <Stack.Screen name="AddExpense" component={AddExpense}/>
                </Stack.Navigator>
            </SQLiteProvider>
        </SafeAreaProvider>
    );
}

type RouteTypes = RouteProp<ParamsList>;

function TabNavigator() {
    const route = useRoute<RouteTypes>();
    const tripId = route.params?.tripId;
    
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName="Details"
            screenOptions={{
                headerShown: false,
                animation: 'none',
                tabBarStyle: {
                    paddingBottom: insets.bottom,
                },
            }}
        >
            <Tab.Screen
                name="Details"
                component={Trip}
                initialParams={{tripId}}
                
            />
            <Tab.Screen
                name="Expenses"
                component={Expenses}
                initialParams={{tripId}}
            />
        </Tab.Navigator>
    )
}
