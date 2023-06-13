import React from "react";
import { View, Text, Button } from "react-native";
import { createBottomTabNavigator } from
  "@react-navigation/bottom-tabs";
import SessionsManagerScreen from "./SessionsManagerScreen"
import SettingsScreen from "./SettingsScreen"

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
        <Tab.Navigator>
            <Tab.Screen name="Sessions List" component={SessionsManagerScreen} 
                options={({route, navigation}) => ({
                    headerRight: () => {
                        return (
                            <Button
                               title="Add" 
                               onPress={() => {navigation.navigate("Create Session", {});}}
                            />    
                        );
                    },
                    headerLeft: () => {
                        return (
                            <Button
                               title="Edit" 
                               onPress={() => {}}
                            />    
                        );
                    },

                })}
            />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
  );
}
