import FormDropdownMenu from "./FormDropdownMenu";
import FormSlider from "./FormSlider";
import PropTypes from "prop-types";

export default function DeviceSettingsList(props) {
    return (
        <>
            {
                props.settings.map((obj) => {
                    switch(obj.type) {
                        case "ListPicker":    
                            return (<FormDropdownMenu 
                            key={obj.name}
                            display={props.display}
                            items={obj.items.map((curr, index) => 
                                ({label: curr + "", value: index}))} 
                            selected={{label: obj.items[parseInt(obj.value)] + "", value: parseInt(obj.value)}}
                            label={obj.display_name}
                            onSelect={(item) => props.onChange(obj.name, item.value)}/>);
                            
                        case "Slider":    
                            return (<FormSlider 
                            key={obj.name}
                            display={props.display}
                            lower={parseFloat(obj.minValue)} 
                            upper={parseFloat(obj.maxValue)} 
                            initial={parseFloat(obj.value)} 
                            label={obj.display_name}
                            onSlide={(item) => props.onChange(obj.name, item)}/>);
                    }
                })
            }
            
        </>
    );

}

DeviceSettingsList.defaultProps = {
    display: true, 
    onChange: (fieldName, value) => {},
};


DeviceSettingsList.propTypes = {
    display: PropTypes.bool.isRequired,
    settings: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        dispaly_name: PropTypes.string.isRequired,
        items(props, ...rest) {
            if (props.type == "ListPicker") {
                return PropTypes.arrayOf(Proptypes.string).isRequired(props, ...rest);
            }     
            return PropTypes.any(props, ...rest);
        },
        minValue(props, ...rest) {
            if (props.type == "Slider") {
                return PropTypes.number.isRequired(props, ...rest);
            }     
            return PropTypes.any(props, ...rest);
        },
        maxValue(props, ...rest) {
            if (props.type == "Slider") {
                return PropTypes.number.isRequired(props, ...rest);
            }     
            return PropTypes.any(props, ...rest);
        },
 
        value: PropTypes.number.isRequired,
 
    })).isRequired,
    display: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};
 

