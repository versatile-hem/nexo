export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert a datetime-local input string to ISO 8601 format.
 * Correctly handles the local datetime without timezone conversion issues.
 * 
 * @param datetimeLocal - String from datetime-local input (e.g., "2026-05-04T14:30")
 * @returns ISO 8601 formatted string with timezone offset applied correctly
 */
export function convertDatetimeLocalToISO(datetimeLocal: string): string {
  // Parse the datetime-local string components
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Create a Date object using local time components
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Get timezone offset in milliseconds and convert to minutes
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  
  // Create the UTC date by subtracting the offset
  const utcDate = new Date(date.getTime() - offsetMs);
  
  // Return ISO 8601 format
  return utcDate.toISOString();
}

export function exportToCsv<T extends object>(filename: string, rows: T[]) {
  const header = Object.keys(rows[0] ?? {}).join(",");
  const body = rows
    .map((row) => Object.values(row).map((value) => JSON.stringify(value ?? "")).join(","))
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
