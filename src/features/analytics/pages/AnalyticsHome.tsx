/**
 * Analytics Home - Router entry point
 * Serves as parent for upload and history sub-pages
 */

import { Outlet } from 'react-router-dom';

export function AnalyticsHome() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Outlet />
    </div>
  );
}
