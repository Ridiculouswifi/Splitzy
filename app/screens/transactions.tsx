import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { ConfirmDelete } from "@/components/confirmDelete";
import { getDateMonth } from "@/components/convertDate";
import { VerticalGap } from "@/components/gap";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { deleteTransaction, getCurrency, getPerson } from "@/database/databaseSqlite";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Transactions">;
type RouteTypes = RouteProp<ParamsList, "Transactions">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Transactions() {
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
    
    function goToAddTransaction() {
        navigation.navigate("AddTransaction", {tripId: tripId});
    }

    return (
        <View style={genericMainBodyStyles.outerContainer}>
            <View style={mainBodyStyles.expenseContainer}>
                <GenericButton
                    text="New Transaction" 
                    colour={Colours.confirmButton}
                    textColour={Colours.textColor}
                    height={50} 
                    width={300}
                    fontsize={25} 
                    action={goToAddTransaction}/>
            </View>
            <DisplayTransactions tripId={tripId}/>
        </View>
    )
}

interface TransactionTableTypes {
    id: number;
    payer_id: number;
    recipient_id: number;
    amount: number;
    currency_id: number;
    date: string;
}
interface TransactionEntity {
    id: number;
    payer_id: number;
    recipient_id: number;
    amount: number;
    currency_id: number;
    date: Date;
}
const displayTransactionsStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: windowWidth,
    },
    internalContainer: {
        alignItems: 'center',
    },
})
function DisplayTransactions({tripId}: {tripId: number}) {
    const db = useSQLiteContext();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const [transactions, setTransactions] = useState<TransactionEntity[]>([]);

    const tableName: string = "transaction_" + tripId.toString();

    async function refetch(){
        await db.withExclusiveTransactionAsync(async () => {
            const data = await db.getAllAsync<TransactionTableTypes>(`SELECT * FROM ${tableName}`);

            let transactions: TransactionEntity[] = [];
            for (let i = 0; i < data.length; i++) {
                let newEntry: TransactionEntity = {id: data[i].id, payer_id: data[i].payer_id, recipient_id: data[i].recipient_id, 
                        amount: data[i].amount, currency_id: data[i].currency_id, date: new Date(data[i].date)};
                transactions = [...transactions, newEntry];
            }

            transactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

            setTransactions(transactions);
        });
    }

    const refetchItems = useCallback(() => {
        refetch();
        console.log("Transactions Refetched");
    }, [db])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetchItems();
        });
        return unsubscribe;
    }, [navigation]);

    async function deleteItem(id: number, tripId: number) {
        console.log("Deleting:", id);
        await deleteTransaction(db, id, tripId);
        await refetchItems();
    }
    
    return (
        <ScrollView style={displayTransactionsStyles.container}>
            <View style={displayTransactionsStyles.internalContainer}>
                {transactions.map((transaction) => (
                    <Transaction key={transaction.id} item={transaction} deleteTransaction={deleteItem} tripId={tripId}/>
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
let printableWidth: number = (0.95 * windowWidth) - 40;
const transactionStyles = StyleSheet.create({
    container: {
        height: 60,
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
    dateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 0.11 * printableWidth,
    },
    directionContainer: {
        flexDirection: 'row',
        width: 0.35 * printableWidth,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 5,
    },
    amountContainer: {
        flexDirection: 'row',
        width: 0.45 * printableWidth,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    trashContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 0.09 * printableWidth,
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
    month: {
        fontSize: 15,
        color: Colours.textColor,
    },
    date: {
        fontSize: 20,
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
function Transaction({item, deleteTransaction, tripId}: {item: TransactionEntity, deleteTransaction: (id: number, tripId: number) => void | Promise<void>, tripId: number}) {
    const db = useSQLiteContext ();

    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [payer, setPayer] = useState<string>('');
    const [recipient, setRecipient] = useState<string>('');
    const [abbreviation, setAbbreviation] = useState<string>('');

    async function getText() {
        const payerData = await getPerson(db, item.payer_id) as PeopleTableTypes[];
        setPayer(payerData[0].name);

        const recipientData = await getPerson(db, item.recipient_id) as PeopleTableTypes[];
        setRecipient(recipientData[0].name);

        const currencyData = await getCurrency(db, item.currency_id) as CurrencyTableTypes[];
        setAbbreviation(currencyData[0].abbreviation);
    }

    useEffect(() => {
        getText();
    }, [])

    function pressDelete() {
        setIsVisible(true);
    }

    function confirmDelete() {
        deleteTransaction && deleteTransaction(item.id, tripId);
        setIsVisible(false);
    }
    
    return (
        <View>
            <VerticalGap key={item.id} height={10}/>
            <TouchableOpacity style={transactionStyles.container} activeOpacity={0.4}>
                <View style={transactionStyles.dateContainer}>
                    <Text style={transactionStyles.month}>{getDateMonth(item.date?.getMonth())}</Text>
                    <Text style={transactionStyles.date}>{item.date?.getDate()}</Text>
                </View>
                <View style={transactionStyles.directionContainer}>
                    <Text style={transactionStyles.payer} numberOfLines={1} ellipsizeMode="tail">{payer}</Text>
                    <Ionicons name="arrow-forward-outline" size={15} color={Colours.textColor}/>
                    <Text style={transactionStyles.payer} numberOfLines={1} ellipsizeMode="tail">{recipient}</Text>
                </View>
                <View style={transactionStyles.amountContainer}>
                    <Text style={transactionStyles.amount}>{item.amount.toFixed(2)}</Text>
                    <Text style={transactionStyles.abbreviation}> {abbreviation}</Text>
                </View>
                <View style={transactionStyles.trashContainer}>
                    <TouchableOpacity onPress={pressDelete}>
                        <Ionicons name="trash-outline" size={28} color={Colours.cancel}/>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            <ConfirmDelete isVisible={isVisible} setIsVisible={setIsVisible} confirm={confirmDelete}/>
        </View>
    )
}
