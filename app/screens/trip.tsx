import { Colours } from "@/components/colours";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { getRelatedCurrencies, getRelatedPeople } from "@/database/databaseSqlite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Details">;
type RouteTypes = RouteProp<ParamsList, "Details">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Trip() {
    const route = useRoute<RouteTypes>();
    const { tripId, tripName } = route.params;
    const insets = useSafeAreaInsets();
    const tripStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: Colours.title,
            flex: 1,
        }
    })
    return (
        <View style={tripStyles.container}>
            <StatusBar barStyle={'light-content'}/>
            <TopSection title={tripName}/>
            <MainBody tripId={tripId}/>
        </View>
    )
}

interface mainBodyTypes {
    tripId: number
}
interface PeopleTableTypes {
    id: number, 
    name: string, 
    weight: number, 
    trip_id: number
}
interface CurrencyTableTypes {
    id: number,
    currency_name: string,
    abbreviation: string,
    trip_id: number
}
function MainBody({tripId}: mainBodyTypes) {
    const db = useSQLiteContext();
    const [people, setPeople] = useState<PeopleTableTypes[]>([]);
    const [currencies, setCurrencies] = useState<CurrencyTableTypes[]>([]);

    async function getData() {
        const peopleData = await getRelatedPeople(db, tripId);
        setPeople(peopleData as PeopleTableTypes[]);

        const currencyData = await getRelatedCurrencies(db, tripId);
        setCurrencies(currencyData as CurrencyTableTypes[]);
    }

    useEffect(() => {
        getData();
    }, []);
    
    return (
        <View style={genericMainBodyStyles.outerContainer}>
        <ScrollView>
        <View style={genericMainBodyStyles.container}>
            <Text>{tripId}</Text>
            {people.map((person) => (
                <Person key={person.id} name={person.name} weight={person.weight}/>
            ))}
            {currencies.map((currency) => (
                <Currency key={currency.id} currencyName={currency.currency_name} abbreviation={currency.abbreviation}/>
            ))}
        </View>
        </ScrollView>
        </View>
    )
}

function Person({name, weight}: {name: string, weight: number}) {
    return (
        <View>
            <Text>{name} + {weight}</Text>
        </View>
    )
}

function Currency({currencyName, abbreviation}: {currencyName: string, abbreviation: string}) {
    return (
        <View>
            <Text>{currencyName} ({abbreviation})</Text>
        </View>
    )
}
