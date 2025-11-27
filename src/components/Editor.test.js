import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import Editor from "./Editor";

// Mock agent to avoid real API calls
jest.mock("../agent", () => ({
  Articles: {
    create: jest.fn(() => Promise.resolve({})),
    update: jest.fn(() => Promise.resolve({})),
    get: jest.fn(() => Promise.resolve({})),
  },
}));

const mockStore = configureStore([]);

function renderWithStore(storeState = {}, match = { params: {} }) {
  const store = mockStore({
    editor: {
      title: "",
      description: "",
      body: "",
      tagInput: "",
      tagList: [],
      errors: null,
      inProgress: false,
      ...storeState,
    },
  });
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <Editor match={match} />
        </MemoryRouter>
      </Provider>
    ),
    store,
  };
}

describe("Editor", () => {
  test("renders form fields", () => {
    renderWithStore();
    expect(screen.getByPlaceholderText("Article Title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's this article about?")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your article (in markdown)")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter tags")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publish article/i })
    ).toBeInTheDocument();
  });

  test("tag input functionality: add and remove tag", () => {
    const { store } = renderWithStore();
    const tagInput = screen.getByPlaceholderText("Enter tags");
    fireEvent.change(tagInput, { target: { value: "react" } });
    fireEvent.keyUp(tagInput, { key: "Enter", keyCode: 13 });
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "UPDATE_FIELD_EDITOR",
          key: "tagInput",
          value: "react",
        }),
        expect.objectContaining({ type: "ADD_TAG" }),
      ])
    );
    // Simulate tag in state and test remove
    const { store: removeStore } = renderWithStore({ tagList: ["react"] });
    const tagPill = screen.getByText("react").closest("span");
    const removeBtn = tagPill.querySelector("i");
    fireEvent.click(removeBtn);
    expect(removeStore.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "REMOVE_TAG", tag: "react" }),
      ])
    );
  });

  test("submits form", () => {
    const { store } = renderWithStore({
      title: "Test Title",
      description: "Test Desc",
      body: "Test Body",
      tagList: ["tag1"],
      tagInput: "",
    });
    const publishBtn = screen.getByRole("button", { name: /publish article/i });
    fireEvent.click(publishBtn);
    expect(store.getActions().some((a) => a.type === "ARTICLE_SUBMITTED")).toBe(
      true
    );
  });

  test("displays validation errors", () => {
    renderWithStore({
      errors: { title: ["cannot be blank"], body: ["is too short"] },
    });
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be blank/i)).toBeInTheDocument();
    expect(screen.getByText(/body/i)).toBeInTheDocument();
    expect(screen.getByText(/is too short/i)).toBeInTheDocument();
  });
});
