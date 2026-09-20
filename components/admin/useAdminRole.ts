"use client";

import { useEffect, useState } from "react";

export function useAdminRole() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setIsSuperAdmin(data.user?.role === "super_admin"))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  return isSuperAdmin;
}
