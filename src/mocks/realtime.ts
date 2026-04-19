import { db } from "@/mocks/data";

let initialized = false;

export function startRealtimeSimulation() {
  if (initialized) {
    return;
  }
  initialized = true;

  window.setInterval(() => {
    const product = db.products[Math.floor(Math.random() * db.products.length)];
    if (!product) return;
    const delta = Math.random() > 0.5 ? 1 : -1;
    product.stock = Math.max(0, product.stock + delta);
  }, 8000);

  window.setInterval(() => {
    const order = db.orders[Math.floor(Math.random() * db.orders.length)];
    if (!order) return;
    const statuses: Array<typeof order.status> = ["pending", "shipped", "delivered"];
    order.status = statuses[Math.floor(Math.random() * statuses.length)];
  }, 10000);
}
