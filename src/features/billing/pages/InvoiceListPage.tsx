import { useQuery } from "@tanstack/react-query";
import { Printer, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { EmptyState } from "@/components/shared/States";
import { billingApi } from "@/services/billingApi";
import { Invoice } from "@/mocks/types";
import { formatCurrency } from "@/utils/format";
import { printInvoice } from "@/utils/printInvoice";

export function InvoiceListPage() {
  // Default date range: current month
  const today = new Date();
  const defaultToDate = today.toISOString().slice(0, 10);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultFromDate = monthStart.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const invoicesQuery = useQuery({
    queryKey: ["invoices", fromDate, toDate, page, pageSize],
    queryFn: () => billingApi.listInvoices(fromDate, toDate, page, pageSize),
  });

  const invoices = invoicesQuery.data?.invoices ?? [];
  const totalPages = invoicesQuery.data?.totalPages ?? 1;
  const totalElements = invoicesQuery.data?.totalElements ?? 0;
  const [printingId, setPrintingId] = useState<string | null>(null);

  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "20", label: "20 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  const resetFilters = () => {
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
    setPage(0);
  };

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
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invoice List</h2>
          <div className="flex gap-2">
            <Link to="/billing/integration"><Button variant="secondary">Connectivity Panel</Button></Link>
            <Link to="/billing/create-invoice"><Button>Create Invoice</Button></Link>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 border-b border-black/10 pb-4 dark:border-white/10">
          <div className="grid gap-2 sm:grid-cols-4">
            <div>
              <p className="mb-1 text-xs uppercase opacity-70">From Date</p>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">To Date</p>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">Per Page</p>
              <Dropdown
                value={String(pageSize)}
                options={pageSizeOptions}
                onChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              />
            </div>

            <div className="flex items-end">
              <Button variant="secondary" onClick={resetFilters} className="w-full">
                <Filter size={14} /> Reset
              </Button>
            </div>
          </div>
        </div>

        {invoices.length === 0 ? (
          <EmptyState title="No invoices" subtitle="Create an invoice with GST-ready line items." />
        ) : (
          <>
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

            {totalElements > 0 && (
              <div className="mt-4 space-y-3 border-t border-black/10 pt-4 dark:border-white/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs opacity-70">
                    Showing {Math.max(1, page * pageSize + 1)} to {Math.min((page + 1) * pageSize, totalElements)} of{" "}
                    <span className="font-semibold">{totalElements}</span> invoices
                    {pageSize && ` • ${pageSize} per page`}
                  </p>
                  {totalPages > 1 && (
                    <p className="text-xs opacity-70">
                      Page <span className="font-semibold">{page + 1}</span> of{" "}
                      <span className="font-semibold">{totalPages}</span>
                    </p>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft size={16} strokeWidth={2.5} />
                      <span>Previous</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-2"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
