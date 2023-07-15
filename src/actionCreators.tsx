import { ActionType } from "./actionTypes";

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
