import { StyleSheet, Pressable, FlatList, Text, View } from 'react-native';
import { useEffect } from 'react';
import * as ActionCreators from '../actionCreators';
import { connect } from 'react-redux';

function PresetManagerScreen({presets, deletePreset, route, navigation, isEdit, setEdit }) {

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setEdit(false); 
        });
             return unsubscribe;
    }, [navigation]); 

    return (
        <View>
            <FlatList
                data={presets}
                renderItem={({item}) => 
                <View style={styles.itemContainer} key={item.id}>
                    <Pressable 
                        onPress={() => {
                            navigation.navigate("Data Collection", {preset: item});
                            }}
                    >
                        <Text style={styles.text}> {item.name} </Text> 
                    </Pressable>
                    {isEdit ? 
                        <Pressable 
                            onPress={() => {deletePreset(item.id)}}
                            style={styles.delete}
                        >
                            <Text> Delete </Text> 
                        </Pressable>                
                     : <></>
                    }
                </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text: {
        fontSize: 40,
    },
    delete: {
        justifyContent: 'center'
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
