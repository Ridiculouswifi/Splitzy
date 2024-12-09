import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { VerticalGap } from "@/components/gap";
import { deleteTrip } from "@/database/databaseSqlite";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Home">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Home() {
    const insets = useSafeAreaInsets();
    const homeStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: 'skyblue',
            flex: 1,
        }
    })
    return (
        <View style={homeStyles.container}>
            <StatusBar barStyle={'dark-content'}/>
            <TopSection/>
            <MainBody/>
        </View>
    )
}

function TopSection() {
    const topSectionStyles = StyleSheet.create({
        container: {
            paddingHorizontal: 40,
            backgroundColor: 'skyblue',
            height: 0.1 * windowHeight,
            justifyContent: 'center',
        },
        titleMessage: {
            fontSize: 45 / windowFontScale,
            fontWeight: 'bold',
        },
    })
    return (
        <View style={topSectionStyles.container}>
            <Text style={topSectionStyles.titleMessage}>Splitzy</Text>
        </View>
    )
}

function MainBody() {
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const mainBodyStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'whitesmoke',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingTop: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2, // subtler shadow
            shadowRadius: 2,
            elevation: 2, // for Android shadow
        },
        tripContainer: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            borderRadius: 15,
            borderBottomColor: 'darkgrey',
            borderBottomWidth: 2,
            height: 0.07 * windowHeight,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        titleText: {
            fontSize: 30 / windowFontScale,
            fontWeight: 'bold'
        },
    })

    function pressAddTrip() {
        navigation.navigate('AddTrip', {name: 'AddTrip'});
    }

    return (
        <View style={mainBodyStyles.container}>
            <View style={mainBodyStyles.tripContainer}>
                <Text style={mainBodyStyles.titleText}>Trips</Text>
                <TouchableOpacity onPress={pressAddTrip}>
                    <Ionicons name='add-outline' size={30} color='black'/>
                </TouchableOpacity>
            </View>
            <DisplayTrips/>
        </View>
    )
}


const tripStyles = StyleSheet.create({
    container: {
        height: 100,
        width: windowWidth,
        borderWidth: 2,
    },
    tripName: {
        color: 'black',
        fontSize: 25,
    },
})
function Trip({item, deleteItem} : {item: ItemEntity, deleteItem: (id: number) => void | Promise<void>}) {
    const db = useSQLiteContext();
    const { id, tripName, location, startDate, endDate } = item;
    
    return (
        <View style={tripStyles.container}>
            <Text style={tripStyles.tripName}>{id}</Text>
            <Text style={tripStyles.tripName}>Name</Text>
            <VerticalGap height={15}/>
            <TouchableOpacity onPress={() => deleteItem && deleteItem(id)}>
                <Text>Delete</Text>
            </TouchableOpacity>
        </View>
    )
}

interface ItemEntity {
    id: number
    tripName: string,
    location: string,
    startDate: string,
    endDate: string,   
}
function DisplayTrips() {
    const db = useSQLiteContext();
    const [trips, setTrips] = useState<ItemEntity[]>([]);

    const refetchItems = useCallback(() => {
        async function refetch(){
            await db.withExclusiveTransactionAsync(async () => {
                setTrips(
                    await db.getAllAsync<ItemEntity>(
                        `SELECT * FROM trips`
                    )
                );
            });
        }
        refetch();
    }, [db])

    useEffect(() => {
        refetchItems();
    }, []);

    async function deleteItem(id: number) {
        console.log("Deleting:", id);
        await deleteTrip(db, id);
        await refetchItems();
    }

    return (
        <View>
            {trips.map((item) => (
                <Trip key={item.id} item={item} deleteItem={deleteItem}/>
            ))}
        </View>
    )
}
