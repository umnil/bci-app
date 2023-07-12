import { StyleSheet, Pressable, FlatList, Text, View } from 'react-native';
import { useEffect } from 'react';
import * as ActionCreators from '../actionCreators';
import { connect } from 'react-redux';
import Icon from "react-native-vector-icons/Ionicons";
import Animated, {Layout, FadeInRight, FadeOutRight, FadeIn, FadeOut} 
from 'react-native-reanimated';

function PresetManagerScreen({presets, deletePreset, route, navigation, isEdit, setEdit }) {

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setEdit(false); 
        });
             return unsubscribe;
    }, [navigation]); 

    return (
            <Animated.FlatList
                layout={Layout}
                data={presets}
                renderItem={({item}) => 
                    <Animated.View 
                        entering={FadeIn} 
                        layout={Layout}
                    >
                    <Pressable onPress={() => {
                              if (!isEdit) {
                               navigation.navigate("Data Collection", {preset: item});
                              }
                        }}
                    >
                            <View style={styles.itemContainer} key={item.id}>
                                
                                <View style={styles.textContainer} key={item.id}>
                                        <Text style={styles.text}> {item.name} </Text> 
                                        <Text style={styles.subtext}> Preset </Text> 
                                </View>
                                    {isEdit ? 
                                        <Animated.View 
                                         entering={FadeInRight} 
                                         exiting={FadeOutRight} 
                                         style={styles.delete}
                                        >
                                        <Pressable 
                                         onPress={() => deletePreset(item.id)}
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
}

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

const mapStateToProps = (state) => {
    return {
        presets: state.presets,
    };
};

const matchDispatchToProps = (dispatch) => {
    return {
        deletePreset: (e) => dispatch(ActionCreators.deletePreset(e)),
    };
};     


export default connect(mapStateToProps, matchDispatchToProps)(PresetManagerScreen);
