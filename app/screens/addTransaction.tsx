import { Colours } from "@/components/colours";
import { TopSection } from "@/components/screenTitle";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";

type RouteTypes = RouteProp<ParamsList, "AddTransaction">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function AddTransaction() {
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
            <TopSection title="Add Transaction"/>
            <MainBody tripId={tripId}/>
        </View>
    )
}

function MainBody({tripId}: {tripId: number}) {
    return (
        <View></View>
    )
}
