import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DailyOperationsPage } from "@/features/inventory/pages/DailyOperationsPage";
import { productService } from "@/services/productService";
import { inventoryService } from "@/services/inventoryService";
import { operationsApi } from "@/services/operationsApi";
import { stockInService } from "@/services/stockInService";
import { useDailyOpsStore } from "@/store/dailyOpsStore";

vi.mock("@/hooks/useIsMobile", () => ({ useIsMobile: () => false }));

vi.mock("@/services/productService", () => ({
  productService: { getProducts: vi.fn() },
}));

vi.mock("@/services/inventoryService", () => ({
  inventoryService: { getProducts: vi.fn() },
}));

vi.mock("@/services/operationsApi", () => ({
  operationsApi: { dailyOperation: vi.fn() },
}));

vi.mock("@/services/stockInService", () => ({
  stockInService: { hasStockInForDate: vi.fn() },
}));

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <DailyOperationsPage />
    </QueryClientProvider>,
  );
}

describe("DailyOperationsPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getProducts as any).mockResolvedValue([{ id: "1", name: "Ebook", sku: "EBK-01" }]);
    (inventoryService.getProducts as any).mockResolvedValue([{ id: "1", name: "Ebook" }]);
    (stockInService.hasStockInForDate as any).mockResolvedValue(true);
    (operationsApi.dailyOperation as any).mockResolvedValue({ productId: "1", quantity: 10 });

    useDailyOpsStore.setState({
      date: "2026-04-19",
      channel: "Meesho",
      orders: [{ courier: "Shadowfax", productId: "1", productName: "Ebook", qty: 2, unit: "nos" }],
      returns: [],
    } as any);
  });

  it("submits ORDER flow and calls daily operation API", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Save Daily Report/i }));

    await waitFor(() => expect(operationsApi.dailyOperation).toHaveBeenCalledWith(expect.objectContaining({ type: "ORDER" })));
  });

  it("submits RETURN flow and calls daily operation API", async () => {
    useDailyOpsStore.setState({
      orders: [],
      returns: [{ productId: "1", productName: "Ebook", qty: 1, unit: "nos" }],
    } as any);

    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Save Daily Report/i }));

    await waitFor(() => expect(operationsApi.dailyOperation).toHaveBeenCalledWith(expect.objectContaining({ type: "RETURN" })));
  });
});
