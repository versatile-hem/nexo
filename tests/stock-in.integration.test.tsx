import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StockInPage } from "@/features/inventory/pages/StockInPage";
import { productService } from "@/services/productService";
import { operationsApi } from "@/services/operationsApi";

vi.mock("@/services/productService", () => ({
  productService: {
    getProducts: vi.fn(),
  },
}));

vi.mock("@/services/operationsApi", () => ({
  operationsApi: {
    stockIn: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <StockInPage />
    </QueryClientProvider>,
  );
}

describe("StockInPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getProducts as any).mockResolvedValue([
      { id: "1", name: "Ebook", sku: "EBK-01" },
    ]);
    (operationsApi.stockIn as any).mockResolvedValue([{ productId: "1", quantity: 100 }]);
  });

  it("submits stock-in line items and renders result rows", async () => {
    renderPage();

    const productButton = await screen.findByRole("button", { name: /select product/i });
    fireEvent.click(productButton);
    fireEvent.click(screen.getByRole("button", { name: /ebook/i }));

    fireEvent.change(screen.getByDisplayValue("1"), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: "Add Stock" }));

    await waitFor(() => expect(operationsApi.stockIn).toHaveBeenCalled());
    expect(await screen.findByText("Updated Inventory Result")).toBeInTheDocument();
  });
});
