import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UnauthorizedPage() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "this page";

  return (
    <Card>
      <h2 className="text-lg font-semibold">Access denied</h2>
      <p className="mt-2 text-sm opacity-70">Your role does not have access to {from}.</p>
      <Button className="mt-4" variant="secondary" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </Card>
  );
}
