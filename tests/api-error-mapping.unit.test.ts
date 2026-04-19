import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { mapHttpError } from "@/services/httpErrors";

function axiosErr(status: number, message?: string) {
  return new AxiosError(
    "request failed",
    undefined,
    undefined,
    undefined,
    {
      status,
      statusText: "error",
      headers: {},
      config: { headers: {} } as any,
      data: message ? { message } : {},
    } as any,
  );
}

describe("mapHttpError", () => {
  it("maps 403 to forbidden", () => {
    const mapped = mapHttpError(axiosErr(403));
    expect(mapped.code).toBe("FORBIDDEN");
  });

  it("maps 400 with backend message", () => {
    const mapped = mapHttpError(axiosErr(400, "Validation failed at backend"));
    expect(mapped.code).toBe("VALIDATION");
    expect(mapped.message).toContain("Validation failed at backend");
  });
});
