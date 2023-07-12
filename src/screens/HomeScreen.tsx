import React from "react";
import { useState } from "react";
import { View, Text, Button, Pressable } from "react-native";
import { createBottomTabNavigator } from
  "@react-navigation/bottom-tabs";
import PresetManagerScreen from "./PresetManagerScreen"
import SandboxScreen from "./SandboxScreen"
import SettingsScreen from "./SettingsScreen"
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
   const [isEdit, setEdit] = useState(false); 
  return (
        <Tab.Navigator 
          screenOptions={({route}) => ({
                    tabBarIcon: ({focused, color, size}) => {
                        let iconName;
                        if (route.name == "Presets") {
                            iconName = focused
                                ? 'albums'
                                : 'albums-outline';
                        }
                        else if (route.name == "Sandbox") {
                            iconName = focused
                                ? 'document-text'
                                : 'document-text-outline';
                        }
                        else if (route.name == "Analytics") {
                            iconName = focused
                                ? 'analytics'
                                : 'analytics-outline';
                        }
                        else if (route.name == "Settings") {
                            iconName = focused
                                ? 'settings'
                                : 'settings-outline';
                        }
                        return <Icon name={iconName} size={size} color={color} />;
                    }
                })
          }
        >
            <Tab.Screen name="Presets" 
                options={({route, navigation}) => ({
                   headerRight: () => {
                        return (
                        <Pressable 
                            onPress={() => navigation.navigate('Create Preset', {})}
                        >
                            <Icon
                             name="ios-add"
                             color="#007AFF"
                             size={30}    
                            />
                        </Pressable>                
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

            <Tab.Screen name="Sandbox" component={SandboxScreen} />

            <Tab.Screen name="Analytics" component={SettingsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
  );
}
