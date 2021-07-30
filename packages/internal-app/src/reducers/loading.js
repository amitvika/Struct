const initialState = {
  isLoading: false
};

export const loading = (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_LOADER':
      state.isLoading = true;
      return state;
    case 'STOP_LOADER':
      state.isLoading = false;
      return state
    default:
      return state;
  }
};

export default loading;