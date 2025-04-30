import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamsList } from "..";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Dimensions, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { Text } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { getRelatedCurrencies, getRelatedPeople } from "@/database/databaseSqlite";
import { useSQLiteContext } from "expo-sqlite";
import { Divider, HorizontalGap, VerticalGap } from "@/components/gap";
import { Colours } from "@/components/colours";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Overview">;
type RouteTypes = RouteProp<ParamsList, "Overview">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function Overview() {
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
interface TotalTypes {
    personId: number,
    currencyId: number,
    abbreviation: string,
    amount: number,
}
function MainBody({tripId}: {tripId: number}) {
    const db = useSQLiteContext();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const tableName: string = "trip_" + tripId.toString();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [people, setPeople] = useState<PeopleTableTypes[]>([]);
    const [currencies, setCurrencies] = useState<CurrencyTableTypes[]>([]);
    const [expenses, setExpenses] = useState<[]>([]);

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
                    SELECT * FROM ${tableName};    
                `) as []
            );
        });

        setIsLoading(false);
    }

    const refetchItems = useCallback(async () => {
        await refetch();
        console.log("Overview Refetched");
    }, [db])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await refetchItems();
        });

        // console.log('currencies changed:', currencies);
        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        if (people.length > 0 && currencies.length > 0) {
            calculateValues({people, currencies, expenses, setTotalSpent, setTotalExpense, setTotalBalance});
        }
    }, [expenses, people, currencies])


    return (
        <View style={genericMainBodyStyles.outerContainer}>
        <ScrollView>
        <View style={genericMainBodyStyles.container}>
            {(!isLoading) && 
            <View style={genericMainBodyStyles.container}>
                <Statistics people={people} compilation={totalSpent} title="Total Paid"/>

                <VerticalGap height={20}/>
                <Divider/>
                <VerticalGap height={20}/>

                <Statistics people={people} compilation={totalExpense} title="Personal Expenses"/>

                <VerticalGap height={20}/>
                <Divider/>
                <VerticalGap height={20}/>

                <Statistics people={people} compilation={totalBalance} title="Balance"/>
            </View>
            }
        </View>
        </ScrollView>
        </View>
    )
}

interface CalculateProps {
    people: PeopleTableTypes[];
    currencies: CurrencyTableTypes[];
    expenses: [];
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

    props.setTotalSpent(totalSpent);
    props.setTotalExpense(totalExpense);
    props.setTotalBalance(totalBalance);
}


interface DetailsProps {
    people: PeopleTableTypes[],
    compilation: TotalTypes[],
}
interface PerPersonProps {
    personId: number,
    personName: string,
    compilation: TotalTypes[],
}
interface ExpenseProps {
    amount: number,
    abbreviation: string,
}
interface TitleProps {
    title: string,
}

interface SplitArrayProps {
    setArray: (variable: TotalTypes[]) => void,
}
function splitArray(props: PerPersonProps & SplitArrayProps) {
    let result: TotalTypes[] = [];
    for (let i = 0; i < props.compilation.length; i++) {
        if (props.compilation[i]["personId"] == props.personId) {
            result.push(props.compilation[i])
        }
    }
    props.setArray(result);
}

const statisticsStyles = StyleSheet.create({
    container: {
        width: 0.8 * windowWidth,
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        color: Colours.textColor,
    },
})
function Statistics(props: DetailsProps & TitleProps) {    
    return (
        <View style={[statisticsStyles.container]}>
            <Text style={statisticsStyles.title}>{props.title}</Text>
            <VerticalGap height={10}/>
            {props.people.map((person) => (
                <StatisticsIndiv 
                    key={person.id}
                    personId={person.id}
                    personName={person.name}
                    compilation={props.compilation}/>
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

    useEffect(() => {
        splitArray({...props, setArray: setContributions}) // ... is used to spread out the props
    }, [])

    return (
        <View>
        <View style={statisticsIndivStyles.container}>
            <View style={statisticsIndivStyles.nameContainer}>
                <Text style={statisticsIndivStyles.name}>{props.personName}</Text>
            </View>
            <View style={statisticsIndivStyles.amountContainer}>
                {contributions.map((contribution) => (
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
