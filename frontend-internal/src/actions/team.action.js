import * as Types from "./types";
import TeamSetupAPI from '../api/teamSetup.api';

export const fetchTeamAction = () => (dispatch, getState) => {
    dispatch({ type: Types.TEAMS_LOADING }); //sets idloading to true

    TeamSetupAPI.fetchTeams()
        .then(res => {
            dispatch({
                type: Types.TEAMS_SUCCESS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type: Types.TEAMS_ERROR
            });
        });
};