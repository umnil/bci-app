import React from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from
  "@react-navigation/native";
import { createNativeStackNavigator } from
  "@react-navigation/native-stack";
import SessionsManagerScreen from "./SessionsManagerScreen"
import SessionsCreationScreen from "./SessionsCreationScreen"


const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  return (
        <Stack.Navigator>
            <Stack.Screen name="Sessions" component={SessionsManagerScreen} 
                options={({route, navigation}) => ({
                    headerLeft: () => {
                        return (
                            <Button
                               title="Add" 
                               onPress={() => {navigation.navigate("Create Session", {});}}
                            />    
                        );
                    },
                })}
             />
            <Stack.Screen name="Create Session" component={SessionsCreationScreen}/>
       </Stack.Navigator>
  );
}
