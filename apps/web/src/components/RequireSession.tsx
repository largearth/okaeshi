import { useCallback, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { authClient } from "../auth-client";
import { GroupProvider } from "../group-context";

export function RequireSession() {
  const { data: session, isPending } = authClient.useSession();
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const handleUnauthenticated = useCallback(
    () => setIsUnauthenticated(true),
    [],
  );

  if (isPending) {
    return <main className="min-h-svh bg-white" aria-busy="true" />;
  }

  if (!session || isUnauthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <GroupProvider onUnauthenticated={handleUnauthenticated}>
      <Outlet />
    </GroupProvider>
  );
}
