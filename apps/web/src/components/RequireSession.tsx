import { Navigate, Outlet } from "react-router-dom";

import { authClient } from "../auth-client";

export function RequireSession() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <main className="min-h-svh bg-white" aria-busy="true" />;
  }

  return session ? <Outlet /> : <Navigate to="/" replace />;
}
