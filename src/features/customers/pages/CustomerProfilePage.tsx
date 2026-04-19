import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { customerService } from "@/services/customerService";
import { formatCurrency } from "@/utils/format";

export function CustomerProfilePage() {
  const { customerId = "" } = useParams();
  const customerQuery = useQuery({ queryKey: ["customer", customerId], queryFn: () => customerService.getCustomerById(customerId) });
  const transactionsQuery = useQuery({ queryKey: ["customer-transactions", customerId], queryFn: () => customerService.getTransactions(customerId) });

  const customer = customerQuery.data;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Customer Profile</h2>
        {customer ? (
          <div className="mt-3 text-sm">
            <p>{customer.name}</p>
            <p className="opacity-70">{customer.email}</p>
            <p className="opacity-70">{customer.phone}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm opacity-70">Customer not found.</p>
        )}
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold">Transaction History</h3>
        <ul className="space-y-2 text-sm">
          {(transactionsQuery.data ?? []).map((order) => (
            <li key={order.id} className="flex items-center justify-between rounded-lg border border-black/10 p-3">
              <span>{order.id} • {order.status}</span>
              <span>{formatCurrency(order.amount)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
