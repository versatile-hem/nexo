import { Invoice, InvoiceLineItem } from "@/mocks/types";
import { db } from "@/mocks/data";
import { companyProfile } from "@/services/invoiceService";
import { formatCurrency } from "@/utils/format";

function lineTotal(item: InvoiceLineItem) {
  const subtotal = item.qty * item.unitPrice;
  const tax = (subtotal * item.gstRate) / 100;
  return subtotal + tax;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function printInvoice(invoice: Invoice) {
  const printWindow = window.open("", "_blank", "width=960,height=760");
  if (!printWindow) {
    return false;
  }

  const customer = db.customers.find((item) => item.id === invoice.customerId);
  const customerState = (customer?.state ?? "").trim().toLowerCase();
  const companyState = companyProfile.state.trim().toLowerCase();
  const isIntraState = customerState !== "" && customerState === companyState;

  const cgst = isIntraState ? invoice.tax / 2 : 0;
  const sgst = isIntraState ? invoice.tax / 2 : 0;
  const igst = isIntraState ? 0 : invoice.tax;

  const rows = invoice.lineItems
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.description || "Item")}</td>
        <td>${escapeHtml(item.hsn ?? "-")}</td>
        <td>${item.qty}</td>
        <td>${formatCurrency(item.unitPrice)}</td>
        <td>${formatCurrency(item.discount ?? 0)}</td>
        <td>${item.gstRate}%</td>
        <td>${formatCurrency(item.taxAmount ?? ((item.qty * item.unitPrice - (item.discount ?? 0)) * item.gstRate) / 100)}</td>
        <td>${formatCurrency(item.totalAmount ?? lineTotal(item))}</td>
      </tr>`,
    )
    .join("");

  const html = `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice ${escapeHtml(invoice.id)}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; color: #1a1a1a; }
        h1 { margin: 0; font-size: 20px; }
        .paper { border: 1px solid #ddd; padding: 18px; }
        .meta { margin-top: 12px; color: #444; font-size: 13px; }
        .section { margin-top: 16px; }
        table { margin-top: 12px; width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f7f7f7; }
        .totals { margin-top: 20px; margin-left: auto; width: 360px; }
        .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
        .totals .total { font-weight: 700; border-top: 1px solid #d0d0d0; margin-top: 6px; padding-top: 10px; }
        .right { text-align: right; }
        .muted { color: #666; }
        @media print {
          .paper { border: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="paper">
      <h1>${escapeHtml(companyProfile.name)}</h1>
      <div class="meta">
        <div>${escapeHtml(companyProfile.address)}</div>
        <div>Phone: ${escapeHtml(companyProfile.phone)} | Email: ${escapeHtml(companyProfile.email)}</div>
        <div>Website: ${escapeHtml(companyProfile.website)}</div>
        <div>GSTIN: ${escapeHtml(companyProfile.gstin)} | PAN: ${escapeHtml(companyProfile.pan)}</div>
      </div>

      <div class="section" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <div class="muted" style="font-size:12px;text-transform:uppercase;">Bill To</div>
          <div><strong>${escapeHtml(invoice.customerName)}</strong></div>
          <div>${escapeHtml(customer?.billingAddress ?? "-")}</div>
          <div>GSTIN: ${escapeHtml(customer?.gstin ?? "-")}</div>
          <div>State: ${escapeHtml(customer?.state ?? "-")}</div>
        </div>
        <div class="right">
          <div><span class="muted">Invoice No:</span> ${escapeHtml(invoice.id)}</div>
          <div><span class="muted">Invoice Date:</span> ${escapeHtml(invoice.issuedAt)}</div>
          <div><span class="muted">Place of Supply:</span> ${escapeHtml(customer?.state ?? "-")}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Discount</th>
            <th>GST</th>
            <th>Tax Amount</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
        <div><span>Total Tax</span><span>${formatCurrency(invoice.tax)}</span></div>
        ${isIntraState
          ? `<div><span>CGST</span><span>${formatCurrency(cgst)}</span></div><div><span>SGST</span><span>${formatCurrency(sgst)}</span></div>`
          : `<div><span>IGST</span><span>${formatCurrency(igst)}</span></div>`}
        <div class="total"><span>Total</span><span>${formatCurrency(invoice.total)}</span></div>
      </div>
      <p style="margin-top:14px;font-size:11px;color:#666;">This is a computer-generated invoice. Subject to Haryana jurisdiction.</p>
      </div>
    </body>
  </html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

  return true;
}
