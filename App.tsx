import { Text, View, Button } from 'react-native';
import { NavigationContainer } from
  "@react-navigation/native";
import { createNativeStackNavigator } from
  "@react-navigation/native-stack";
import HomeScreen from './screens/HomeScreen'
import DataCollectionScreen from './screens/DataCollectionScreen'
import SessionsCreationScreen from "./screens/SessionsCreationScreen"

 
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Sessions Manager" component={HomeScreen} 
            options={{
                headerShown: false,
            }}
                            />
            <Stack.Screen name="Create Session" component={SessionsCreationScreen}/>
            <Stack.Screen name="Data Collection" component={DataCollectionScreen}/>
        </Stack.Navigator>
    </NavigationContainer>
  );
}
/*
*/
