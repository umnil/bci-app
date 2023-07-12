import * as ActionTypes from "./actionTypes";

export const addPreset = (preset) => { 
    return {
        type: ActionTypes.ADD_PRESET,
        payload: {preset: preset}
    };
};

export const deletePreset = (id) => { 
    return {
        type: ActionTypes.DELETE_PRESET,
        payload: {id: id}
    };
};
