import { View, Button } from 'react-native';
import  PropTypes from "prop-types";

export default function TwoPanelButton(props) {

    return (
        <View>
            <Button title={props.titleLeft} onPress={props.onPressLeft}/ >
            <Button title={props.titleRight} onPress={props.onPressRight}/ >
        </View>
    );
}

TwoPanelButton.defaultProps = {
    titleLeft: "Left",
    titleRight: "Right",
    disabledLeft: false,
    disabledRight: false,
};

TwoPanelButton.propTypes = {
    titleLeft: PropTypes.string.isRequired,
    titleRight: PropTypes.string.isRequired,
    disabledLeft: PropTypes.bool.isRequired,
    disabledRight: PropTypes.bool.isRequired,
    onPressLeft(props, ...rest) {
        if (!props.disabledLeft) {
            return PropTypes.func.isRequired(props, ...rest);     
        }
        return PropTypes.func(props, ...rest);     
    }, 
    onPressRight(props, ...rest) {
        if (!props.disabledRight) {
            return PropTypes.func.isRequired(props, ...rest);     
        }
        return PropTypes.func(props, ...rest);     
    },
};
    


