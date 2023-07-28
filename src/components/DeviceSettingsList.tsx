import FormDropdownMenu from "./FormDropdownMenu";
import FormSlider from "./FormSlider";
import DeviceSetting from "./DeviceSetting";
import PropTypes from "prop-types";

export default function DeviceSettingsList(props) {
    return (
        <>
            {
                props.settings.map((setting) => 
                    <DeviceSetting 
                     setting={setting} 
                     display={props.display} 
                     onChange={props.onChange}/>    
                )
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
    settings: PropTypes.arrayOf(PropTypes.any).isRequired,
    onChange: PropTypes.func.isRequired,
};
 

