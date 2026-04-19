import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/States";
import { customerService } from "@/services/customerService";

export function CustomerListPage() {
  const customersQuery = useQuery({ queryKey: ["customers"], queryFn: customerService.getCustomers });
  const customers = customersQuery.data ?? [];

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Customers</h2>
      {customers.length === 0 ? (
        <EmptyState title="No customers" subtitle="Customer records will appear here." />
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <Link key={customer.id} to={`/customers/${customer.id}`} className="block rounded-lg border border-black/10 p-3 hover:bg-black/5 dark:hover:bg-white/10">
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm opacity-70">{customer.email} • {customer.phone}</p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
