import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { ConfirmDelete } from "@/components/confirmDelete";
import { HorizontalGap, VerticalGap } from "@/components/gap";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { deleteExpense, getCurrency, getPerson, updateExpenseStatus } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    
    const mainBodyStyles = StyleSheet.create({
        expenseContainer: {
            flexDirection: 'row',
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
        <View style={genericMainBodyStyles.outerContainer}>
            <View style={mainBodyStyles.expenseContainer}>
                <GenericButton
                    text="New Expense" 
                    colour={Colours.confirmButton}
                    textColour={Colours.textColor}
                    height={50} 
                    width={300}
                    fontsize={25} 
                    action={goToAddExpense}/>
            </View>
            <DisplayExpenses tripId={tripId}/>
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
}
interface ExpenseEntity {
    id: number;
    name: string;
    payer_id: number;
    expense: number;
    currency_id: number;
    date: Date;
    is_resolved: string;
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
function DisplayExpenses({tripId}: {tripId: number}) {
    const db = useSQLiteContext ();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const [expenses, setExpenses] = useState<ExpenseEntity[]>([]);

    const tableName: string = "trip_" + tripId.toString();

    async function refetch(){
        await db.withExclusiveTransactionAsync(async () => {
                const data = await db.getAllAsync<ExpenseTableTypes>(`SELECT * FROM ${tableName}`);
                
                let expenses: ExpenseEntity[] = [];
                for (let i = 0; i < data.length; i++) {
                    let newEntry: ExpenseEntity = {id: data[i].id, name: data[i].name, payer_id: data[i].payer_id, 
                            expense: data[i].expense, currency_id: data[i].currency_id, is_resolved: data[i].is_resolved,
                            date: new Date(data[i].date)};
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
                {expenses.map((expense) => (
                    <Expense key={expense.id} item={expense} deleteExpense={deleteItem} tripId={tripId}/>
                ))}
                <VerticalGap height={40}/>
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
        height: 120,
        width: 0.95 * windowWidth,
        borderRadius: 10,
        paddingHorizontal: 20, 
        paddingVertical: 10,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
        borderWidth: 0.1,
        backgroundColor: Colours.backgroundV2,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        width: 0.45 * windowWidth,
    },
    rightContainer: {
        justifyContent: 'space-between',
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
})
function Expense({item, deleteExpense, tripId}: {item: ExpenseEntity, deleteExpense: (id: number, tripId: number) => void | Promise<void>, tripId: number}) {
    const db = useSQLiteContext ();

    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [payer, setPayer] = useState<string>('');
    const [abbreviation, setAbbreviation] = useState<string>('');
    const [isResolved, setIsResolved] = useState<string>('0');

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
    
    return (
        <View>
            <VerticalGap key={item.id} height={10}/>
            <TouchableOpacity style={expenseStyles.container} activeOpacity={0.4}>
                <View style={expenseStyles.textContainer}>
                    <Text style={expenseStyles.expenseName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                    <VerticalGap height={5}/>
                    <Text style={expenseStyles.payer}>By: {payer}</Text>
                    <VerticalGap height={10}/>
                    <Text style={expenseStyles.date}>{item.date?.toLocaleDateString()}</Text>
                </View>
                <View style={expenseStyles.rightContainer}>
                    <View style={expenseStyles.buttonsContainer}>
                        <GenericButton
                            text="Resolved" 
                            height={30} 
                            width={80} 
                            fontsize={14}
                            colour={isResolved == '0' ? Colours.confirmButton : 'grey'} 
                            action={resolved} 
                            textColour={isResolved == '0' ? Colours.textColor : 'black'}/>
                        <HorizontalGap width={10}/>
                        <TouchableOpacity onPress={pressDelete}>
                            <Ionicons name="trash-outline" size={28} color={Colours.cancel}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={expenseStyles.amount}>{item.expense.toFixed(2)}</Text>
                        <Text style={expenseStyles.abbreviation}> {abbreviation}</Text>
                    </View>
                    <VerticalGap height={1}/>
                </View>
            </TouchableOpacity>
            <ConfirmDelete isVisible={isVisible} setIsVisible={setIsVisible} confirm={confirmDelete}/>
        </View>
    )
}
