export const SHOW_ALERT_SUCCESS = "SHOW_ALERT_SUCCESS";
export const SHOW_ALERT_ERROR = "SHOW_ALERT_ERROR";
export const HIDE_ALERT = "HIDE_ALERT";

export const showSuccessAlert = ({ message }) => {
    return {
        type: SHOW_ALERT_SUCCESS,
        payload: { message }
    };
};

export const showErrorAlert = ({ message }) => {
    return {
        type: SHOW_ALERT_ERROR,
        payload: { message }
    };
};

export const hideAlert = () => {
    return {
        type: HIDE_ALERT
    };
};
