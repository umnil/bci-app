import FormDropdownMenu from "./FormDropdownMenu";
import FormSlider from "./FormSlider";
import PropTypes from "prop-types";

function DeviceSettingTopLevel(props){
    const setting = props.setting;
    switch(setting.type) {
        case "discrete":    
            return (<FormDropdownMenu 
            key={setting.name}
            display={props.display}
            items={setting.items.map((curr, index) => 
                ({label: curr + "", value: index}))} 
            selected={{label: setting.items[parseInt(setting.value)] + "", value: parseInt(setting.value)}}
            label={setting.display_name}
            onSelect={(item) => props.onChange(setting.name, item.value)}/>);
            
        case "continuous":    
            return (<FormSlider 
            key={setting.name}
            display={props.display}
            lower={parseFloat(setting.lowerBound)} 
            upper={parseFloat(setting.upperBound)} 
            initial={parseFloat(setting.value)} 
            label={setting.display_name}
            onSlide={(item) => props.onChange(setting.name, item)}/>);
    }
};

const settings2DeviceSettings = (settings, onChange, display) => {
    let arr = []
    for (var setting of settings) {
        arr.push(<DeviceSetting setting={setting} onChange={onChange} display={display}/>)
    }
    return arr;
};

const settings2DepSettings = (setting) => {
    let arr = [];        
    for (var currDep of setting.dependencies) {
        const item = [];
        for (var itemObj of currDep.items_directory) {
            if (itemObj.parent_value == setting.value) {
                item.push(itemObj);
            }
        }
        if (item.length != 0) {
            arr.push({
                type: currDep.type,
                name: currDep.name,
                display_name: currDep.display_name,
                items: item[0].items,
                value: item[0].value,
                dependencies: item[0].dependencies,
            });
        }
    }
    return arr;
};



export default function DeviceSetting(props) {
    
    const depObjList = settings2DepSettings(props.setting);
    return (
        <>
            <DeviceSettingTopLevel setting={props.setting} onChange={props.onChange} display={props.display}/>
            {settings2DeviceSettings(depObjList, props.onChange, props.display)}
        </>
    );
};

DeviceSetting.defaultProps = {
    display: true, 
    onChange: (fieldName, value) => {},
};


DeviceSetting.propTypes = {
    display: PropTypes.bool.isRequired,
    settings: PropTypes.arrayOf(PropTypes.any).isRequired,
    onChange: PropTypes.func.isRequired,
};
 

