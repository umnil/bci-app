import { StyleSheet, Button, FlatList, Text, View } from 'react-native';
import { useEffect } from 'react';
import { getPresets } from '../reducer';
import { connect } from 'react-redux';

function PresetManagerScreen({ presets, route, navigation, isEdit, setEdit }) {

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
                    <Button 
                        title={item.name} 
                        onPress={() => {navigation.navigate("Data Collection", {});}}
                        key={item.id}
                    />
                }
            />
        </View>
    );
}

const mapStateToProps = state => {
    return {
        presets: state.presets,
    };
}

const matchDispatchToProps = {
    getPresets
};

export default connect(mapStateToProps, matchDispatchToProps)(PresetManagerScreen);
