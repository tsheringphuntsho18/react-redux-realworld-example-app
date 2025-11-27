import auth from "./auth";
import {
  LOGIN,
  REGISTER,
  LOGOUT,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH,
} from "../constants/actionTypes";

describe("auth reducer", () => {
  it("should handle LOGIN action and update state", () => {
    const prevState = { inProgress: true };
    const action = {
      type: LOGIN,
      payload: {
        user: { username: "testuser" },
        token: "abc123",
      },
    };
    const nextState = auth(prevState, action);
    expect(nextState.inProgress).toBe(false);
    expect(nextState.errors).toBeNull();
  });

  it("should handle LOGOUT action and clear state", () => {
    const prevState = {
      user: { username: "testuser" },
      token: "abc123",
      inProgress: false,
    };
    const clearAction = { type: LOGIN_PAGE_UNLOADED };
    const nextState = auth(prevState, clearAction);
    expect(nextState).toEqual({});
  });

  it("should handle REGISTER action and update state", () => {
    const prevState = { inProgress: true };
    const action = {
      type: REGISTER,
      payload: {
        user: { username: "newuser" },
        token: "def456",
      },
    };
    const nextState = auth(prevState, action);
    expect(nextState.inProgress).toBe(false);
    expect(nextState.errors).toBeNull();
  });

  it("should handle authentication errors", () => {
    const prevState = { inProgress: true };
    const action = {
      type: LOGIN,
      error: true,
      payload: {
        errors: { email: "is invalid", password: "is too short" },
      },
    };
    const nextState = auth(prevState, action);
    expect(nextState.inProgress).toBe(false);
    expect(nextState.errors).toEqual({
      email: "is invalid",
      password: "is too short",
    });
  });
});
