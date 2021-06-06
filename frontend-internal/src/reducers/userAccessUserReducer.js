import { UPDATE_USERS } from "../actions/types";
const initialState = {
    userAccessUsers: { newUsers: [], removedUsers: [] }
};

const userAccessReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_USERS:
            return {
                ...state,
                userAccessUsers: action.payload
            };
        default: {
            return state;
        }
    }
}

export default userAccessReducer;