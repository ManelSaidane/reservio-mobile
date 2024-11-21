import { LOGIN_SUCCESS, LOGIN_FAILURE, SET_USER } from '../redux/Action/authActions';

const initialState = {
  user: null,
  token: null,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user, // Ajoutez cette ligne si votre réponse contient des informations utilisateur
        token: action.payload.access_token,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
