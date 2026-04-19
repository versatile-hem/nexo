import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { paymentService, PaymentMode } from "@/services/paymentService";
import { salesService } from "@/services/salesService";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";

const paymentModes: Array<{ value: PaymentMode; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();

  const ordersQuery = useQuery({
    queryKey: ["sales-orders", user?.name],
    queryFn: () => salesService.listMyOrders(user?.name ?? ""),
  });

  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<PaymentMode>("UPI");
  const [note, setNote] = useState("");

  const selectedOrder = useMemo(
    () => (ordersQuery.data ?? []).find((order) => order.id === orderId || order.orderNumber === orderId),
    [ordersQuery.data, orderId],
  );

  const paymentsQuery = useQuery({
    queryKey: ["payments", orderId],
    queryFn: () => paymentService.getPayments(orderId || undefined),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      paymentService.addPayment({
        orderId,
        amount,
        mode,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Payment recorded");
      setAmount(0);
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to add payment");
    },
  });

  const onAddPayment = () => {
    if (!orderId) {
      toast.error("Select an order");
      return;
    }

    if (!selectedOrder) {
      toast.error("Selected order not found");
      return;
    }

    const pending = Math.max(0, selectedOrder.amount - selectedOrder.paidAmount);
    if (amount <= 0 || amount > pending) {
      toast.error(`Amount must be between 1 and ${pending.toFixed(2)}`);
      return;
    }

    addMutation.mutate();
  };

  const progress = selectedOrder && selectedOrder.amount > 0
    ? Math.min(100, Math.round((selectedOrder.paidAmount / selectedOrder.amount) * 100))
    : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Payments</h2>
        <p className="mt-1 text-sm opacity-70">Add payments and monitor collection progress.</p>
      </Card>

      <Card className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="mb-1 text-xs uppercase opacity-70">Order</p>
          <Dropdown
            value={orderId}
            searchable
            options={(ordersQuery.data ?? []).map((order) => ({ value: order.id, label: `${order.orderNumber} • ${order.customerName}` }))}
            placeholder="Select order"
            onChange={setOrderId}
          />
        </div>

        {selectedOrder ? (
          <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm dark:border-white/20 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="font-semibold">{formatCurrency(selectedOrder.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Paid</span>
              <span className="font-semibold">{formatCurrency(selectedOrder.paidAmount)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
              <div className="h-full rounded-full bg-nexo-accent" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs opacity-70">Payment Progress: {progress}%</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Amount</p>
            <Input type="number" min={0} value={amount} onChange={(event) => setAmount(Number(event.target.value) || 0)} />
          </div>
          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Mode</p>
            <Dropdown value={mode} options={paymentModes} onChange={(value) => setMode(value as PaymentMode)} />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs uppercase opacity-70">Note (optional)</p>
          <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reference or remarks" />
        </div>

        <Button className="h-12 w-full" onClick={onAddPayment} disabled={addMutation.isPending}>
          {addMutation.isPending ? "Saving..." : "Add Payment"}
        </Button>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold">Payment History</h3>
        {(paymentsQuery.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm opacity-70">No payments recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {(paymentsQuery.data ?? []).map((payment) => (
              <li key={payment.id} className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  <span className="rounded-full bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{payment.mode}</span>
                </div>
                <p className="mt-1 text-xs opacity-70">{new Date(payment.paidAt).toLocaleString("en-IN")}</p>
                {payment.note ? <p className="mt-1 text-xs opacity-75">{payment.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
