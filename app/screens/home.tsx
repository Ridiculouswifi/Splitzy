import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { ConfirmDelete } from "@/components/confirmDelete";
import { getDateKey } from "@/components/convertDate";
import { CheckBox, FilterModal } from "@/components/filterModal";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import { SearchBar } from "@/components/searchBar";
import { deleteRelatedCurrencies, deleteRelatedPeople, deleteTrip } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

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

    // Variables for Filter
    const [keyPhrase, setKeyPhrase] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const defaultStart: Date = new Date();
    defaultStart.setHours(0, 0, 0, 0);

    const defaultEnd: Date = new Date();
    defaultEnd.setHours(23, 59, 59, 999);

    const [startTime, setStartTime] = useState<Date>(defaultStart);
    const [endTime, setEndTime] = useState<Date>(defaultEnd);
    const [compareStartTime, setCompareStartTime] = useState<boolean>(false);
    const [compareEndTime, setCompareEndTime] = useState<boolean>(false);

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
            paddingHorizontal: 20,
            borderRadius: 15,
            borderBottomColor: Colours.border,
            borderBottomWidth: 2,
        },
        tripTop: {
            flexDirection: 'row',
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
                <View style={mainBodyStyles.tripTop}>
                    <Text style={mainBodyStyles.titleText}>Trips</Text>
                    <GenericButton 
                        text="New"
                        colour={Colours.confirmButton}
                        textColour={Colours.textColor}
                        height={40} 
                        width={80}
                        fontsize={23}
                        action={pressAddTrip}/>
                </View>
                <VerticalGap height={10}/>
                <SearchBar keyPhrase={keyPhrase} setKeyPhrase={setKeyPhrase} openFilter={() => setFilterOpen(true)}/>
                <FilterModal isOpen={filterOpen} closeFilter={() => setFilterOpen(false)}
                child={
                    <Filter
                        compareStartTime={compareStartTime} setCompareStartTime={setCompareStartTime}
                        compareEndTime={compareEndTime} setCompareEndTime={setCompareEndTime}
                        startTime={startTime} setStartTime={setStartTime}
                        endTime={endTime} setEndTime={setEndTime}
                    />    
                }/>
                <VerticalGap height={10}/>
            </View>
            <DisplayTrips keyPhrase={keyPhrase}
                startTime={startTime.getTime()} compareStartTime={compareStartTime}
                endTime={endTime.getTime()} compareEndTime={compareEndTime}
            />
        </View>
    )
}

interface FilterProps {
    compareStartTime: boolean
    setCompareStartTime: (variable: boolean) => void
    compareEndTime: boolean
    setCompareEndTime: (variable: boolean) => void

    startTime: Date
    setStartTime: (variable: Date) => void
    endTime: Date
    setEndTime: (variable: Date) => void
}
const filterStyles = StyleSheet.create({
    container: {
        borderWidth: 0,
    },
    categoryContainer: {
        width: '100%',
        overflow: 'hidden',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        width: '100%',
        overflow: 'hidden',
        alignItems: 'center',
    },
    categoryText: {
        color: Colours.textColor,
        fontSize: 20,
        fontWeight: '600',
    },
})
function Filter(props: FilterProps) {
    function setStart(event: DateTimePickerEvent, date?: Date | undefined) {
        if (event.type == "set") {
            date?.setHours(0, 0, 0, 0);
            props.setStartTime(date ?? new Date());
        }
    }

    function setEnd(event: DateTimePickerEvent, date?: Date | undefined) {
        if (event.type == "set") {
            date?.setHours(23, 59, 59, 999);
            props.setEndTime(date ?? new Date());
        }
    }
    
    return (
        <ScrollView style={filterStyles.container} bounces={false} showsVerticalScrollIndicator={false}>
            <View style={filterStyles.categoryContainer}>
                <View style={filterStyles.itemContainer}>
                    <CheckBox isCheck={props.compareStartTime} setIsCheck={props.setCompareStartTime}/>
                    <HorizontalGap width={10}/>
                    <Text style={filterStyles.categoryText}>{'Start\nDate'}</Text>
                    <RNDateTimePicker value={props.startTime} onChange={setStart}/>
                </View>
            </View>

            <Divider colour={Colours.backgroundV2}/>

            <View style={filterStyles.categoryContainer}>
                <View style={filterStyles.itemContainer}>
                    <CheckBox isCheck={props.compareEndTime} setIsCheck={props.setCompareEndTime}/>
                    <HorizontalGap width={10}/>
                    <Text style={filterStyles.categoryText}>{'End\nDate'}</Text>
                    <RNDateTimePicker value={props.endTime} onChange={setEnd}/>
                </View>
            </View>
        </ScrollView>
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
        navigation.navigate('TabNavigator', { tripId: id, tripName: trip_name });
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
                    <Text style={tripStyles.date}>{start_date?.toLocaleDateString()} - {end_date?.toLocaleDateString()}</Text>
                    <VerticalGap height={15}/>
                </View>
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity>
                            <GenericButton
                                text="Edit" 
                                colour={Colours.confirmButton} 
                                textColour={Colours.textColor}
                                height={30} 
                                width={45} 
                                action={editTrip} 
                                fontsize={14} />
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

interface ItemTableTypes {
    id: number
    trip_name: string,
    location: string,
    start_date: string,
    end_date: string,   
}
interface ItemEntity {
    id: number
    trip_name: string,
    location: string,
    start_date: Date,
    end_date: Date,   
}
const displayTripsStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    internalContainer: {
        alignItems: 'center'
    }
})
function DisplayTrips({keyPhrase, startTime, compareStartTime, endTime, compareEndTime}: 
    {keyPhrase: string, startTime: number, compareStartTime: boolean, endTime: number, compareEndTime: boolean}) {
    const db = useSQLiteContext();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const [trips, setTrips] = useState<ItemEntity[]>([]);

    async function refetch(){
        await db.withExclusiveTransactionAsync(async () => {
            const data = await db.getAllAsync<ItemTableTypes>(`SELECT * FROM trips`);

            let trips: ItemEntity[] = [];
            for (let i = 0; i < data.length; i++) {
                let newEntry: ItemEntity = {id: data[i].id, trip_name: data[i].trip_name, location: data[i].location,
                        start_date: new Date(data[i].start_date), end_date: new Date(data[i].end_date)};
                trips = [...trips, newEntry];
            }

            // Sorting it by start_date then by end_date
            trips = [...trips].sort((a, b) => {
                const startB = getDateKey(b.start_date);
                const startA = getDateKey(a.start_date);
                if (startA !== startB) return startB.localeCompare(startA); // DESC

                const endB = getDateKey(b.end_date);
                const endA = getDateKey(a.end_date);
                return endB.localeCompare(endA); // DESC
            })

            setTrips(trips);
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
            {trips.map((item) => {
                if (filter(item, keyPhrase, 
                        startTime, compareStartTime, 
                        endTime, compareEndTime,)) {
                    return <Trip key={item.id} item={item} deleteItem={deleteItem}/>;
                }
                return null;
            })}
            <VerticalGap height={40}/>
            </View>
        </ScrollView>
    )
}

function filter(expense: ItemEntity, keyPhrase: string,
        startTime: number, compareStartTime: boolean,
        endTime: number, compareEndTime: boolean ): boolean {
    let matchPhrase: boolean = keyPhrase == "" || expense.trip_name.toLowerCase().includes(keyPhrase.toLowerCase()) || expense.location.toLowerCase().includes(keyPhrase.toLowerCase());
    if (compareStartTime) {
        matchPhrase = matchPhrase && expense.start_date.getTime() >= startTime;
    }
    if (compareEndTime) {
        matchPhrase = matchPhrase && expense.end_date.getTime() <= endTime;
    }
    return matchPhrase;
}
