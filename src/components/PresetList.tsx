import { SafeAreaView, StyleSheet, Pressable, FlatList, Text, View } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import Animated, {Layout, FadeInRight, FadeOutRight, FadeIn, FadeOut} 
from 'react-native-reanimated';

export default function PresetList(props) {
    return (
            <Animated.FlatList
                layout={Layout}
                data={props.presets}
                renderItem={({item}) => 
                    <Animated.View 
                        entering={FadeIn} 
                        layout={Layout}
                    >
                    <Pressable onPress={() => {
                        if (!props.isEdit) {
                           props.onRegularPress(item);
                        } else {
                           props.onEditPress(item);
                        }
                     }}
                    >
                            <View style={styles.itemContainer} key={item.id}>
                                
                                <View style={styles.textContainer} key={item.id}>
                                        <Text style={styles.text}> {item.name} </Text> 
                                        <Text style={styles.subtext}> Preset </Text> 
                                </View>
                                    {props.isEdit ? 
                                        <Animated.View 
                                         entering={FadeInRight} 
                                         exiting={FadeOutRight} 
                                         style={styles.delete}
                                        >
                                        <Pressable 
                                         onPress={() => props.onDeletePress(item)}
                                        >
                                            <Icon
                                             name="ios-remove-circle-sharp"
                                             size={35}    
                                             color="red"
                                            />
                                        </Pressable>
                                        </Animated.View>
                                     : <></>
                                    }
                            </View>
                    </Pressable>
                    </Animated.View>
                }
            />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.3,
        paddingTop: 10,
        paddingBottom: 10,
    },
    textContainer: {
        flexDirection: 'column',
    },

    text: {
        fontSize: 40,
    },
    subtext: {
        paddingLeft: 5,
        fontSize: 15,
    },
    delete: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

