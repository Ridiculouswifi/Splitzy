import { genericMainBodyStyles, TopSection } from "@/components/screenTitle";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParamsList } from "..";
import { Divider, VerticalGap } from "@/components/gap";
import { useState } from "react";
import { Currency } from "@/classes/currency";
import { GenericButton2 } from "@/components/buttons";
import Picker from "@ouroboros/react-native-picker";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type RouteTypes = RouteProp<ParamsList, "AddExpense">;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const windowFontScale = Dimensions.get('window').fontScale;

export default function AddExpense() {
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
            <TopSection title="Add Expense"/>
            <MainBody tripId={tripId}/>
        </View>
    )
}

function MainBody({tripId}: {tripId: number}) {
    function confirmExpense() {

    }
    
    return (
        <View style={genericMainBodyStyles.outerContainer}>
        <ScrollView>
        <View style={genericMainBodyStyles.container}>
            <Details tripId={tripId}/>

            <VerticalGap height={20}/>
            <Divider/>
            <VerticalGap height={20}/>

            <GenericButton2 
                text="Confirm" 
                height={45} 
                width={210} 
                colour="dodgerblue" 
                action={confirmExpense}
                fontsize={22}/>
            
            <VerticalGap height={40}/>
        </View>
        </ScrollView>
        </View>
    )
}

function Details({tripId}: {tripId: number}){
    const insets = useSafeAreaInsets();

    const [expenseName, setExpenseName] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [currency, setCurrency] = useState<Currency>(new Currency("", ""))
    const [date, setDate] = useState(new Date());

    const [picker, setPicker] = useState('Singapore Dollar');
    
    const detailsStyle = StyleSheet.create({
        container: {
            alignItems: "center",
            paddingTop: 10,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf: 'flex-start',
        },
        miniContainer: {
            flexDirection: 'row',
            width: 0.8 * windowWidth,
            justifyContent: 'space-between',
        },
        pickerContainer: {
            width: 0.25 * windowWidth,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        picker: {
            fontSize: 20,
        },
    })
    return (
        <View style={detailsStyle.container}>
            <Text style={detailsStyle.title}>Details</Text>
            <VerticalGap height={20}/>
            <Input setVariable={setExpenseName} variablePlaceHolder="Expense Name" width={0.8 * windowWidth}/>
            <VerticalGap height={20}/>
            <View style={detailsStyle.miniContainer}>
                <Input setVariable={setAmount} variablePlaceHolder="Amount" width={0.5 * windowWidth}/>
                <View style={[inputStyles.inputField, detailsStyle.pickerContainer]}>
                    <Picker 
                        onChanged={setPicker}
                        options={[
                            {value: 'Singapore Dollar', text: 'SGD'},
                            {value: 'Vietnamese Dong', text: 'VND'}
                        ]}
                        value={picker}
                        style={detailsStyle.picker}
                    />
                    <Ionicons name="caret-down-outline" size={20}/>
                </View>
            </View>
            <VerticalGap height={20}/>
            <DateInput setVariable={setDate} variablePlaceHolder="Date"/>
        </View>
    )
}

interface inputProps {
    setVariable: (variable: string) => void;
    variablePlaceHolder: string;
    width: number;
}
const inputStyles = StyleSheet.create({
    inputField: {
        borderBottomWidth: 2,
        borderColor: 'grey',
        color: 'black',
        fontSize: 20,
    }
})
function Input({setVariable, variablePlaceHolder, width}: inputProps) {
    return (
        <TextInput 
            placeholder={variablePlaceHolder}
            placeholderTextColor="grey"
            style={[inputStyles.inputField, {width: width}]}
            onChangeText={setVariable}/>
    )
}

interface DateInputProps {
    setVariable: (variable: Date) => void;
    variablePlaceHolder: string;
}

function DateInput({ setVariable, variablePlaceHolder }: DateInputProps) {
    const [date, setDate] = useState(new Date());
    
    const inputMiniStyles = StyleSheet.create({
        inputField: {
            width: 0.8 * windowWidth,
            color: 'black',
            fontSize: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        inputTitle: {
            fontSize: 15,
            fontWeight: '500',
        }
    })

    function setAfterDateChange(event: DateTimePickerEvent, date?: Date | undefined) {
        if (event.type == "set") {
            setVariable(date ?? new Date());
        }
    }

    return (
        <View style={inputMiniStyles.inputField}>
            <Text style={inputMiniStyles.inputTitle}>{variablePlaceHolder}</Text>
            <RNDateTimePicker 
                value={date}
                onChange={setAfterDateChange}
                />
        </View>
    )
}
