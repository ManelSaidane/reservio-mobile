import { Dispatch } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assurez-vous d'avoir cette dépendance
import { API_BASE_URL } from '@env';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LoginAction = (form: { email: string; password: string }) => async (dispatch: Dispatch) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.access_token) {
        // Stockage du token dans Redux
        dispatch({ type: LOGIN_SUCCESS, payload: data });

        // Stockage du token dans AsyncStorage pour persistance
        await AsyncStorage.setItem('jwt', data.access_token);

        return data; // Return the response data
      } else {
        console.error('Token manquant dans la réponse');
        dispatch({ type: LOGIN_FAILURE, payload: 'Token manquant' });
        return { success: false, error: 'Token manquant' };
      }
    } else {
      dispatch({ type: LOGIN_FAILURE, payload: data.error });
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Login Error:', error);
    dispatch({ type: LOGIN_FAILURE, payload: 'Une erreur est survenue' });
    return { success: false, error: 'Une erreur est survenue' };
  }
};

export const SET_USER = 'SET_USER';

export const setUser = (user: { type: string; token: string }) => ({
  type: SET_USER,
  payload: user,
});

