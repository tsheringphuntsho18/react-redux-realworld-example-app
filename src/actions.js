import agent from "./agent";
import { LOGIN, REGISTER, LOGOUT } from "./constants/actionTypes";

// Synchronous action creators
export function login(payload) {
  return { type: LOGIN, payload };
}

export function register(payload) {
  return { type: REGISTER, payload };
}

export function logout() {
  return { type: LOGOUT };
}

// Async action creators (redux-thunk)
export function loginAsync(payload) {
  return async (dispatch) => {
    const user = await agent.Auth.login(payload);
    dispatch({ type: LOGIN, payload: user });
  };
}

export function registerAsync(payload) {
  return async (dispatch) => {
    const user = await agent.Auth.register(payload);
    dispatch({ type: REGISTER, payload: user });
  };
}
