import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from
  "@react-navigation/native";
import { createBottomTabNavigator } from
  "@react-navigation/bottom-tabs";
import HomeScreen from './screens/HomeScreen'
import SettingsScreen from './screens/SettingsScreen'


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} 
            options={{
                headerShown: false,
            }}
            />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
