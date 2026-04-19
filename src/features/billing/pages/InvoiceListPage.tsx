import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/States";
import { billingApi } from "@/services/billingApi";
import { Invoice } from "@/mocks/types";
import { formatCurrency } from "@/utils/format";
import { printInvoice } from "@/utils/printInvoice";

export function InvoiceListPage() {
  const today = new Date();
  const toDate = today.toISOString().slice(0, 10);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const fromDate = monthStart.toISOString().slice(0, 10);

  const invoicesQuery = useQuery({
    queryKey: ["invoices", fromDate, toDate],
    queryFn: () => billingApi.listInvoices(fromDate, toDate),
  });
  const invoices = invoicesQuery.data ?? [];
  const [printingId, setPrintingId] = useState<string | null>(null);

  const onPrint = (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) {
      return;
    }

    const printableInvoice: Invoice = {
      id: invoice.id,
      customerId: "",
      customerName: invoice.customerName,
      issuedAt: invoice.billDate,
      lineItems: [],
      subtotal: invoice.totalAmount,
      tax: 0,
      total: invoice.totalAmount,
    };

    setPrintingId(invoiceId);
    const started = printInvoice(printableInvoice);
    if (!started) {
      toast.error("Popup blocked. Please allow popups to print the invoice.");
    }
    window.setTimeout(() => setPrintingId(null), 250);
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Invoice List</h2>
        <div className="flex gap-2">
          <Link to="/billing/integration"><Button variant="secondary">Connectivity Panel</Button></Link>
          <Link to="/billing/create-invoice"><Button>Create Invoice</Button></Link>
        </div>
      </div>
      {invoices.length === 0 ? (
        <EmptyState title="No invoices" subtitle="Create an invoice with GST-ready line items." />
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase opacity-70">
              <th className="p-2">Invoice</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Date</th>
              <th className="p-2">Total</th>
              <th className="p-2">Print</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-black/5">
                <td className="p-2">{invoice.id}</td>
                <td className="p-2">{invoice.customerName}</td>
                <td className="p-2">{invoice.billDate}</td>
                <td className="p-2">{formatCurrency(invoice.totalAmount)}</td>
                <td className="p-2">
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => onPrint(invoice.id)}
                    disabled={printingId === invoice.id}
                    aria-label={`Print invoice ${invoice.id}`}
                  >
                    <Printer size={14} />
                    {printingId === invoice.id ? "Printing..." : "Print"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
