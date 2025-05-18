import { darkenHexColor, GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { ConfirmDelete } from "@/components/confirmDelete";
import { FilterModal } from "@/components/filterModal";
import { HorizontalGap, VerticalGap } from "@/components/gap";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { SearchBar } from "@/components/searchBar";
import { deleteExpense, getCurrency, getPerson, getRelatedPeople, updateExpenseStatus } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Expenses">;
type RouteTypes = RouteProp<ParamsList, "Expenses">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Expenses() {
    const route = useRoute<RouteTypes>();
    const { tripId } = route.params;
    
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
            <TopSection title="Trip"/>
            <MainBody tripId={tripId}/>
        </View>
    )
}

function MainBody({tripId}: {tripId: number}) {
    const navigation = useNavigation<NativeStackNavigatorTypes>();

    const [keyPhrase, setKeyPhrase] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    
    const mainBodyStyles = StyleSheet.create({
        expenseContainer: {
            flexDirection: 'column',
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderRadius: 15,
            borderBottomColor: Colours.border,
            borderBottomWidth: 2,
            width: windowWidth,
            alignItems: 'center',
            justifyContent: 'center',
        },
    })
    
    function goToAddExpense() {
        navigation.navigate("AddExpense", {tripId: tripId});
    }

    return (
        <KeyboardAvoidingView style={genericMainBodyStyles.outerContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={mainBodyStyles.expenseContainer}>
                <GenericButton
                    text="New Expense" 
                    colour={Colours.confirmButton}
                    textColour={Colours.textColor}
                    height={50} 
                    width={300}
                    fontsize={25} 
                    action={goToAddExpense}/>
                <VerticalGap height={10}/>
                <SearchBar keyPhrase={keyPhrase} setKeyPhrase={setKeyPhrase} openFilter={() => setFilterOpen(true)}/>
                <FilterModal isOpen={filterOpen} closeFilter={() => setFilterOpen(false)}/>
            </View>
            <DisplayExpenses tripId={tripId} keyPhrase={keyPhrase}/>
        </KeyboardAvoidingView>
    )
}

interface ExpenseTableTypes {
    id: number;
    name: string;
    payer_id: number;
    expense: number;
    currency_id: number;
    date: string;
    is_resolved: string;
    [key: string]: any;
}
interface ExpenseEntity {
    id: number;
    name: string;
    payer_id: number;
    expense: number;
    currency_id: number;
    date: Date;
    is_resolved: string;
    [key: string]: any;
}
interface PeopleTableTypes {
    id: number,
    name: string,
    weight: number,
    trip_id: number,
}
const displayExpensesStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: windowWidth,
    },
    internalContainer: {
        alignItems: 'center',
    },
})

function filter(expense: ExpenseEntity, keyPhrase: string, 
        startTime: number, compareStartTime: boolean,
        endTime: number, compareEndTime: boolean,
        payers: number[], comparePayer: boolean,
        currencies: number[], compareCurrencies: boolean): boolean {
    let matchPhrase =  keyPhrase == "" || expense.name.toLowerCase().includes(keyPhrase.toLowerCase());
    if (compareStartTime) {
        matchPhrase = matchPhrase || expense.date.getTime() >= startTime;
    }
    if (compareEndTime) {
        matchPhrase = matchPhrase || expense.date.getTime() <= endTime;
    }
    if (comparePayer) {
        matchPhrase = matchPhrase || payers.includes(expense.payer_id);
    }
    if (compareCurrencies) {
        matchPhrase = matchPhrase || currencies.includes(expense.currency_id);
    }
    return matchPhrase;
}

function DisplayExpenses({tripId, keyPhrase}: {tripId: number, keyPhrase: string}) {
    const db = useSQLiteContext ();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const [expenses, setExpenses] = useState<ExpenseEntity[]>([]);
    const [people, setPeople] = useState<PeopleTableTypes[]>([]);

    const tableName: string = "trip_" + tripId.toString();

    async function refetch(){
        await db.withExclusiveTransactionAsync(async () => {
                const data = await db.getAllAsync<ExpenseTableTypes>(`SELECT * FROM ${tableName}`);
                const peopleData = await getRelatedPeople(db, tripId) as PeopleTableTypes[];
                
                let expenses: ExpenseEntity[] = [];
                for (let i = 0; i < data.length; i++) {
                    const { id, name, payer_id, expense, currency_id, is_resolved, date, ...extraFields } = data[i];

                    let newEntry: ExpenseEntity = {
                        id, name, payer_id, 
                        expense, currency_id, is_resolved,
                        date: new Date(date), ...extraFields};

                    expenses = [...expenses, newEntry];
                }
                expenses = [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime());

                setExpenses(expenses);
                setPeople(peopleData);
        });
    }

    const refetchItems = useCallback(() => {
        refetch();
        console.log("Expenses Refetched");
    }, [db])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetchItems();
        });
        return unsubscribe;
    }, [navigation]);

    async function deleteItem(id: number, tripId: number) {
        console.log("Deleting:", id);
        await deleteExpense(db, id, tripId);
        await refetchItems();
    }
    
    return (
        <ScrollView style={displayExpensesStyles.container}>
            <View style={displayExpensesStyles.internalContainer}>
                {expenses.map((expense) => {
                    if (filter(expense, keyPhrase, 0, false, 0, false, [], false, [], false)) {
                        return <Expense key={expense.id} item={expense} deleteExpense={deleteItem} tripId={tripId} people={people}/>;
                    }
                    return null;
                }
                )}
                <VerticalGap height={10}/>
            </View>
        </ScrollView>
    )
}

interface PeopleTableTypes {
    id: number,
    name: string,
    weight: number,
    trip_id: number,
}
interface CurrencyTableTypes {
    id: number,
    currency_name: string,
    abbreviation: string,
    trip_id: number
}
const expenseStyles = StyleSheet.create({
    container: {
        width: 0.95 * windowWidth,
        borderRadius: 10,
        paddingHorizontal: 20, 
        paddingVertical: 10,
        paddingBottom: 20,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
        borderWidth: 0.1,
        backgroundColor: Colours.backgroundV2,
    },
    upper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        width: 0.45 * windowWidth,
    },
    rightContainer: {
        alignItems: 'flex-end',
    },
    expenseName: {
        fontSize: 25,
        fontWeight: '600',
        color: Colours.textColor,
    },
    payer: {
        fontSize: 17,
        color: Colours.textColor,
    },
    date: {
        fontSize: 15,
        color: Colours.textColor,
    },
    amount: {
        fontSize: 25,
        fontWeight: '600',
        color: Colours.textColor,
    },
    abbreviation: {
        fontSize: 15,
        fontWeight: '500',
        color: Colours.textColor,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    showMoreContainer: {
        height: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        alignSelf: 'center',
        top: 90,
    },
    showMoreText: {
        color: Colours.placeholder,
        fontSize: 13,
        width: 75,
        fontWeight: '600',
    },
})
function Expense({item, deleteExpense, tripId, people}: {item: ExpenseEntity, deleteExpense: (id: number, tripId: number) => void | Promise<void>, tripId: number, people: PeopleTableTypes[]}) {
    const db = useSQLiteContext ();

    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [expandMessage, setExpandMessage] = useState<boolean>(false);
    const [payer, setPayer] = useState<string>('');
    const [abbreviation, setAbbreviation] = useState<string>('');
    const [isResolved, setIsResolved] = useState<string>('0');

    // Parameters for collapsible animation
    const startHeight: number = 90;
    const startTop: number = 100;
    const [extension, setExtension] = useState<number>(0);
    useEffect(() => {
        setExtension(10 +           // Height of the gap between main upper content and collpasible content
            (people.length * 35));  // Height of each member type
    }, [people])
    const height = useSharedValue(startHeight);
    const top = useSharedValue(startTop);
    const duration: number = 300;

    // Parameters for chevron animation
    const degree = useSharedValue('0deg');

    async function getText() {
        const payerData = await getPerson(db, item.payer_id) as PeopleTableTypes[];
        setPayer(payerData[0].name);

        const currencyData = await getCurrency(db, item.currency_id) as CurrencyTableTypes[];
        setAbbreviation(currencyData[0].abbreviation);

        setIsResolved(item.is_resolved);
    }

    useEffect(() => {
        getText();
    }, [])

    function pressDelete() {
        setIsVisible(true);
    }

    function confirmDelete() {
        deleteExpense && deleteExpense(item.id, tripId);
        setIsVisible(false);
    }

    function resolved() {
        setIsResolved(isResolved == '0' ? '1' : '0');
        updateExpenseStatus(db, item.id, tripId, isResolved == '0' ? '1' : '0');
    }

    function expand() {
        if (!isExpanded) {
            height.value = withTiming(startHeight + extension, {duration: duration});
            degree.value = withTiming('180deg', {duration: duration});
            top.value = withTiming(startTop + extension, {duration: duration});
            setIsExpanded(true);
        } else {
            height.value = withTiming(startHeight, {duration: duration});
            degree.value = withTiming('0deg', {duration: duration});
            top.value = withTiming(startTop, {duration: duration});
            setTimeout(() => setIsExpanded(false), duration);
        }
        setExpandMessage(!expandMessage);
    }

    const expandStyle = useAnimatedStyle(() => ({
        height: height.value
    }))

    const rotationStyle = useAnimatedStyle(() => ({
        transform: [{rotate: degree.value}]
    }))

    const topStyle = useAnimatedStyle(() => ({
        top: top.value
    }))
    
    return (
        <View>
            <VerticalGap key={item.id} height={10}/>
            <TouchableOpacity style={[expenseStyles.container]} activeOpacity={0.65} onPress={expand}>
                <Animated.View style={[expandStyle, {overflow: 'hidden'}]}>
                <View style={[expenseStyles.upper]}>
                    <View style={expenseStyles.textContainer}>
                        <Text style={expenseStyles.expenseName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                        <VerticalGap height={5}/>
                        <Text style={expenseStyles.payer}>By: {payer}</Text>
                        <VerticalGap height={10}/>
                        <Text style={expenseStyles.date}>{item.date?.toLocaleDateString()}</Text>
                        <VerticalGap height={5}/>
                    </View>
                    <View style={expenseStyles.rightContainer}>
                        <View style={expenseStyles.buttonsContainer}>
                            <GenericButton
                                text="Resolved" 
                                height={30} 
                                width={80} 
                                fontsize={14}
                                colour={isResolved == '0' ? Colours.confirmButton : '#808080'} 
                                action={resolved} 
                                textColour={isResolved == '0' ? Colours.textColor : '#000000'}/>
                            <HorizontalGap width={10}/>
                            <TouchableOpacity onPress={pressDelete}>
                                <Ionicons name="trash-outline" size={28} color={Colours.cancel}/>
                            </TouchableOpacity>
                        </View>
                        <VerticalGap height={15}/>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={expenseStyles.amount}>{item.expense.toFixed(2)}</Text>
                            <Text style={expenseStyles.abbreviation}> {abbreviation}</Text>
                        </View>
                        <VerticalGap height={1}/>
                    </View>
                </View>
                    {isExpanded && (
                        <View>
                            <VerticalGap height={5}/>
                            {people.map((person) => (
                                <Member key={person.id} name={person.name} weight={item["person_" + person.id.toString()]}/>
                            ))}
                            <VerticalGap height={5}/>
                        </View>
                    )}
                </Animated.View>
                <VerticalGap height={5}/>
                <Animated.View style={[expenseStyles.showMoreContainer, topStyle]}>
                    <Text style={expenseStyles.showMoreText}>{expandMessage ? 'Show Less' : 'Show More'}</Text>
                    <Animated.View style={rotationStyle}>
                        <Ionicons name="chevron-down" color={Colours.placeholder} size={20}/>
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
            <ConfirmDelete isVisible={isVisible} setIsVisible={setIsVisible} confirm={confirmDelete}/>
        </View>
    )
}


const memberStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: 0.95 * windowWidth - 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 35,
    },
    textContainer: {
        height: 30,
        width: 150,
        backgroundColor: darkenHexColor(Colours.backgroundV2, 1.2),
        borderRadius: 5,
        justifyContent: 'center',
        paddingHorizontal: 10
    },
    text: {
        color: Colours.textColor,
        fontSize: 17,
    },
})
function Member({name, weight}: {name: string, weight: number}) {
    return (
        <View style={memberStyles.container}>
            <View style={memberStyles.textContainer}>
                <Text style={memberStyles.text}>{name}</Text>
            </View>
            <View style={memberStyles.textContainer}>
                <Text style={memberStyles.text}>{weight}</Text>
            </View>
        </View>
    )
}
