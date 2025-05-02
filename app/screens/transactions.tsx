import { GenericButton } from "@/components/buttons";
import { Colours } from "@/components/colours";
import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Transactions">;
type RouteTypes = RouteProp<ParamsList, "Transactions">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Transactions() {
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

function DisplayTransactions({tripId}: {tripId: number}) {
    return (
        <View></View>
    )
}
