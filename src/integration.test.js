import React from "react";
import { fireEvent, waitFor, screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import App from "./components/App";
import agent from "./agent";

// Mock agent API calls
jest.mock("./agent", () => ({
  Auth: {
    login: jest.fn(() =>
      Promise.resolve({
        user: { username: "testuser", token: "jwt.token.value" },
      })
    ),
  },
  Articles: {
    create: jest.fn((article) =>
      Promise.resolve({ article: { ...article, slug: "test-article" } })
    ),
    favorite: jest.fn((slug) =>
      Promise.resolve({ article: { slug, favorited: true, favoritesCount: 1 } })
    ),
    unfavorite: jest.fn((slug) =>
      Promise.resolve({
        article: { slug, favorited: false, favoritesCount: 0 },
      })
    ),
    get: jest.fn((slug) =>
      Promise.resolve({
        article: { slug, title: "Test Article", body: "Body", tagList: [] },
      })
    ),
  },
}));

// Utility to login before tests that require authentication
async function loginFlow() {
  renderWithProviders(<App />);
  fireEvent.click(screen.getByText(/sign in/i));
  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "test@test.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
  await waitFor(() =>
    expect(localStorage.getItem("jwt")).toBe("jwt.token.value")
  );
}

describe("Integration Flows", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("Login Flow: render, enter credentials, submit, Redux/localStorage/redirect", async () => {
    renderWithProviders(<App />);
    fireEvent.click(screen.getByText(/sign in/i));
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(localStorage.getItem("jwt")).toBe("jwt.token.value")
    );
    // Redux state: user should be set (simulate by checking UI)
    await waitFor(() =>
      expect(screen.getByText(/testuser/i)).toBeInTheDocument()
    );
    // Redirect: home page should be visible (simulate by checking for "Global Feed")
    expect(screen.getByText(/global feed/i)).toBeInTheDocument();
  });

  test("Article Creation Flow: login, navigate, fill, submit, article appears", async () => {
    await loginFlow();
    fireEvent.click(screen.getByText(/new article/i));
    fireEvent.change(screen.getByPlaceholderText(/article title/i), {
      target: { value: "Integration Test Article" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/what's this article about/i),
      {
        target: { value: "Testing" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText(/write your article/i), {
      target: { value: "This is the body." },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter tags/i), {
      target: { value: "integration" },
    });
    fireEvent.keyUp(screen.getByPlaceholderText(/enter tags/i), {
      key: "Enter",
      keyCode: 13,
    });
    fireEvent.click(screen.getByRole("button", { name: /publish article/i }));

    // Wait for redirect to article page
    await waitFor(() =>
      expect(screen.getByText(/integration test article/i)).toBeInTheDocument()
    );
    // Article should appear in the list (simulate by navigating home)
    fireEvent.click(screen.getByText(/conduit/i)); // Go home
    await waitFor(() =>
      expect(screen.getByText(/integration test article/i)).toBeInTheDocument()
    );
  });

  test("Article Favorite Flow: click favorite, API called, Redux/UI update", async () => {
    await loginFlow();
    // Assume article is already in the list
    fireEvent.click(screen.getByText(/global feed/i));
    // Simulate favorite button (find by label or role)
    const favoriteBtn = await screen.findByLabelText(/favorite/i);
    fireEvent.click(favoriteBtn);

    await waitFor(() => expect(agent.Articles.favorite).toHaveBeenCalled());
    // UI: button style or count should update
    expect(favoriteBtn).toHaveClass("btn-primary");
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  test("Unfavorite Article Flow: click unfavorite, API called, Redux/UI update", async () => {
    await loginFlow();
    fireEvent.click(screen.getByText(/global feed/i));
    // Simulate unfavorite button (find by label or role)
    const unfavoriteBtn = await screen.findByLabelText(/unfavorite/i);
    fireEvent.click(unfavoriteBtn);

    await waitFor(() => expect(agent.Articles.unfavorite).toHaveBeenCalled());
    expect(unfavoriteBtn).not.toHaveClass("btn-primary");
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  test("Login Flow: error on invalid credentials", async () => {
    agent.Auth.login.mockImplementationOnce(() =>
      Promise.reject({
        response: { body: { errors: { "email or password": ["is invalid"] } } },
      })
    );
    renderWithProviders(<App />);
    fireEvent.click(screen.getByText(/sign in/i));
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "bad@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/email or password/i)).toBeInTheDocument()
    );
    expect(localStorage.getItem("jwt")).toBeNull();
  });
});
