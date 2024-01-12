import { ActionType } from "./actionTypes";

/*
addPreset and deletePreset take a packet of data(a preset and id respectfully)
and package them in a payload suitable to use for updating the global redux state
 */

export const addPreset = (preset) => { 
    return {
        type: ActionType.ADD_PRESET,
        payload: {preset: preset}
    };
};

export const deletePreset = (id) => { 
    return {
        type: ActionType.DELETE_PRESET,
        payload: {id: id}
    };
};
