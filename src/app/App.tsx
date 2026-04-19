import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProviders } from "@/app/providers";
import { appRouter } from "@/app/router";
import { startRealtimeSimulation } from "@/mocks/realtime";

startRealtimeSimulation();

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
      <Toaster richColors position="top-right" />
    </AppProviders>
  );
}
