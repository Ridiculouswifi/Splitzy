import { ToggleButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import { genericMainBodyStyles } from "@/components/screenTitle";
import { getRelatedCurrencies, getRelatedPeople } from "@/database/databaseSqlite";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ParamsList } from "..";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Overview">;
type RouteTypes = RouteProp<ParamsList, "Overview">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

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
interface TransactionsTableTypes {
    id: number;
    payer_id: number;
    recipient_id: number;
    amount: number;
    currency_id: number;
    date: string;
}
interface TotalTypes {
    personId: number,
    currencyId: number,
    abbreviation: string,
    amount: number,
}
export default function Overview({tripId, isActive, isClose, animationTime}: {tripId: number, isActive: boolean, isClose: boolean, animationTime: number}) {
    const db = useSQLiteContext();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const tripName: string = "trip_" + tripId.toString();
    const transactionName: string = "transaction_" + tripId.toString();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDisplay, setIsDisplay] = useState<boolean>(false);

    const translate = useSharedValue(windowHeight);
    
    const [people, setPeople] = useState<PeopleTableTypes[]>([]);
    const [currencies, setCurrencies] = useState<CurrencyTableTypes[]>([]);
    const [expenses, setExpenses] = useState<[]>([]);
    const [transactions, setTransactions] = useState<TransactionsTableTypes[]>([]);

    const [rates, setRates] = useState<number[]>([]);

    const [totalSpent, setTotalSpent] = useState<TotalTypes[]>([]);
    const [totalExpense, setTotalExpense] = useState<TotalTypes[]>([]);
    const [totalBalance, setTotalBalance] = useState<TotalTypes[]>([]);

    async function refetch(){
        setIsLoading(true);

        const peopleData: PeopleTableTypes[] = await getRelatedPeople(db, tripId) as PeopleTableTypes[];
        setPeople(peopleData);

        const currenciesData: CurrencyTableTypes[] = await getRelatedCurrencies(db, tripId) as CurrencyTableTypes[];
        setCurrencies(currenciesData);

        await db.withExclusiveTransactionAsync(async () => {
            setExpenses(
                await db.getAllAsync(`
                    SELECT * FROM ${tripName};    
                `) as []
            );
            setTransactions(
                await db.getAllAsync(`
                    SELECT * FROM ${transactionName};
                `) as TransactionsTableTypes[]
            );
        });

        setIsLoading(false);
    }

    const refetchItems = useCallback(async () => {
        await refetch();
        console.log("Overview Refetched");
    }, [db])

    useEffect(() => {
        if (isActive) {
            refetchItems();
        }
        const unsubscribe = navigation.addListener('focus', async () => {
            await refetchItems();
        });

        // console.log('currencies changed:', currencies);
        return unsubscribe;
    }, [navigation, isActive]);

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

    useEffect(() => {
        if (!isLoading && people.length > 0 && currencies.length > 0 && expenses.length >= 0 && transactions.length >= 0) {
            calculateValues({people, currencies, expenses, transactions, setTotalSpent, setTotalExpense, setTotalBalance});
            setIsDisplay(true);
            console.log(expenses.length)
        }
    }, [isLoading, expenses, people, currencies, transactions])

    useEffect(() => {
        setRates(Array(currencies.length).fill(1));
    }, [currencies])


    return (
        <Animated.View style={[genericMainBodyStyles.outerContainer, expandStyle, {position: 'absolute'}]}>
        <ScrollView style={{width: windowWidth}} showsVerticalScrollIndicator={false}>
        <View style={{alignItems: 'center'}}>
            {(isDisplay) && 
            <View style={genericMainBodyStyles.container}>
                <VerticalGap height={10}/>
                <DisplayRates currencies={currencies} rates={rates} setRates={setRates}/>

                <VerticalGap height={20}/>
                <Divider/>
                <VerticalGap height={20}/>

                <Statistics people={people} compilation={totalSpent} title="Total Paid" rates={rates}/>

                <VerticalGap height={20}/>
                <Divider/>
                <VerticalGap height={20}/>

                <Statistics people={people} compilation={totalExpense} title="Personal Expenses" rates={rates}/>

                <VerticalGap height={20}/>
                <Divider/>
                <VerticalGap height={20}/>

                <Statistics people={people} compilation={totalBalance} title="Balance" rates={rates}/>
            </View>
            }
        </View>
        </ScrollView>
        </Animated.View>
    )
}

interface CalculateProps {
    people: PeopleTableTypes[];
    currencies: CurrencyTableTypes[];
    expenses: [];
    transactions: TransactionsTableTypes[];
    setTotalSpent: (variable: TotalTypes[]) => void,
    setTotalExpense: (variable: TotalTypes[]) => void,
    setTotalBalance: (variable: TotalTypes[]) => void,
}
function calculateValues(props: CalculateProps) {
    const peopleCount: number = props.people.length;
    const currencyCount: number = props.currencies.length;
    const expenseCount: number = props.expenses.length;

    let totalSpent: TotalTypes[] = [];
    let totalExpense: TotalTypes[] = [];
    let totalBalance: TotalTypes[] = [];
    let columnNames: string[] = [];

    for (let i = 0; i < peopleCount; i++) {
        for (let j = 0; j < currencyCount; j++) {
            totalSpent.push({"personId": props.people[i]["id"], "currencyId": props.currencies[j]["id"], "amount": 0, "abbreviation": props.currencies[j]["abbreviation"]});
            totalExpense.push({"personId": props.people[i]["id"], "currencyId": props.currencies[j]["id"], "amount": 0, "abbreviation": props.currencies[j]["abbreviation"]});
            totalBalance.push({"personId": props.people[i]["id"], "currencyId": props.currencies[j]["id"], "amount": 0, "abbreviation": props.currencies[j]["abbreviation"]});
        }
        columnNames.push("person_" + props.people[i]["id"].toString());
    }

    for (let i = 0; i < expenseCount; i++) {
        const expenditure = props.expenses[i]["expense"];

        let sumWeight: number = 0;
        for (let k = 0; k < peopleCount; k++) {
            sumWeight += props.expenses[i][columnNames[k]];
        }
        
        let personColumn = 0;
        for (let j = 0; j < totalSpent.length; j++) {
            if (totalSpent[j]["currencyId"] == props.expenses[i]["currency_id"]) {
                let expense: number = expenditure * (props.expenses[i][columnNames[personColumn]] / sumWeight);
                let paid: number = 0;

                // Update Personal Expenses
                totalExpense[j]["amount"] += expense;

                // Update Spent Amount
                if (totalSpent[j]["personId"] == props.expenses[i]["payer_id"]) {
                    totalSpent[j]["amount"] += expenditure;
                    paid = expenditure;
                }

                // Update Balance
                totalBalance[j]["amount"] += props.expenses[i]["is_resolved"] == '0' ? paid - expense : 0;

                j += currencyCount - 1;
                personColumn++;
            }
        }
    }

    for (let i = 0; i < props.transactions.length; i++) {
        for (let j = 0; j < totalExpense.length; j++) {
            if (totalBalance[j]["currencyId"] == props.transactions[i].currency_id && totalBalance[j]["personId"] == props.transactions[i].payer_id) {
                totalBalance[j].amount += props.transactions[i].amount;
            }
            else if (totalBalance[j]["currencyId"] == props.transactions[i].currency_id && totalBalance[j]["personId"] == props.transactions[i].recipient_id) {
                totalBalance[j].amount -= props.transactions[i].amount;
            }
        }
    }

    props.setTotalSpent(totalSpent);
    props.setTotalExpense(totalExpense);
    props.setTotalBalance(totalBalance);
}


function DisplayRates({currencies, rates, setRates}: {currencies: CurrencyTableTypes[], rates: number[], setRates: (variable: number[]) => void}) {
    function setRate(amount: number, index: number) {
        let ratesCopy: number[] = [...rates];
        ratesCopy[index] = amount;
        setRates(ratesCopy);
    }
    
    return (
        <View style={statisticsStyles.container}>
            <View style={statisticsStyles.titleContainer}>
                <Text style={statisticsStyles.title}>Exchange Rates</Text>
            </View>
            <VerticalGap height={10}/>
            <View style={displayRatesStyles.exchangeContainer}>
                <View style={displayRatesStyles.currencyContainer}>
                    <Text style={displayRatesStyles.amount} numberOfLines={1} ellipsizeMode="tail">{rates[0]}</Text>
                    <HorizontalGap width={10}/>
                    <View style={displayRatesStyles.abbreviationContainer}>
                        <Text style={displayRatesStyles.abbreviation} numberOfLines={1} ellipsizeMode="tail">{currencies[0].abbreviation}</Text>
                    </View>
                </View>
                <Text style={[displayRatesStyles.abbreviation, {fontSize: 18}]}>To</Text>
                <View>
                    {currencies.map((currency, index) => (
                        <View key={currency.id}>
                            {index != 0 && <IndivRates currency={currency} rate={rates[index]} setRate={setRate} index={index}/>}
                            <VerticalGap height={5}/>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}
function IndivRates({currency, rate, setRate, index}: {currency: CurrencyTableTypes, rate: number, setRate: (amount: number, index: number) => void, index: number}) {
    const [amount, setAmount] = useState<string>(rate.toString());
    
    return (
        <View style={displayRatesStyles.currencyContainer}>
            <TextInput style={displayRatesStyles.amount} numberOfLines={1} value={amount.toString()} keyboardType="numeric" 
                onChangeText={(newAmount) => {
                    const num: number = newAmount == '' ? 0 : parseFloat(newAmount);
                    setAmount(newAmount);
                    setRate(num, index);
                }} />
            <HorizontalGap width={10}/>
            <View style={displayRatesStyles.abbreviationContainer}>
                <Text style={displayRatesStyles.abbreviation} numberOfLines={1} ellipsizeMode="tail">{currency.abbreviation}</Text>
            </View>
        </View>
    )
}
const displayRatesStyles = StyleSheet.create({
    exchangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    currencyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amount: {
        color: Colours.textColor,
        borderBottomWidth: 2,
        borderColor: Colours.inputField,
        width: 0.17 * windowWidth,
        fontSize: 20,
    },
    abbreviationContainer: {
        backgroundColor: Colours.backgroundV2,
        height: 35,
        justifyContent: 'center',
        paddingHorizontal: 10,
        borderRadius: 8,
        width: 0.15 * windowWidth,
    },
    abbreviation: {
        fontSize: 17,
        fontWeight: '500',
        color: Colours.textColor,
    }
})


interface DetailsProps {
    people: PeopleTableTypes[],
    compilation: TotalTypes[],
    rates: number[],
}
interface PerPersonProps {
    personId: number,
    personName: string,
    compilation: TotalTypes[],
    rates: number[],
    isCombine: boolean,
}
interface ExpenseProps {
    amount: number,
    abbreviation: string,
}
interface TitleProps {
    title: string,
}

interface SplitArrayProps {
    setSplit: (variable: TotalTypes[]) => void,
    setCombine: (variable: TotalTypes[]) => void,
}
// Function to isolate the specific calculations for a specified person/ user.
// Also combines the values into all SGD for easier reading.
function splitArray(props: PerPersonProps & SplitArrayProps) {
    let splitResult: TotalTypes[] = [];
    let combineResult: TotalTypes[] = [{"personId": props.personId, "currencyId": props.compilation[0]["currencyId"], "amount": 0, "abbreviation": props.compilation[0]["abbreviation"]}];
    let numCurrencies: number = props.rates.length;
    for (let i = 0; i < props.compilation.length; i++) {
        if (props.compilation[i]["personId"] == props.personId) {
            splitResult.push(props.compilation[i]);
            combineResult[0]["amount"] += props.compilation[i].amount / props.rates[i % numCurrencies];
        }
    }
    props.setSplit(splitResult);
    props.setCombine(combineResult);
}

const statisticsStyles = StyleSheet.create({
    container: {
        width: 0.8 * windowWidth,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        color: Colours.textColor,
    },
    toggleContainer: {
        alignItems: 'center',
    },
    toggleMessage: {
        color: Colours.textColor,
        fontSize: 15,
        fontWeight: '500',
    },
})
function Statistics(props: DetailsProps & TitleProps) {    
     const [isCombine, setIsCombine] = useState<boolean>(false);

    return (
        <View style={[statisticsStyles.container]}>
            <View style={statisticsStyles.titleContainer}>
                <Text style={statisticsStyles.title}>{props.title}</Text>
                <View style={statisticsStyles.toggleContainer}>
                    <Text style={statisticsStyles.toggleMessage}>Combine</Text>
                    <VerticalGap height={5}/>
                    <ToggleButton buttonOn={isCombine} setButtonOn={setIsCombine}/>
                </View>
            </View>
            <VerticalGap height={10}/>
            {props.people.map((person) => (
                <StatisticsIndiv 
                    key={person.id}
                    personId={person.id}
                    personName={person.name}
                    compilation={props.compilation}
                    isCombine={isCombine}
                    rates={props.rates}/>
            ))}
        </View>
    )
}

const statisticsIndivStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameContainer: {
        backgroundColor: Colours.backgroundV2,
        width: 0.35 * windowWidth,
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    name: {
        fontSize: 20,  
        color: Colours.textColor,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
})
function StatisticsIndiv(props: PerPersonProps) {
    const [contributions, setContributions] = useState<TotalTypes[]>([]);
    const [combineContributions, setCombineContributions] = useState<TotalTypes[]>([]);

    useEffect(() => {
        splitArray({...props, setSplit: setContributions, setCombine: setCombineContributions}) // ... is used to spread out the props
    }, [props.rates])

    return (
        <View>
        <View style={statisticsIndivStyles.container}>
            <View style={statisticsIndivStyles.nameContainer}>
                <Text style={statisticsIndivStyles.name}>{props.personName}</Text>
            </View>
            <View style={statisticsIndivStyles.amountContainer}>
                {props.isCombine ?
                combineContributions.map((contribution) => (
                    <Expense key={contribution.currencyId} amount={contribution.amount} abbreviation={contribution.abbreviation}/>
                ))
                : contributions.map((contribution) => (
                    <Expense key={contribution.currencyId} amount={contribution.amount} abbreviation={contribution.abbreviation}/>
                ))}
            </View>
        </View>
        <VerticalGap height={10}/>
        </View>
    )
}

const expenseStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
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
})
function Expense(props: ExpenseProps) {
    return (
        <View style={expenseStyles.container}>
            <Text style={expenseStyles.amount}>{props.amount.toFixed(2)}</Text>
            <Text style={expenseStyles.abbreviation}> {props.abbreviation}</Text>
        </View>
    )
}
