"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";

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
