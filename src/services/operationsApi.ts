import { api } from "@/services/api";
import {
  DailyOperationRequestDto,
  InventoryBalance,
  InventoryBalanceResponseDto,
  StockInRequestDto,
} from "@/services/apiModels";

export interface StockInLineItem {
  productId: string;
  quantity: number;
  unit: string;
  supplier?: string;
  batchNumber?: string;
  movementTime?: string;
}

export interface DailyOperationPayload {
  type: "ORDER" | "RETURN";
  productId: string;
  quantity: number;
  unit: string;
  courier?: string;
  channel?: "Meesho" | "Flipkart" | "Offline" | "Amazon";
  movementTime?: string;
}

export const operationsApi = {
  async stockIn(items: StockInLineItem[]) {
    const payload: StockInRequestDto[] = items.map((item) => ({
      productId: Number(item.productId),
      quantity: item.quantity,
      unit: item.unit,
      supplier: item.supplier,
      batchNumber: item.batchNumber,
      movementTime: item.movementTime || new Date().toISOString(),
    }));

    const response = await api.post<InventoryBalanceResponseDto[]>("/stock-in", payload);
    return response.data.map(toInventoryBalance);
  },

  async dailyOperation(payload: DailyOperationPayload) {
    const request: DailyOperationRequestDto = {
      type: payload.type,
      productId: Number(payload.productId),
      quantity: payload.quantity,
      unit: payload.unit,
      courier: payload.courier,
      channel: toBackendChannel(payload.channel),
      movementTime: payload.movementTime || new Date().toISOString(),
    };

    const response = await api.post<InventoryBalanceResponseDto>("/daily-operations", request);
    return toInventoryBalance(response.data);
  },

  async endOfDayOperations(operations: DailyOperationPayload[], notes?: string) {
    const payload = {
      operations: operations.map((op) => ({
        type: op.type,
        productId: Number(op.productId),
        quantity: op.quantity,
        unit: op.unit,
        courier: op.courier,
        channel: toBackendChannel(op.channel),
        movementTime: op.movementTime || new Date().toISOString(),
      })),
      notes: notes || "",
    };

    const response = await api.post<any>("/end-of-day-operations", payload);
    return response.data;
  },
};

function toInventoryBalance(dto: InventoryBalanceResponseDto): InventoryBalance {
  return {
    productId: String(dto.productId),
    quantity: Number(dto.quantity ?? 0),
  };
}

function toBackendChannel(channel?: "Meesho" | "Flipkart" | "Offline" | "Amazon") {
  if (!channel) return undefined;
  if (channel === "Meesho") return "MEESHO";
  if (channel === "Flipkart") return "FLIPKART";
  if (channel === "Offline") return "OFFLINE";
  return "AMAZON";
}
