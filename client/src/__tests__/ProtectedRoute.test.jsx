import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import ProtectedRoute from "../Components/ProtectedRoute";

function LocationStateConsumer() {
  const location = useLocation();
  return (
    <div>
      <div data-testid="login-page">Login Page</div>
      <div data-testid="from-pathname">{location.state?.from?.pathname || "No location state"}</div>
    </div>
  );
}

function renderWithAuth(ui, { isAuthenticated = false, loading = false, initialEntries = ["/dashboard"] } = {}) {
  const authValue = {
    user: isAuthenticated ? { id: "1", username: "testuser" } : null,
    isAuthenticated,
    loading,
    error: null,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LocationStateConsumer />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Dashboard Protected Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("ProtectedRoute", () => {
  describe("LOADING STATE", () => {
    it("does not redirect prematurely and does not render protected content while checking session", () => {
      renderWithAuth(null, { isAuthenticated: false, loading: true });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
    });
  });

  describe("AUTHENTICATED USER", () => {
    it("renders protected content for authenticated users without redirecting to login", () => {
      renderWithAuth(null, { isAuthenticated: true, loading: false });

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
    });
  });

  describe("UNAUTHENTICATED USER", () => {
    it("redirects unauthenticated users to /login", () => {
      renderWithAuth(null, { isAuthenticated: false, loading: false });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });

  describe("RETURN LOCATION", () => {
    it("preserves originally requested location in navigation state upon redirecting to /login", () => {
      renderWithAuth(null, { isAuthenticated: false, loading: false, initialEntries: ["/dashboard"] });

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
      expect(screen.getByTestId("from-pathname")).toHaveTextContent("/dashboard");
    });
  });
});
