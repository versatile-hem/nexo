export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProductFormSchema {
  name: string;
  sku: string;
  price: number;
  category: string;
}

export function validateProductForm(input: ProductFormSchema): ValidationResult {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Product name is required");
  if (!input.sku.trim()) errors.push("SKU is required");
  if (!input.category.trim()) errors.push("Category is required");
  if (!Number.isFinite(input.price) || input.price <= 0) errors.push("Price must be greater than 0");
  return { valid: errors.length === 0, errors };
}

export function validatePositiveQuantity(value: number, label = "Quantity"): ValidationResult {
  const errors: string[] = [];
  if (!Number.isFinite(value) || value <= 0) {
    errors.push(`${label} must be greater than 0`);
  }
  return { valid: errors.length === 0, errors };
}
