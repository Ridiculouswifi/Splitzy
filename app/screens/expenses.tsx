import { darkenHexColor, GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { ConfirmDelete } from "@/components/confirmDelete";
import { CheckBox, FilterModal } from "@/components/filterModal";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import { genericMainBodyStyles } from "@/components/screenTitle";
import { SearchBar } from "@/components/searchBar";
import { deleteExpense, getCurrency, getPerson, getRelatedCurrencies, getRelatedPeople, updateExpenseStatus } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ParamsList } from "..";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Expenses">;
type BottomTabNavigatorTypes = BottomTabNavigationProp<ParamsList, "Expenses">;
type RouteTypes = RouteProp<ParamsList, "Expenses">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Expenses({tripId, isActive, isClose, animationTime}: {tripId: number, isActive: boolean, isClose: boolean, animationTime: number}) {
    const navigation = useNavigation<BottomTabNavigatorTypes>();
    const db = useSQLiteContext ();

    const [peopleList, setPeopleList] = useState<PeopleTableTypes[]>([]);
    const [currenciesList, setCurrenciesList] = useState<CurrencyTableTypes[]>([]);

    const translate = useSharedValue(windowHeight);

    const defaultStart: Date = new Date();
    defaultStart.setHours(0, 0, 0, 0);

    const defaultEnd: Date = new Date();
    defaultEnd.setHours(23, 59, 59, 999);

    // Variables for the Filter
    const [keyPhrase, setKeyPhrase] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const [startTime, setStartTime] = useState<Date>(defaultStart);
    const [endTime, setEndTime] = useState<Date>(defaultEnd);
    const [payers, setPayers] = useState<number[]>([]);
    const [currencies, setCurrencies] = useState<number[]>([]);

    const [compareStartTime, setCompareStartTime] = useState<boolean>(false);
    const [compareEndTime, setCompareEndTime] = useState<boolean>(false);
    const [comparePayer, setComparePayer] = useState<boolean>(false);
    const [compareCurrency, setCompareCurrency] = useState<boolean>(false);

    // Placed here to avoid resetting values when re-rendering the filter
    const [payerChecks, setPayerChecks] = useState<boolean[]>(Array(peopleList.length).fill(false));
    const [currencyChecks, setCurrencyChecks] = useState<boolean[]>(Array(currenciesList.length).fill(false));

    async function fetchData() {
        const peopleData = await getRelatedPeople(db, tripId) as PeopleTableTypes[];
        const currenciesData = await getRelatedCurrencies(db, tripId) as CurrencyTableTypes[];

        setPeopleList(peopleData);
        setCurrenciesList(currenciesData);
    }

    useEffect(() => {
        fetchData();
    }, []);
    
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

    useEffect(() => {
        if (!isClose) {
            translate.value = withTiming(0, {duration: animationTime});
        } else {
            translate.value = withTiming(windowHeight, {duration: animationTime});
        }
    }, [isClose])

    const expandStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translate.value}]
    }))

    return (
        <Animated.View style={[genericMainBodyStyles.outerContainer, expandStyle, {position: 'absolute'}]}>
        <KeyboardAvoidingView style={{flex: 1}}
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
                <SearchBar keyPhrase={keyPhrase} setKeyPhrase={setKeyPhrase} openFilter={() => {setFilterOpen(true)}}/>
            </View>
            <DisplayExpenses tripId={tripId} keyPhrase={keyPhrase} people={peopleList} isActive={isActive}
                startTime={startTime.getTime()} compareStartTime={compareStartTime}
                endTime={endTime.getTime()} compareEndTime={compareEndTime}
                payers={payers} comparePayers={comparePayer}
                currencies={currencies} compareCurrencies={compareCurrency}
            />
            <FilterModal isOpen={filterOpen} closeFilter={() => {setFilterOpen(false)}} 
            child={
                <Filter tripId={tripId} peopleList={peopleList} currenciesList={currenciesList}
                    compareStartTime={compareStartTime} setCompareStartTime={setCompareStartTime}
                    compareEndTime={compareEndTime} setCompareEndTime={setCompareEndTime}
                    comparePayer={comparePayer} setComparePayer={setComparePayer}
                    compareCurrency={compareCurrency} setCompareCurrency={setCompareCurrency}
                    payerChecks={payerChecks} setPayerChecks={setPayerChecks}
                    currencyChecks={currencyChecks} setCurrencyChecks={setCurrencyChecks}
                    startTime={startTime} setStartTime={setStartTime}
                    endTime={endTime} setEndTime={setEndTime}
                    setPayers={setPayers}
                    setCurrencies={setCurrencies}
                />
            }/>
        </KeyboardAvoidingView>
        </Animated.View>
    )
}

interface FilterProps {
    tripId: number
    peopleList: PeopleTableTypes[]
    currenciesList: CurrencyTableTypes[]

    compareStartTime: boolean
    setCompareStartTime: (variable: boolean) => void
    compareEndTime: boolean
    setCompareEndTime: (variable: boolean) => void
    comparePayer: boolean
    setComparePayer: (variable: boolean) => void
    compareCurrency: boolean
    setCompareCurrency: (variable: boolean) => void

    payerChecks: boolean[]
    setPayerChecks: (variable: boolean[]) => void
    currencyChecks: boolean[]
    setCurrencyChecks: (variable: boolean[]) => void

    startTime: Date
    setStartTime: (variable: Date) => void
    endTime: Date
    setEndTime: (variable: Date) => void
    setPayers: (variable: number[]) => void
    setCurrencies: (variable: number[]) => void
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

            <Divider colour={Colours.backgroundV2}/>

            <View style={filterStyles.categoryContainer}>
                <View style={filterStyles.itemContainer}>
                    <CheckBox isCheck={props.comparePayer} setIsCheck={props.setComparePayer}/>
                    <HorizontalGap width={10}/>
                    <Text style={filterStyles.categoryText}>{'Payers'}</Text>
                </View>
                <MappedFilter list={props.peopleList} setResult={props.setPayers}
                    checks={props.payerChecks} setChecks={props.setPayerChecks}/>
            </View>

            <Divider colour={Colours.backgroundV2}/>

            <View style={filterStyles.categoryContainer}>
                <View style={filterStyles.itemContainer}>
                    <CheckBox isCheck={props.compareCurrency} setIsCheck={props.setCompareCurrency}/>
                    <HorizontalGap width={10}/>
                    <Text style={filterStyles.categoryText}>{'Currencies'}</Text>
                </View>
                <MappedFilter list={props.currenciesList} setResult={props.setCurrencies}
                    checks={props.currencyChecks} setChecks={props.setCurrencyChecks}/>
            </View>
        </ScrollView>
    )
}

const payerFilterStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 35,
    },
    itemContainer: {
        flexDirection: 'row',
    },
    optionContainer: {
        backgroundColor: Colours.backgroundV2,
        width: '100%',
        justifyContent: 'center',
        borderRadius: 5,
        paddingHorizontal: 7
    },
    optionText: {
        color: Colours.textColor,
        fontWeight: '500',
        fontSize: 17,
        overflow: 'scroll',
    },
})
function MappedFilter({list, checks, setChecks, setResult}: {list: PeopleTableTypes[] | CurrencyTableTypes[], checks: boolean[], setChecks: (variable: boolean[]) => void, setResult: (variable: number[]) => void}) {
    useEffect(() => {
        let payers: number[] = [];
        for (let i = 0; i < list.length; i++) {
            if (checks[i]) {
                payers = [...payers, list[i].id];
            }
        }
        setResult(payers);
    }, [checks])
    
    return (
        <View style={payerFilterStyles.container}>
            {list.map((item, index) => (
                <View key={item.id}>
                    <VerticalGap height={5}/>
                    <View style={payerFilterStyles.itemContainer}>
                        <CheckBox isCheck={checks[index]} setIsCheck={(variable: boolean) => {
                            let placeHolder = [...checks];
                            placeHolder[index] = variable;
                            setChecks(placeHolder);
                        }}/>
                        <HorizontalGap width={10}/>
                        <View style={payerFilterStyles.optionContainer}>
                            <Text style={payerFilterStyles.optionText}>{'name' in item ? item.name : item.abbreviation}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
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
        currencies: number[], compareCurrency: boolean): boolean {
    let matchPhrase =  keyPhrase == "" || expense.name.toLowerCase().includes(keyPhrase.toLowerCase());
    if (compareStartTime) {
        matchPhrase = matchPhrase && expense.date.getTime() >= startTime;
    }
    if (compareEndTime) {
        matchPhrase = matchPhrase && expense.date.getTime() <= endTime;
    }
    if (comparePayer) {
        matchPhrase = matchPhrase && payers.includes(expense.payer_id);
    }
    if (compareCurrency) {
        matchPhrase = matchPhrase && currencies.includes(expense.currency_id);
    }
    return matchPhrase;
}

interface DisplayExpensesProps {
    tripId: number 
    keyPhrase: string
    people: PeopleTableTypes[]

    isActive: boolean

    startTime: number
    compareStartTime: boolean
    endTime: number
    compareEndTime: boolean
    payers: number[]
    comparePayers: boolean
    currencies: number[]
    compareCurrencies: boolean
}
function DisplayExpenses(props: DisplayExpensesProps) {
    const db = useSQLiteContext ();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const [expenses, setExpenses] = useState<ExpenseEntity[]>([{id: 0, name: "", payer_id: 0, expense: 0, currency_id: 0, date: new Date(), is_resolved: ""}]);

    const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(true);
    const [toShow, setToShow] = useState<boolean[]>([]);

    const tableName: string = "trip_" + props.tripId.toString();

    async function refetch(){
        await db.withExclusiveTransactionAsync(async () => {
                const data = await db.getAllAsync<ExpenseTableTypes>(`SELECT * FROM ${tableName}`);
                
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
        });
    }

    const refetchItems = useCallback(() => {
        refetch();
        console.log("Expenses Refetched");
    }, [db])

    useEffect(() => {
        if (props.isActive) {
            refetchItems();
        }
        const unsubscribe = navigation.addListener('focus', () => {
            refetchItems();
        });
        return unsubscribe;
    }, [navigation]);

    // Check expenses are pulled before rendering the expense module
    useEffect(() => {
        if (expenses.length == 0 || expenses[0].id != 0) {
            setIsLoadingExpenses(false);
            setToShow(Array(expenses.length).fill(true));
        }
    }, [expenses])

    async function deleteItem(id: number, tripId: number) {
        console.log("Deleting:", id);
        await deleteExpense(db, id, tripId);
        await refetchItems();
    }

    useEffect(() => {
        let toShowCopy: boolean[] = [...toShow];
        for (let i = 0; i < expenses.length; i++) {
            toShowCopy[i] = filter(expenses[i], props.keyPhrase, 
                            props.startTime, props.compareStartTime, 
                            props.endTime, props.compareEndTime, 
                            props.payers, props.comparePayers, 
                            props.currencies, props.compareCurrencies)
        }
        setToShow(toShowCopy);
    }, [props.keyPhrase, 
        props.startTime, props.compareStartTime, 
        props.endTime, props.compareEndTime, 
        props.payers, props.comparePayers, 
        props.currencies, props.compareCurrencies])
    
    return (
        <ScrollView style={displayExpensesStyles.container} showsVerticalScrollIndicator={false}>
            <View style={displayExpensesStyles.internalContainer}>
                <VerticalGap height={5}/>
                {!isLoadingExpenses && expenses.map((expense, index) => {
                    return <Expense key={expense.id} item={expense} deleteExpense={deleteItem} tripId={props.tripId} people={props.people} toShow={toShow[index]}/>;
                }
                )}
                <VerticalGap height={5}/>
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
        height: '100%',
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

    },
    textContainer: {
        minWidth: 80,
        flex: 1,
    },
    expenseName: {
        fontSize: 25,
        fontWeight: '600',
        color: Colours.textColor,
        width: 0.45 * windowWidth,
        flex: 1,
    },
    payer: {
        fontSize: 17,
        color: Colours.textColor,
        width: '100%',
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
    },
    showMoreContainer: {
        height: 30,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        alignSelf: 'center',
        width: '100%',
        backgroundColor: Colours.backgroundV2,
    },
    showMoreText: {
        color: Colours.placeholder,
        fontSize: 13,
        width: 75,
        fontWeight: '600',
    },
})
function Expense({item, deleteExpense, tripId, people, toShow}: 
        {item: ExpenseEntity, deleteExpense: (id: number, tripId: number) => void | Promise<void>, tripId: number, people: PeopleTableTypes[], toShow: boolean}) {
    const db = useSQLiteContext ();

    const [isLoadingText, setIsLoadingText] = useState<boolean>(false);

    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [expandMessage, setExpandMessage] = useState<boolean>(false);
    const [payer, setPayer] = useState<string>('');
    const [abbreviation, setAbbreviation] = useState<string>('');
    const [isResolved, setIsResolved] = useState<string>('0');

    // Parameters for collapsible animation
    const startHeight: number = 0;
    const fillerHeight: number = 5;
    const defaultHeight: number = 130;
    const startTop: number = 100;
    const [extension, setExtension] = useState<number>(0);
    useEffect(() => {
        setExtension(10 +           // Height of the gap between main upper content and collpasible content
            (people.length * 35));  // Height of each member type
    }, [people])
    const container = useSharedValue(startHeight);
    const filler = useSharedValue(startHeight);
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

    useEffect(() => {
        if (payer.length > 0 && abbreviation.length > 0) {
            setIsLoadingText(false);
        }
    }, [payer, abbreviation])

    useEffect(() => {
        if(!isLoadingText && toShow) {
            container.value = withTiming(defaultHeight, {duration: duration})
            filler.value = withTiming(fillerHeight, {duration: duration})
        }
    }, [isLoadingText, toShow])

    useEffect(() => {
        if(!toShow) {
            container.value = withTiming(startHeight, {duration: duration})
            filler.value = withTiming(startHeight, {duration: duration})
        }
    }, [toShow])

    function pressDelete() {
        setIsVisible(true);
    }

    function confirmDelete() {
        container.value = withTiming(startHeight, {duration: duration})
        filler.value = withTiming(startHeight, {duration: duration})
        setTimeout(() => {
            deleteExpense && deleteExpense(item.id, tripId);
        }, duration);
        setIsVisible(false);
    }

    function resolved() {
        setIsResolved(isResolved == '0' ? '1' : '0');
        updateExpenseStatus(db, item.id, tripId, isResolved == '0' ? '1' : '0');
    }

    function expand() {
        if (!isExpanded) {
            container.value = withTiming(defaultHeight + extension, {duration: duration});
            filler.value = -1;
            degree.value = withTiming('180deg', {duration: duration});
            top.value = withTiming(startTop + extension, {duration: duration});
            setIsExpanded(true);
        } else {
            container.value = withTiming(defaultHeight, {duration: duration});
            setTimeout(() => {filler.value = fillerHeight}, duration)
            degree.value = withTiming('0deg', {duration: duration});
            top.value = withTiming(startTop, {duration: duration});
            setTimeout(() => setIsExpanded(false), duration);
        }
        setExpandMessage(!expandMessage);
    }

    const containerStyle = useAnimatedStyle(() => ({
        height: container.value
    }))

    const fillerStyle = useAnimatedStyle(() => ({
        height: filler.value
    }))

    const rotationStyle = useAnimatedStyle(() => ({
        transform: [{rotate: degree.value}]
    }))

    const topStyle = useAnimatedStyle(() => ({
        top: top.value
    }))
    
    return (
        <View>
            {!isLoadingText && <View>
            <Animated.View style={[fillerStyle, {overflow: 'hidden'}]}>
                <VerticalGap key={item.id} height={5}/>
            </Animated.View>
            <Animated.View style={[containerStyle, {overflow: 'hidden'}]}>
            <TouchableOpacity style={[expenseStyles.container]} activeOpacity={0.65} onPress={expand}>
                <View style={[expenseStyles.upper, {height: 90}]}>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                        <Text style={expenseStyles.expenseName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
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
                    </View>

                    <VerticalGap height={5}/>

                    <View style={{width: '100%', height: 55, flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={expenseStyles.textContainer}>
                            <Text style={expenseStyles.payer} numberOfLines={1} ellipsizeMode="tail">By: {payer}</Text>
                            <VerticalGap height={10}/>
                            <Text style={expenseStyles.date}>{item.date?.toLocaleDateString()}</Text>
                            <VerticalGap height={5}/>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={expenseStyles.amount}>{item.expense.toFixed(2)}</Text>
                            <Text style={expenseStyles.abbreviation}> {abbreviation}</Text>
                        </View>
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

                <VerticalGap height={5}/>
                
                <Animated.View style={[expenseStyles.showMoreContainer, topStyle]}>
                    <Text style={expenseStyles.showMoreText}>{expandMessage ? 'Show Less' : 'Show More'}</Text>
                    <Animated.View style={rotationStyle}>
                        <Ionicons name="chevron-down" color={Colours.placeholder} size={20}/>
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
            <ConfirmDelete isVisible={isVisible} setIsVisible={setIsVisible} confirm={confirmDelete}/>
            </Animated.View>
            <Animated.View style={[fillerStyle, {overflow: 'hidden'}]}>
                <VerticalGap key={item.id} height={5}/>
            </Animated.View>
        </View>}
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
