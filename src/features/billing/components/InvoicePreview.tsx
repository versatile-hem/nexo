import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import {
  companyProfile,
  InvoiceCustomer,
  InvoiceLineCalculated,
  InvoiceTotals,
} from "@/services/invoiceService";

interface InvoicePreviewProps {
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  customer: InvoiceCustomer | null;
  lines: InvoiceLineCalculated[];
  totals: InvoiceTotals;
}

export function InvoicePreview({
  invoiceNumber,
  invoiceDate,
  placeOfSupply,
  customer,
  lines,
  totals,
}: InvoicePreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="secondary" className="gap-2" onClick={() => window.print()}>
          <Printer size={14} /> Print A4
        </Button>
        <Button variant="ghost" className="gap-2" onClick={() => alert("PDF export will be added with backend integration")}>
          <Download size={14} /> Download PDF
        </Button>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-5 text-sm shadow-card dark:border-white/20 dark:bg-[#213124] print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-black/10 pb-4 dark:border-white/10">
          <h2 className="text-lg font-bold">{companyProfile.name}</h2>
          <p className="mt-1 opacity-80">{companyProfile.address}</p>
          <p className="opacity-80">Phone: {companyProfile.phone} | Email: {companyProfile.email}</p>
          <p className="opacity-80">Website: {companyProfile.website}</p>
          <p className="opacity-80">GSTIN: {companyProfile.gstin} | PAN: {companyProfile.pan}</p>
        </header>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase opacity-70">Bill To</p>
            <p className="font-semibold">{customer?.name ?? "-"}</p>
            <p className="opacity-80">{customer?.billingAddress ?? "-"}</p>
            <p className="opacity-80">GSTIN: {customer?.gstin ?? "-"}</p>
            <p className="opacity-80">Phone: {customer?.phone ?? "-"}</p>
            <p className="opacity-80">State: {customer?.state ?? "-"}</p>
          </div>
          <div className="md:text-right">
            <p><span className="opacity-70">Invoice No:</span> {invoiceNumber}</p>
            <p><span className="opacity-70">Invoice Date:</span> {invoiceDate}</p>
            <p><span className="opacity-70">Place of Supply:</span> {placeOfSupply || "-"}</p>
          </div>
        </div>

        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-y border-black/10 text-xs uppercase dark:border-white/10">
              <th className="py-2">Product</th>
              <th className="py-2">HSN</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Discount</th>
              <th className="py-2 text-right">Tax</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={`preview-${idx}`} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2">{line.productName}</td>
                <td className="py-2">{line.hsn}</td>
                <td className="py-2 text-right">{line.qty}</td>
                <td className="py-2 text-right">{formatCurrency(line.unitPrice)}</td>
                <td className="py-2 text-right">{formatCurrency(line.discount)}</td>
                <td className="py-2 text-right">{formatCurrency(line.taxAmount)}</td>
                <td className="py-2 text-right font-semibold">{formatCurrency(line.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-full max-w-sm space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span>Total Discount</span><span>{formatCurrency(totals.totalDiscount)}</span></div>
          <div className="flex justify-between"><span>Total Tax</span><span>{formatCurrency(totals.totalTax)}</span></div>
          {totals.taxType === "CGST_SGST" ? (
            <>
              <div className="flex justify-between"><span>CGST</span><span>{formatCurrency(totals.cgst)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>{formatCurrency(totals.sgst)}</span></div>
            </>
          ) : (
            <div className="flex justify-between"><span>IGST</span><span>{formatCurrency(totals.igst)}</span></div>
          )}
          <div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-base font-bold dark:border-white/10">
            <span>Grand Total</span><span>{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>

        <p className="mt-5 text-xs opacity-70">This is a computer-generated invoice. Subject to Haryana jurisdiction.</p>
      </div>
    </div>
  );
}
