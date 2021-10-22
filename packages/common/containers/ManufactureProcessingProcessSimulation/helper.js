export const reducer = (state, action) => {
  switch (action.type) {
    case 'start':
      return { ...state, isRunning: true };
    case 'stop':
      return { ...state, isRunning: false };
    case 'reset':
      return { isRunning: false, time: 0 };
    case 'tick':
      return { ...state, time: state.time + 1 };
    default:
      throw new Error();
  }
};
