"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";

/**
 * Client-only wrapper for the admin screens.
 *
 * - Renders nothing on the server: the admin views read the JWT from
 *   localStorage while rendering, which does not exist there, and admin markup
 *   has no business in server HTML anyway.
 * - With `requireAuth`, a visitor without a token is sent to the login screen
 *   (the old <ProtectedRoute> behaviour). The backend still verifies the token
 *   on every request, so this is navigation, not security.
 */
export default function AdminGate({ children, requireAuth = false }: { children: ReactNode; requireAuth?: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (requireAuth && !getToken()) {
      router.replace("/admin");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot mount gate
    setReady(true);
  }, [requireAuth, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
  return <>{children}</>;
}
