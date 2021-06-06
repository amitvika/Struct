import { SHOW_ALERT_ERROR, SHOW_ALERT_SUCCESS, HIDE_ALERT } from '../actions/alert.action';

const initialState = {
    message: '',
    success: false,
    isVisible: false
}

export default function alertReducer(state = initialState, action) {
    switch (action.type) {
        case SHOW_ALERT_SUCCESS:
            return {
                isVisible: true,
                success: true,
                message: action.payload.message
            };
        case SHOW_ALERT_ERROR:
            return {
                isVisible: true,
                success: false,
                message: action.payload.message
            };

        case HIDE_ALERT:
            return {
                isVisible: false,
                success: true,
                message: ''
            };
        default: return state;
    }
}