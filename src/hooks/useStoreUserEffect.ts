"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

/**
 * Lazily syncs the authenticated Clerk user to the Convex users table.
 * Call this in any authenticated layout — it runs once per session.
 */
export function useStoreUserEffect() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.store);
  const hasStored = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasStored.current) {
      return;
    }

    hasStored.current = true;
    storeUser().catch((error) => {
      // Reset so it retries on next render
      hasStored.current = false;
      console.error("Failed to store user:", error);
    });
  }, [isAuthenticated, storeUser]);
}
