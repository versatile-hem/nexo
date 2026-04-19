import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { isAdmin, isOperationManager } from "@/utils/roleUtils";

const authState = {
  isAuthenticated: true,
  role: "operation_manager",
};

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean; role: string | null }) => unknown) =>
    selector(authState),
}));

describe("role guards", () => {
  it("role utility helpers work", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isOperationManager("operation_manager")).toBe(true);
    expect(isAdmin("operation_manager")).toBe(false);
  });

  it("redirects unauthorized role to dashboard", () => {
    render(
      <MemoryRouter initialEntries={["/admin-only"]}>
        <Routes>
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Panel</div>
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
