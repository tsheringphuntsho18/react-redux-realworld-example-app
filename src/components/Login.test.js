import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import Login from "./Login";

jest.mock("../agent", () => ({
  Auth: {
    login: jest.fn(() =>
      Promise.resolve({ user: { email: "test@example.com", token: "token" } })
    ),
  },
}));

const mockStore = configureStore([]);

function renderWithStore(storeState = {}) {
  const store = mockStore({
    auth: {
      email: "",
      password: "",
      errors: null,
      inProgress: false,
      ...storeState,
    },
  });
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    ),
    store,
  };
}

describe("Login", () => {
  test("renders form fields and sign in button", () => {
    renderWithStore();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/need an account/i)).toBeInTheDocument();
  });

  test("dispatches action on input change", () => {
    const { store } = renderWithStore();
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "UPDATE_FIELD_AUTH",
          key: "email",
          value: "user@example.com",
        }),
      ])
    );
  });

  test("calls onSubmit when form is submitted", () => {
    const store = mockStore({
      auth: {
        email: "user@example.com",
        password: "mypassword",
        errors: null,
        inProgress: false,
      },
    });
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    const form = container.querySelector("form");
    fireEvent.submit(form);
    const actions = store.getActions();
    expect(actions.some((a) => a.type === "LOGIN")).toBe(true);
  });

  test("displays error messages", () => {
    const errors = { "email or password": ["is invalid"] };
    renderWithStore({ errors });
    expect(screen.getByText(/email or password/i)).toBeInTheDocument();
    expect(screen.getByText(/is invalid/i)).toBeInTheDocument();
  });

  test("redirects after successful login (simulate by checking LOGIN action)", () => {
    const store = mockStore({
      auth: {
        email: "user@example.com",
        password: "mypassword",
        errors: null,
        inProgress: false,
      },
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );
    const form = container.querySelector("form");
    fireEvent.submit(form);
    const actions = store.getActions();
    expect(actions.some((a) => a.type === "LOGIN")).toBe(true);
  });
});
