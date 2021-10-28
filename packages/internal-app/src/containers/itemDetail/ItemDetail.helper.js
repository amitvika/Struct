export const types = {
  PET: 'PET',
  COLOR: 'COLOR'
};

export const initialState = {
  color: 'black',
  pet: 'cat'
};

export const reducer = (state, action) => {
  switch (action.type) {
    case types.PET:
      return { ...state, pet: action.value };
    case types.COLOR:
      return { ...state, color: action.value };
  }
};
