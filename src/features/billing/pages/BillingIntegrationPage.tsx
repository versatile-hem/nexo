import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ErrorState, EmptyState } from "@/components/shared/States";
import { billingApi } from "@/services/billingApi";
import { formatCurrency } from "@/utils/format";

export function BillingIntegrationPage() {
  const invoicesQuery = useQuery({ queryKey: ["billing-connectivity-invoices"], queryFn: billingApi.listInvoices });
  const clientsQuery = useQuery({ queryKey: ["billing-connectivity-clients"], queryFn: () => billingApi.listClients() });

  if (invoicesQuery.error || clientsQuery.error) {
    return <ErrorState message="Billing API connectivity check failed." onRetry={() => { invoicesQuery.refetch(); clientsQuery.refetch(); }} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Billing Connectivity</h2>
        <p className="mt-1 text-sm opacity-70">Lightweight backend validation panel for invoices and clients.</p>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">Invoices (/api/invoice)</h3>
        {(invoicesQuery.data ?? []).length === 0 ? (
          <EmptyState title="No invoices" subtitle="Invoice API is reachable but returned no records." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase opacity-70">
                <th className="p-2">ID</th>
                <th className="p-2">Client</th>
                <th className="p-2">Date</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(invoicesQuery.data ?? []).slice(0, 10).map((invoice) => (
                <tr key={invoice.id} className="border-b border-black/5">
                  <td className="p-2">{invoice.id}</td>
                  <td className="p-2">{invoice.customerName}</td>
                  <td className="p-2">{invoice.billDate}</td>
                  <td className="p-2">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="p-2">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">Clients (/api/client)</h3>
        {(clientsQuery.data ?? []).length === 0 ? (
          <EmptyState title="No clients" subtitle="Client API is reachable but returned no records." />
        ) : (
          <ul className="space-y-2">
            {(clientsQuery.data ?? []).slice(0, 10).map((client: { customerName: string; customerPhone: string }, index: number) => (
              <li key={`${client.customerName}-${index}`} className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/20">
                <p className="font-semibold">{client.customerName}</p>
                <p className="text-xs opacity-70">{client.customerPhone}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
