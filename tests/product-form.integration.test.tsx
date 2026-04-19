import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductFormPage } from "@/features/inventory/pages/ProductFormPage";
import { productsApi } from "@/services/productsApi";

const navigateMock = vi.fn();
const paramsMock = vi.fn(() => ({}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => paramsMock(),
  };
});

vi.mock("@/services/productsApi", () => ({
  productsApi: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductFormPage />
    </QueryClientProvider>,
  );
}

describe("ProductFormPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paramsMock.mockReturnValue({});
  });

  it("creates product on submit", async () => {
    (productsApi.create as any).mockResolvedValue({ id: "1" });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Ebook" } });
    fireEvent.change(screen.getByPlaceholderText("SKU"), { target: { value: "EBK-01" } });
    fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("Opening stock"), { target: { value: "20" } });
    fireEvent.change(screen.getByPlaceholderText("Category"), { target: { value: "Digital" } });

    fireEvent.click(screen.getByRole("button", { name: "Save Product" }));

    await waitFor(() => expect(productsApi.create).toHaveBeenCalled());
  });

  it("updates product on edit mode", async () => {
    paramsMock.mockReturnValue({ productId: "10" });
    (productsApi.getById as any).mockResolvedValue({
      id: "10",
      name: "Old",
      sku: "OLD-1",
      price: 5,
      stock: 4,
      category: "Cat",
      barcode: "123",
    });
    (productsApi.update as any).mockResolvedValue({ id: "10" });

    renderPage();

    await waitFor(() => expect(productsApi.getById).toHaveBeenCalledWith("10"));

    fireEvent.change(screen.getByPlaceholderText("Product name"), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Product" }));

    await waitFor(() => expect(productsApi.update).toHaveBeenCalledWith("10", expect.any(Object)));
  });
});
