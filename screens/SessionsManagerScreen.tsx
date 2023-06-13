import { StyleSheet, Button, FlatList, Text, View } from 'react-native';

const data = new Array(100)
  .fill(null)
  .map((v, i) => ({ key: i.toString(), value: ('Item ' + i.toString())
}));

export default function SessionsManagerScreen({ route, navigation }) {
    return (
        <View>
            <FlatList
                data={data}
                renderItem={({item}) => <Button 
                                            title={item.value} 
                                            onPress={() => {navigation.navigate("Data Collection", {});}}
                                        />
                }
            />
        </View>
    );
}
