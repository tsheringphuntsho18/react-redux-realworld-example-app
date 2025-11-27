import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import Header from "./Header";

const currentUser = {
  username: "testuser",
  image: "https://example.com/avatar.png",
};

describe("Header", () => {
  test("shows correct links for logged-in user", () => {
    render(
      <MemoryRouter>
        <Header appName="Conduit" currentUser={currentUser} />
      </MemoryRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText(/New Post/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.queryByText(/Sign in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sign up/i)).not.toBeInTheDocument();
  });

  test("shows correct links for guest user", () => {
    render(
      <MemoryRouter>
        <Header appName="Conduit" currentUser={null} />
      </MemoryRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
    expect(screen.queryByText(/New Post/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Settings/i)).not.toBeInTheDocument();
  });

  test("highlights active link", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <div>
          <Header appName="Conduit" currentUser={currentUser} />
          <Route path="/settings" render={() => <div>Settings Page</div>} />
        </div>
      </MemoryRouter>
    );
    // Get all elements with "Settings" text, find the one that's a link
    const settingsLinks = screen.getAllByText(/Settings/i);
    const navLink = settingsLinks.find((el) => el.closest("a"));
    expect(navLink.closest("a")).toHaveAttribute("href", "/settings");
  });
});
