import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import * as DB from "../database/databaseSqlite";


import AddExpense from "./screens/addExpense";
import AddTransaction from "./screens/addTransaction";
import AddTrip from "./screens/addTrip";
import Home from "./screens/home";
import Trip from "./screens/trip";

const Stack = createNativeStackNavigator<ParamsList>();
const Tab = createBottomTabNavigator<ParamsList>();

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export type ParamsList = {
    TabNavigator: { tripId: number, tripName: string };
    Trip: { tripId: number, tripName: string };
    
    Home: { poppedProgrammatically: boolean };
    Details: { tripId: number, tripName: string };
    AddTrip: undefined;
    Expenses: { tripId: number, tripName: string };
    AddExpense: { tripId: number };
    Overview: { tripId: number, tripName: string };
    Transactions: { tripId: number, tripName: string };
    AddTransaction: { tripId: number };
}

const db = openDatabaseSync("splitzy.db");

export default function Index() {
    useDrizzleStudio(db);

    return (
        <SafeAreaProvider>
            <SQLiteProvider databaseName="splitzy.db" onInit={DB.createTables}>
                <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Home">
                    <Stack.Screen name="Home" component={Home}/>
                    <Stack.Screen name="Trip" component={Trip} options={{animation: 'fade'}}/>
                    <Stack.Screen name="AddTrip" component={AddTrip}/>
                    <Stack.Screen name="AddExpense" component={AddExpense}/>
                    <Stack.Screen name="AddTransaction" component={AddTransaction}/>
                </Stack.Navigator>
            </SQLiteProvider>
        </SafeAreaProvider>
    );
}

type RouteTypes = RouteProp<ParamsList, 'Overview'>;

const active = 'dodgerblue';
const inactive = 'grey';
const size = 23;

/*
function TabNavigator() {
    const route = useRoute<RouteTypes>();
    const tripId = route.params?.tripId;
    const tripName = route.params?.tripName;
    
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName="Overview"
            screenOptions={{
                headerShown: false,
                animation: 'none',
                tabBarStyle: {
                    paddingBottom: insets.bottom,
                    backgroundColor: Colours.backgroundV2,
                    borderTopColor: Colours.placeholder,
                    borderTopWidth: 2,
                },
                tabBarActiveTintColor: active,
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: 600,
                },
            }}
        >
            <Tab.Screen
                name="Overview"
                component={Overview}
                initialParams={{tripId, tripName}}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Ionicons name="newspaper-outline" 
                                color={focused ? active : inactive}
                                size={size}/>
                    )
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={Transactions}
                initialParams={{tripId, tripName}}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Ionicons name="arrow-redo-outline" 
                                color={focused ? active : inactive}
                                size={size}/>
                    )
                }}
            />
            <Tab.Screen
                name="Expenses"
                component={Expenses}
                initialParams={{tripId, tripName}}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Ionicons name="card-outline" 
                                color={focused ? active : inactive}
                                size={size}/>
                    )
                }}
            />
            <Tab.Screen
                name="Details"
                component={Details}
                initialParams={{tripId, tripName}}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Ionicons name="menu" 
                                color={focused ? active : inactive}
                                size={size}/>
                    )
                }}
            />
        </Tab.Navigator>
    )
}
*/
