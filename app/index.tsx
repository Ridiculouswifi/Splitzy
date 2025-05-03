import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import * as DB from "../database/databaseSqlite";

import { Colours } from "@/components/colours";
import { Ionicons } from "@expo/vector-icons";

import AddExpense from "./screens/addExpense";
import AddTransaction from "./screens/addTransaction";
import AddTrip from "./screens/addTrip";
import Expenses from "./screens/expenses";
import Home from "./screens/home";
import Overview from "./screens/overview";
import Transactions from "./screens/transactions";
import Trip from "./screens/trip";

const Stack = createNativeStackNavigator<ParamsList>();
const Tab = createBottomTabNavigator<ParamsList>();

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export type ParamsList = {
  TabNavigator: { tripId: number };
  
  Home: undefined;
  Details: { tripId: number };
  AddTrip: undefined;
  Expenses: { tripId: number };
  AddExpense: { tripId: number };
  Overview: { tripId: number };
  Transactions: { tripId: number };
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
                  <Stack.Screen name="TabNavigator" component={TabNavigator}/>
                  <Stack.Screen name="AddTrip" component={AddTrip}/>
                  <Stack.Screen name="AddExpense" component={AddExpense}/>
                  <Stack.Screen name="AddTransaction" component={AddTransaction}/>
              </Stack.Navigator>
          </SQLiteProvider>
      </SafeAreaProvider>
  );
}

type RouteTypes = RouteProp<ParamsList>;

const active = 'dodgerblue';
const inactive = 'grey';
const size = 23;

function TabNavigator() {
    const route = useRoute<RouteTypes>();
    const tripId = route.params?.tripId;
    
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
                initialParams={{tripId}}
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
                initialParams={{tripId}}
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
                initialParams={{tripId}}
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
                component={Trip}
                initialParams={{tripId}}
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
