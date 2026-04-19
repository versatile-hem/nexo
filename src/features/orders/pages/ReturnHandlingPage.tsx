import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ReturnHandlingPage() {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Return Handling</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <Input placeholder="Return reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <p className="mt-3 text-sm opacity-70">Placeholder UI for return workflow approval, restocking, and refund hooks.</p>
      <Button className="mt-4">Create Return Case</Button>
    </Card>
  );
}
