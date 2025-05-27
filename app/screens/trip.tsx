import { Colours } from "@/components/colours";
import { VerticalGap } from "@/components/gap";
import { setPopProgram } from "@/components/globalFlag";
import { TopSection } from "@/components/screenTitle";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";
import Expenses from "./expenses";
import Overview from "./overview";
import Transactions from "./transactions";

type NativeStackNavigatorTypes = NativeStackNavigationProp<ParamsList, "Details">;
type RouteTypes = RouteProp<ParamsList, "Trip">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const animationTime: number = 200;

export default function Trip() {
    const navigation = useNavigation<NativeStackNavigatorTypes>();
    const route = useRoute<RouteTypes>();
    const { tripId, tripName } = route.params;
    
    const insets = useSafeAreaInsets();

    const [active, setActive] = useState<number>(1);
    const [isCloseList, setIsCloseList] = useState<boolean[]>([false, true, true, true]);

    useEffect(() => {
        changeActive(active, setIsCloseList);
    }, [active])

    useEffect(() => {
        const subscribe = navigation.addListener('focus', () => {
            setPopProgram(false);
        })
        return subscribe;
    }, [navigation])

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

            <View style={{position: 'relative', height: windowHeight - (0.09 * windowHeight) - insets.top - 95}}>
                <Overview tripId={tripId} isActive={active == 1} isClose={isCloseList[0]} animationTime={animationTime}/>
                <Transactions tripId={tripId} isActive={active == 2} isClose={isCloseList[1]} animationTime={animationTime}/>
                <Expenses tripId={tripId} isActive={active == 3} isClose={isCloseList[2]} animationTime={animationTime}/>
            </View>

            <BottomTab active={active} setActive={setActive}/>
        </View>
    )
}

function changeActive(screenId: number, setIsCloseList: (variable: boolean[]) => void) {
    setIsCloseList([true, true, true, true]);

    setTimeout(() => {
        const isCloseListCopy: boolean[] = [true, true, true, true];
        isCloseListCopy[screenId - 1] = false;
        setIsCloseList(isCloseListCopy);
    }, animationTime);
}


interface BottomTabProps{
    active: number
    setActive: (variable: number) => void
}

function BottomTab({active, setActive}: BottomTabProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[bottomTabStyles.container, {paddingBottom: insets.bottom}]}>
            <Pressable style={bottomTabStyles.screenContainer} onPressIn={() => setActive(1)}> 
                <Ionicons name="newspaper-outline" color={active == 1 ? activeColour : inactiveColour} size={size}/>
                <VerticalGap height={5}/>
                <Text style={[bottomTabStyles.screenText, {color: active == 1 ? activeColour : inactiveColour}]}>Overview</Text>
            </Pressable>
            <Pressable style={bottomTabStyles.screenContainer} onPressIn={() => setActive(2)}> 
                <Ionicons name="arrow-redo-outline" color={active == 2 ? activeColour : inactiveColour} size={size}/>
                <VerticalGap height={5}/>
                <Text style={[bottomTabStyles.screenText, {color: active == 2 ? activeColour : inactiveColour}]}>Transactions</Text>
            </Pressable>
            <Pressable style={bottomTabStyles.screenContainer} onPressIn={() => setActive(3)}> 
                <Ionicons name="card-outline" color={active == 3 ? activeColour : inactiveColour} size={size}/>
                <VerticalGap height={5}/>
                <Text style={[bottomTabStyles.screenText, {color: active == 3 ? activeColour : inactiveColour}]}>Expenses</Text>
            </Pressable>
            <Pressable style={bottomTabStyles.screenContainer} onPressIn={() => setActive(4)}>  
                <Ionicons name="menu" color={active == 4 ? activeColour : inactiveColour} size={size}/>
                <VerticalGap height={5}/>
                <Text style={[bottomTabStyles.screenText, {color: active == 4 ? activeColour : inactiveColour}]}>Details</Text>
            </Pressable>
        </View>
    )
}

const activeColour = 'dodgerblue';
const inactiveColour = 'grey';
const size = 25;

const bottomTabStyles = StyleSheet.create({
    container: {
        backgroundColor: Colours.backgroundV2,
        borderTopColor: Colours.placeholder,
        borderTopWidth: 2,
        height: 95,
        width: windowWidth,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        justifyContent: 'space-evenly',
    },
    screenContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 95,
    },
    screenIcon: {

    },
    screenText: {
        fontSize: 15,
        fontWeight: 600,
    },
})
