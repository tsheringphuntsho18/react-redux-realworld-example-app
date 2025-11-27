import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import configureStore from "./store"; // import the store creator, not the store instance

export function renderWithProviders(
  ui,
  { route = "/", store = configureStore() } = {}
) {
  window.history.pushState({}, "Test page", route);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  );
}
