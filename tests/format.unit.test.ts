import { describe, expect, it } from "vitest";
import { formatCurrency } from "../src/utils/format";

describe("formatCurrency", () => {
  it("formats numbers in INR", () => {
    expect(formatCurrency(1234.56)).toBe("₹1,234.56");
  });
});
