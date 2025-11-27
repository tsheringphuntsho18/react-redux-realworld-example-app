import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import * as actions from "./actions";
import { LOGIN, REGISTER, LOGOUT } from "./constants/actionTypes";

// Mock agent for async actions
jest.mock("./agent", () => ({
  Auth: {
    login: jest.fn(() => Promise.resolve({ user: { username: "test" } })),
    register: jest.fn(() => Promise.resolve({ user: { username: "newuser" } })),
  },
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Action Creators", () => {
  test("should return correct action type for LOGIN", () => {
    const payload = { user: "test" };
    const action = actions.login(payload);
    expect(action.type).toBe(LOGIN);
  });

  test("should include correct payload for REGISTER", () => {
    const payload = { user: "newuser" };
    const action = actions.register(payload);
    expect(action).toMatchObject({
      type: REGISTER,
      payload,
    });
  });

  test("should return correct action type for LOGOUT", () => {
    const action = actions.logout();
    expect(action.type).toBe(LOGOUT);
  });
});

describe("Async Actions", () => {
  afterEach(() => jest.clearAllMocks());

  test("dispatches LOGIN on successful login", async () => {
    const store = mockStore({});
    const payload = { email: "test@test.com", password: "pass" };
    await store.dispatch(actions.loginAsync(payload));
    const dispatched = store.getActions();
    expect(dispatched).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: LOGIN })])
    );
  });

  test("dispatches REGISTER on successful register", async () => {
    const store = mockStore({});
    const payload = {
      username: "newuser",
      email: "new@test.com",
      password: "pass",
    };
    await store.dispatch(actions.registerAsync(payload));
    const dispatched = store.getActions();
    expect(dispatched).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: REGISTER })])
    );
  });
});
