import 'react-native-gesture-handler';
import { Text, View, Button } from 'react-native';
import { NavigationContainer } from
  '@react-navigation/native';
import { createNativeStackNavigator } from
  '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import DataCollectionScreen from './screens/DataCollectionScreen';
import PresetCreationScreen from './screens/PresetCreationScreen';
import { store, persistor } from './store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
  <Provider store={store}>
  <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} 
            options={{
                headerShown: false,
            }}
                            />
            <Stack.Screen name="Create Preset" component={PresetCreationScreen}
            options={({route, navigation}) => ({
                headerRight: () => {
                    return (
                        <Button
                           title="Save" 
                        />    
                    );
                },
                headerLeft: () => {
                    return (
                        <Button
                           title="Cancel" 
                        />    
                    );
                },
 
            })}
 
                            />
            <Stack.Screen name="Data Collection" component={DataCollectionScreen}/>
        </Stack.Navigator>
    </NavigationContainer>
  </PersistGate>
  </Provider>
  );
}
