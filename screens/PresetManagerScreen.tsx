import { StyleSheet, Button, FlatList, Text, View } from 'react-native';
import { useEffect } from 'react';

const data = new Array(100)
  .fill(null)
  .map((v, i) => ({ key: i.toString(), value: ('Item ' + i.toString())
}));

export default function PresetManagerScreen({ route, navigation, isEdit, setEdit }) {

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setEdit(false); 
        });
             return unsubscribe;
    }, [navigation]); 

    return (
        <View>
            <FlatList
                data={data}
                renderItem={({item}) => 
                    <Button 
                        title={item.value} 
                        onPress={() => {navigation.navigate("Data Collection", {});}}
                    />
                }
            />
        </View>
    );
}
