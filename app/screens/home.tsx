import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ParamsList } from "..";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { HorizontalGap, VerticalGap } from "@/components/gap";
import { deleteRelatedCurrencies, deleteRelatedPeople, deleteTrip } from "@/database/databaseSqlite";
import { GenericButton2 } from "@/components/buttons";
import { ConfirmDelete } from "@/components/confirmDelete";
import { Colours } from "@/components/colours";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Home">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Home() {
    const insets = useSafeAreaInsets();
    const homeStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            backgroundColor: Colours.title,
            flex: 1,
        }
    })
    return (
        <View style={homeStyles.container}>
            <StatusBar barStyle={'light-content'}/>
            <TopSection/>
            <MainBody/>
        </View>
    )
}

function TopSection() {
    const topSectionStyles = StyleSheet.create({
        container: {
            paddingHorizontal: 40,
            backgroundColor: Colours.title,
            height: 0.1 * windowHeight,
            justifyContent: 'center',
        },
        titleMessage: {
            fontSize: 45 / windowFontScale,
            fontWeight: 'bold',
            color: 'white',
            shadowOpacity: 0.1,
            shadowColor: '#000',
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
            backgroundColor: Colours.background, // Dark Gray (Not the same as in reference)
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
            borderBottomColor: Colours.border,
            borderBottomWidth: 2,
            height: 0.07 * windowHeight,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        titleText: {
            fontSize: 30 / windowFontScale,
            fontWeight: 'bold',
            color: Colours.textColor,
        },
    })

    function pressAddTrip() {
        navigation.navigate('AddTrip');
    }

    return (
        <View style={mainBodyStyles.container}>
            <View style={mainBodyStyles.tripContainer}>
                <Text style={mainBodyStyles.titleText}>Trips</Text>
                <TouchableOpacity onPress={pressAddTrip}>
                    <Ionicons name='add-outline' size={30} color={Colours.genericIcon}/>
                </TouchableOpacity>
            </View>
            <DisplayTrips/>
        </View>
    )
}


const tripStyles = StyleSheet.create({
    container: {
        height: 120,
        width: 0.95 * windowWidth,
        borderRadius: 10,
        paddingHorizontal: 20, 
        paddingVertical: 10,
        shadowOpacity: 0.6,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
        borderWidth: 0.1,
        backgroundColor: '#3C3E4B',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        width: 0.64 * windowWidth
    },
    tripName: {
        fontSize: 25,
        fontWeight: '600',
        color: Colours.textColor,
    },
    location: {
        fontSize: 17,
        color: Colours.textColor,
    },
    date: {
        fontSize: 15,
        color: Colours.textColor,
    }
})
function Trip({item, deleteItem} : {item: ItemEntity, deleteItem: (id: number) => void | Promise<void>}) {
    const db = useSQLiteContext();
    const { id, trip_name, location, start_date, end_date } = item;
    const [isVisible, setIsVisible] = useState(false);

    const navigation = useNavigation<NativeStackNavigatorTypes>();

    function editTrip() {

    }

    function pressDelete() {
        setIsVisible(true);
    }

    function confirmDelete() {
        deleteItem && deleteItem(id);
        setIsVisible(false);
    }

    function goToTrip() {
        navigation.navigate('TabNavigator', { tripId: id });
    }

    return (
        <View>
            <VerticalGap key={item.id} height={10}/>
            <TouchableOpacity style={tripStyles.container} activeOpacity={0.4}
                onPress={goToTrip}>
                <View style={tripStyles.textContainer}>
                    <Text style={tripStyles.tripName} numberOfLines={1} ellipsizeMode="tail">{trip_name}</Text>
                    <VerticalGap height={5}/>
                    <Text style={tripStyles.location} numberOfLines={1} ellipsizeMode="tail">{location}</Text>
                    <VerticalGap height={15}/>
                    <Text style={tripStyles.date}>{start_date} - {end_date}</Text>
                    <VerticalGap height={15}/>
                </View>
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity>
                            <GenericButton2 
                                text="Edit" colour={Colours.confirmButton} 
                                height={30} width={45} 
                                action={editTrip} fontsize={14} />
                        </TouchableOpacity>
                        <HorizontalGap width={8}/>
                        <TouchableOpacity onPress={pressDelete}>
                            <Ionicons name="trash-outline" size={28} color={Colours.cancel}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
            <ConfirmDelete isVisible={isVisible} setIsVisible={setIsVisible} confirm={confirmDelete}/>
        </View>
    )
}

interface ItemEntity {
    id: number
    trip_name: string,
    location: string,
    start_date: string,
    end_date: string,   
}
const displayTripsStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    internalContainer: {
        alignItems: 'center'
    }
})
function DisplayTrips() {
    const db = useSQLiteContext();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const [trips, setTrips] = useState<ItemEntity[]>([]);

    async function refetch(){
        await db.withExclusiveTransactionAsync(async () => {
            setTrips(
                await db.getAllAsync<ItemEntity>(
                    `SELECT * FROM trips`
                )
            );
        });
    }

    const refetchItems = useCallback(() => {
        refetch();
        console.log("Refetched");
    }, [db])

    useEffect(() => {
        refetchItems();

        const unsubscribe = navigation.addListener('focus', () => {
            refetchItems();
        });
        return unsubscribe;
    }, [navigation]);

    async function deleteItem(id: number) {
        console.log("Deleting:", id);
        await deleteTrip(db, id);
        await refetchItems();

        await deleteRelatedPeople(db, id);
        await deleteRelatedCurrencies(db, id);
    }

    return (
        <ScrollView style={displayTripsStyles.container}>
            <View style={displayTripsStyles.internalContainer}>
            {trips.map((item) => (
                <Trip key={item.id} item={item} deleteItem={deleteItem}/>
            ))}
            <VerticalGap height={40}/>
            </View>
        </ScrollView>
    )
}
