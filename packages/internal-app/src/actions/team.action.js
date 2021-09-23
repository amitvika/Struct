import * as Types from './types';
import TeamSetupAPI from '@monostruct/common/api/teamSetup.api';

export const fetchMyTeamAction = () => (dispatch, getState) => {
  dispatch({ type: Types.TEAMS_LOADING }); //sets idloading to true

  TeamSetupAPI.fetchMyTeams()
    .then((res) => {
      dispatch({
        type: Types.TEAMS_SUCCESS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: Types.TEAMS_ERROR,
      });
    });
};
