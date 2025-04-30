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
interface ExpenseEntity {
    id: number;
    name: string;
    payer_id: number;
    expense: number;
    currency_id: number;
    date: string;
    is_resolved: string;
}
function MainBody({tripId}: {tripId: number}) {
    const db = useSQLiteContext();
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const tableName: string = "trip_" + tripId.toString();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [people, setPeople] = useState<PeopleTableTypes[]>([]);
    const [currencies, setCurrencies] = useState<CurrencyTableTypes[]>([]);
    const [expenses, setExpenses] = useState<[]>([]);

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
        console.log("Overview refetched");
    }, [db])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await refetchItems();
        });

        console.log('currencies changed:', currencies);
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={genericMainBodyStyles.outerContainer}>
        <ScrollView>
        <View style={genericMainBodyStyles.container}>
            {(!isLoading) && 
            <View style={genericMainBodyStyles.container}>
                <PaidFor expenses={expenses} currencies={currencies} people={people}/>

                <VerticalGap height={20}/>
                <Divider/>
                <VerticalGap height={20}/>

                <Differential expenses={expenses} currencies={currencies} people={people}/>
            </View>
            }
        </View>
        </ScrollView>
        </View>
    )
}

interface PaidForProps {
    expenses: [];
    currencies: CurrencyTableTypes[];
    people: PeopleTableTypes[];
}
const paidForStyles = StyleSheet.create({
    container: {
        width: 0.8 * windowWidth,
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        color: Colours.textColor,
    },
})
function PaidFor(props: PaidForProps) {    
    return (
        <View style={[paidForStyles.container]}>
            <Text style={paidForStyles.title}>Total Paid</Text>
            <VerticalGap height={10}/>
            {props.people.map((person) => (
                <PaidForPayer 
                    key={person.id}
                    expenses={props.expenses}
                    currencies={props.currencies}
                    personId={person.id}
                    personName={person.name}/>
            ))}
        </View>
    )
}

interface PaidForPayerProps {
    expenses: [];
    currencies: CurrencyTableTypes[];
    personId: number;
    personName: string;
}
interface ContributionsTypes {
    currencyId: number;
    abbreviation: string;
    total: number;
}
const paidForPayerStyles = StyleSheet.create({
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
function PaidForPayer(props: PaidForPayerProps) {
    const [contributions, setContributions] = useState<ContributionsTypes[]>([]);

    function calculateTotal(personId: number) {
        const currencyCount: number = props.currencies.length;
        const expenseCount: number = props.expenses.length;
        let currencyTotal: ContributionsTypes[] = [];
        for (let i = 0; i < currencyCount; i++) {
            currencyTotal.push({"currencyId": props.currencies[i].id, "abbreviation": props.currencies[i].abbreviation, "total": 0});
        }
        for (let i = 0; i < expenseCount; i++) {
            if (props.expenses[i]["payer_id"] == personId) {
                for (let j = 0; j < currencyCount; j++) {
                    if (props.expenses[i]["currency_id"] == currencyTotal[j].currencyId) {
                        let newTotal = currencyTotal[j].total;
                        newTotal += props.expenses[i]["expense"];
                        currencyTotal[j].total = newTotal;
                    }
                }
            }
        }
        //console.log(currencyTotal);
        setContributions(currencyTotal);
    }

    useEffect(() => {
        calculateTotal(props.personId);
    }, [])

    return (
        <View>
        <View style={paidForPayerStyles.container}>
            <View style={paidForPayerStyles.nameContainer}>
                <Text style={paidForPayerStyles.name}>{props.personName}</Text>
            </View>
            <View style={paidForPayerStyles.amountContainer}>
                {contributions.map((contribution) => (
                    <Expense key={contribution.currencyId} amount={contribution.total} abbreviation={contribution.abbreviation}/>
                ))}
            </View>
        </View>
        <VerticalGap height={10}/>
        </View>
    )
}

interface ExpenseProps {
    amount: number;
    abbreviation: string;
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
            <Text style={expenseStyles.amount}>{props.amount}</Text>
            <Text style={expenseStyles.abbreviation}> {props.abbreviation}</Text>
        </View>
    )
}

function Differential(props: PaidForProps) {
    return (
        <View style={paidForStyles.container}>
            <Text style={paidForStyles.title}>Difference</Text>
            <VerticalGap height={10}/>
            {props.people.map((person) => (
                <PaidForPayer 
                    key={person.id}
                    expenses={props.expenses}
                    currencies={props.currencies}
                    personId={person.id}
                    personName={person.name}/>
            ))}
        </View>
    )
}

function DifferentialIndividual(props: PaidForPayerProps) {
    
    
    return (
        <View style={paidForPayerStyles.container}>
            <Text>{props.personName}</Text>
            
        </View>
    )
}
