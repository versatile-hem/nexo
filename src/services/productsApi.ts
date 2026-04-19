import { api } from "@/services/api";
import { AppProduct, ProductDto } from "@/services/apiModels";

export interface UpsertProductPayload {
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  category: string;
  unit?: string;
  availableStock?: number;
}

export const productsApi = {
  async list() {
    const response = await api.get<ProductDto[] | { content?: ProductDto[] }>("/products");
    const raw = Array.isArray(response.data) ? response.data : response.data.content ?? [];
    return raw.map(toProduct).filter((item) => item.id);
  },

  async getById(id: string) {
    const response = await api.get<ProductDto>(`/products/${id}`);
    return toProduct(response.data);
  },

  async getByBarcode(barcode: string) {
    const response = await api.get<ProductDto>(`/products/barcode/${encodeURIComponent(barcode)}`);
    return toProduct(response.data);
  },

  async create(payload: UpsertProductPayload) {
    const response = await api.post<ProductDto>("/products", toProductDto(payload));
    return toProduct(response.data);
  },

  async update(id: string, payload: UpsertProductPayload) {
    const response = await api.put<ProductDto>(`/products/${id}`, toProductDto(payload, Number(id)));
    return toProduct(response.data);
  },
};

export function toProduct(dto: ProductDto): AppProduct {
  const dtoWithFallback = dto as ProductDto & { id?: number | string; stock?: number; hsn?: string };
  return {
    id: String(dto.productId ?? dtoWithFallback.id ?? ""),
    name: dto.name || dto.product_title || "Unnamed Product",
    sku: dto.sku || "",
    hsn: dto.hsnCode || dtoWithFallback.hsn,
    barcode: dto.barcode,
    price: Number(dto.price ?? 0),
    category: dto.category || "General",
    stock: Number(dto.availableStock ?? dtoWithFallback.stock ?? 0),
  };
}

function toProductDto(payload: UpsertProductPayload, productId?: number): ProductDto {
  return {
    productId,
    name: payload.name,
    sku: payload.sku,
    barcode: payload.barcode,
    price: payload.price,
    category: payload.category,
    unit: payload.unit,
    availableStock: payload.availableStock,
  };
}
