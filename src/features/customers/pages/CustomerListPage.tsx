import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/States";
import { customerService } from "@/services/customerService";

const PAGE_SIZE = 10;

export function CustomerListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customersQuery = useQuery({ queryKey: ["customers"], queryFn: customerService.getCustomers });
  const customers = customersQuery.data ?? [];
  const page = Number(searchParams.get("page") ?? "1");

  const maxPage = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), maxPage);
  const pagedCustomers = customers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
  };

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Customers</h2>
      {customers.length === 0 ? (
        <EmptyState title="No customers" subtitle="Customer records will appear here." />
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {pagedCustomers.map((customer) => (
              <Link key={customer.id} to={`/customers/${customer.id}`} className="block rounded-lg border border-black/10 p-3 hover:bg-black/5 dark:hover:bg-white/10">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm opacity-70">{customer.email} • {customer.phone}</p>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs">
            <p>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, customers.length)} of {customers.length}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</Button>
              <Button variant="secondary" disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
