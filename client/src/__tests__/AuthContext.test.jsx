import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../Context/AuthContext";
import { useAuth } from "../Hooks/useAuth";
import { authAPI } from "../Services/api";

// Mock the API layer used by AuthContext
vi.mock("../Services/api", () => ({
  authAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateMe: vi.fn(),
  },
}));

// Helper consumer component to expose AuthContext state and actions to tests
function TestConsumer({ onStateChange }) {
  const auth = useAuth();
  if (onStateChange) {
    onStateChange(auth);
  }
  return (
    <div>
      <div data-testid="user-name">{auth.user?.fullName || "No User"}</div>
      <div data-testid="is-authenticated">{auth.isAuthenticated ? "Yes" : "No"}</div>
      <div data-testid="loading">{auth.loading ? "Loading" : "Ready"}</div>
      <div data-testid="error">{auth.error || "No Error"}</div>
      <button
        data-testid="login-btn"
        onClick={() =>
          auth.login({ email: "user@example.com", password: "password123" }).catch(() => {})
        }
      >
        Log In
      </button>
      <button
        data-testid="register-btn"
        onClick={() =>
          auth
            .register({
              fullName: "Jane Doe",
              username: "janedoe",
              email: "jane@example.com",
              password: "password123",
            })
            .catch(() => {})
        }
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Log Out
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("INITIAL AUTH CHECK", () => {
    it("calls /auth/me endpoint on mount via authAPI.getMe", async () => {
      authAPI.getMe.mockResolvedValueOnce({
        data: { user: { id: "1", fullName: "John Doe", email: "john@example.com" } },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(authAPI.getMe).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
      });
    });

    it("has expected initial loading state while request is pending", () => {
      // Pending promise that never resolves during this check
      authAPI.getMe.mockReturnValueOnce(new Promise(() => {}));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("No");
      expect(screen.getByTestId("user-name")).toHaveTextContent("No User");
    });

    it("sets user, updates authentication state, and sets loading to false when /auth/me succeeds", async () => {
      const mockUser = { id: "1", fullName: "John Doe", email: "john@example.com" };
      authAPI.getMe.mockResolvedValueOnce({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
      });

      expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Yes");
    });
  });

  describe("UNAUTHENTICATED USER", () => {
    it("handles unauthenticated session when /auth/me returns 401 / error without crashing", async () => {
      authAPI.getMe.mockRejectedValueOnce({
        response: { status: 401, data: { message: "Unauthorized" } },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
      });

      expect(screen.getByTestId("user-name")).toHaveTextContent("No User");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("No");
      expect(screen.getByTestId("error")).toHaveTextContent("No Error");
    });
  });

  describe("LOGIN SUCCESS", () => {
    it("logs in successfully, calling authAPI.login with correct credentials and updating current user", async () => {
      const user = userEvent.setup();
      authAPI.getMe.mockRejectedValueOnce(new Error("Not logged in"));
      const mockUser = { id: "10", fullName: "Alice Smith", email: "user@example.com" };
      authAPI.login.mockResolvedValueOnce({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
      });

      await user.click(screen.getByTestId("login-btn"));

      expect(authAPI.login).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Yes");
      });

      expect(screen.getByTestId("user-name")).toHaveTextContent("Alice Smith");
    });
  });

  describe("LOGIN FAILURE", () => {
    it("does not authenticate after failed login and exposes the error message", async () => {
      const user = userEvent.setup();
      authAPI.getMe.mockRejectedValueOnce(new Error("Not logged in"));
      authAPI.login.mockRejectedValueOnce({
        response: { data: { message: "Incorrect email or password." } },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
      });

      await user.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Incorrect email or password.");
      });

      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("No");
      expect(screen.getByTestId("user-name")).toHaveTextContent("No User");
    });
  });

  describe("REGISTER", () => {
    it("executes register flow and subsequent login to authenticate the user", async () => {
      const user = userEvent.setup();
      authAPI.getMe.mockRejectedValueOnce(new Error("Not logged in"));

      const mockUser = {
        id: "20",
        fullName: "Jane Doe",
        username: "janedoe",
        email: "jane@example.com",
      };

      authAPI.register.mockResolvedValueOnce({ data: { message: "User registered" } });
      authAPI.login.mockResolvedValueOnce({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
      });

      await user.click(screen.getByTestId("register-btn"));

      expect(authAPI.register).toHaveBeenCalledWith({
        fullName: "Jane Doe",
        username: "janedoe",
        email: "jane@example.com",
        password: "password123",
      });

      expect(authAPI.login).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "password123",
      });

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Yes");
      });

      expect(screen.getByTestId("user-name")).toHaveTextContent("Jane Doe");
    });
  });

  describe("LOGOUT", () => {
    it("logs out the current user, calling authAPI.logout and resetting auth state", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", fullName: "John Doe", email: "john@example.com" };
      authAPI.getMe.mockResolvedValueOnce({ data: { user: mockUser } });
      authAPI.logout.mockResolvedValueOnce({ data: { message: "Logged out" } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Yes");
      });

      await user.click(screen.getByTestId("logout-btn"));

      expect(authAPI.logout).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("No");
      });

      expect(screen.getByTestId("user-name")).toHaveTextContent("No User");
    });

    it("clears user state even if logout API request fails", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", fullName: "John Doe", email: "john@example.com" };
      authAPI.getMe.mockResolvedValueOnce({ data: { user: mockUser } });
      authAPI.logout.mockRejectedValueOnce(new Error("Network error"));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Yes");
      });

      await user.click(screen.getByTestId("logout-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("No");
      });

      expect(screen.getByTestId("user-name")).toHaveTextContent("No User");
    });
  });
});
