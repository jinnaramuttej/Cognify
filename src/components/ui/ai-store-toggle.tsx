"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/lib/theme-store";
import { RefreshCw } from "lucide-react";

export function AiStoreToggle() {
  const aiStoreTheme = useThemeStore(state => state.aiStoreTheme);
  const toggle = useThemeStore(state => state.toggleAiStoreTheme);

  return (
    <Button variant="ghost" size="icon" onClick={toggle} title={`Switch store theme (current: ${aiStoreTheme})`}>
      <RefreshCw className="w-4 h-4" />
      <span className="sr-only">Toggle AI Store Theme</span>
    </Button>
  );
}