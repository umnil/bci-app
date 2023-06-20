import React from "react";
import { useState } from "react";
import { View, Text, Button } from "react-native";
import { createBottomTabNavigator } from
  "@react-navigation/bottom-tabs";
import PresetManagerScreen from "./PresetManagerScreen"
import SettingsScreen from "./SettingsScreen"

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
   const [isEdit, setEdit] = useState(false); 
  return (
        <Tab.Navigator>
            <Tab.Screen name="Presets" 
                options={({route, navigation}) => ({
                    headerRight: () => {
                        return (
                            <Button
                               title="Add" 
                               onPress={() => {navigation.navigate("Create Preset", {});
                                                }}
                            />    
                        );
                    },
                    headerLeft: () => {
                        return (
                            <Button
                               title= {isEdit ? "Done" : "Edit"} 
                               onPress={() => {setEdit(v => !v);}}
                            />    
                        );
                    },

                })}
            > 
            {(props) => <PresetManagerScreen {...props} isEdit={isEdit} setEdit={setEdit} />}
            </Tab.Screen>
            <Tab.Screen name="Dynamic Configuration" component={SettingsScreen} />
            <Tab.Screen name="Analytics" component={SettingsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
  );
}
