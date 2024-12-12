import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { ParamsList } from "..";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GenericButton2 } from "@/components/buttons";
import { VerticalGap } from "@/components/gap";

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
            backgroundColor: 'skyblue',
            flex: 1,
        }
    })
    return (
        <View style={tripStyles.container}>
            <StatusBar barStyle={'dark-content'}/>
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
            borderBottomColor: 'darkgrey',
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
                <GenericButton2 text="New Expense" colour="dodgerblue"
                    height={50} width={300}
                    fontsize={25} action={goToAddExpense}/>
            </View>
            <DisplayExpenses tripId={tripId}/>
        </View>
    )
}

const displayExpensesStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    internalContainer: {
        alignItems: 'center',
    },
})
function DisplayExpenses({tripId}: {tripId: number}) {
    return (
        <ScrollView style={displayExpensesStyles.container}>
            <View style={displayExpensesStyles.internalContainer}>
                <Text>{tripId}</Text>
                <VerticalGap height={40}/>
            </View>
        </ScrollView>
    )
}
