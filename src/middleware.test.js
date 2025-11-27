import { promiseMiddleware, localStorageMiddleware } from "./middleware";
import {
  ASYNC_START,
  ASYNC_END,
  LOGIN,
  LOGOUT,
  REGISTER,
} from "./constants/actionTypes";

jest.mock("./agent", () => ({
  setToken: jest.fn(),
}));

describe("promiseMiddleware", () => {
  it("should unwrap resolved promises and dispatch ASYNC_START, ASYNC_END, and original action", async () => {
    const store = {
      getState: () => ({ viewChangeCounter: 0 }),
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    const payload = Promise.resolve({ user: { username: "test" } });
    const action = { type: LOGIN, payload };

    promiseMiddleware(store)(next)(action);

    expect(store.dispatch).toHaveBeenCalledWith({
      type: ASYNC_START,
      subtype: LOGIN,
    });

    await payload;

    expect(store.dispatch).toHaveBeenCalledWith({
      type: ASYNC_END,
      promise: { user: { username: "test" } },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LOGIN,
      payload: { user: { username: "test" } },
    });
  });

  it("should dispatch error action on rejected promise", async () => {
    const store = {
      getState: () => ({ viewChangeCounter: 0 }),
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    const error = {
      response: { body: { errors: { body: ["Invalid credentials"] } } },
    };
    const payload = Promise.reject(error);
    const action = { type: LOGIN, payload };

    // Silence expected error logs
    jest.spyOn(console, "log").mockImplementation(() => {});

    promiseMiddleware(store)(next)(action);

    try {
      await payload;
    } catch {}

    expect(store.dispatch).toHaveBeenCalledWith({
      type: ASYNC_START,
      subtype: LOGIN,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: ASYNC_END,
      promise: error.response.body,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LOGIN,
      payload: error.response.body,
      error: true,
    });

    console.log.mockRestore();
  });

  it("should cancel request if viewChangeCounter changes before promise resolves", async () => {
    let viewChangeCounter = 0;
    const store = {
      getState: () => ({ viewChangeCounter }),
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    let resolvePromise;
    const payload = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    const action = { type: LOGIN, payload };

    promiseMiddleware(store)(next)(action);

    // Simulate view change before promise resolves
    viewChangeCounter = 1;
    resolvePromise({ user: { username: "test" } });
    await payload;

    expect(store.dispatch).toHaveBeenCalledWith({
      type: ASYNC_START,
      subtype: LOGIN,
    });
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: ASYNC_END })
    );
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: LOGIN,
        payload: { user: { username: "test" } },
      })
    );
  });
});

describe("localStorageMiddleware", () => {
  let setItemMock;

  beforeEach(() => {
    setItemMock = jest.fn();
    Object.defineProperty(window.localStorage, "setItem", {
      value: setItemMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    // Optionally restore setItem if needed
    Object.defineProperty(window.localStorage, "setItem", {
      value: Storage.prototype.setItem,
      configurable: true,
      writable: true,
    });
  });

  it("should save token to localStorage and agent on LOGIN/REGISTER", () => {
    const token = "jwt.token.value";
    const action = { type: LOGIN, payload: { user: { token } } };
    const store = {};
    const next = jest.fn();

    const agent = require("./agent");
    agent.setToken = jest.fn();

    localStorageMiddleware(store)(next)(action);

    expect(setItemMock).toHaveBeenCalledWith("jwt", token);
    expect(agent.setToken).toHaveBeenCalledWith(token);
    expect(next).toHaveBeenCalledWith(action);
  });

  it("should clear token on LOGOUT", () => {
    const action = { type: LOGOUT };
    const store = {};
    const next = jest.fn();

    const agent = require("./agent");
    agent.setToken = jest.fn();

    localStorageMiddleware(store)(next)(action);

    expect(setItemMock).toHaveBeenCalledWith("jwt", "");
    expect(agent.setToken).toHaveBeenCalledWith(null);
    expect(next).toHaveBeenCalledWith(action);
  });
});
