"use client";

import { useEffect } from "react";
import { setTimezone } from "@/app/(app)/actions";

/**
 * Captures the browser's IANA timezone once on mount and persists it if it
 * differs from what's stored. Renders nothing.
 */
export function TimezoneSync({ current }: { current: string }) {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== current) {
      void setTimezone(tz);
    }
  }, [current]);

  return null;
}
