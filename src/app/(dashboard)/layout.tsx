"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setPaletteOpen((v) => !v);
      return;
    }

    if (e.key === "?" && !paletteOpen) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      setShortcutsOpen((v) => !v);
    }
  }, [paletteOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-surface border-b border-border flex items-center justify-between px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-muted hover:text-text p-1 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-lg font-bold text-text">
            <span className="text-primary">Odo</span>sian
          </Link>
          <div className="w-8" />
        </div>

        <Sidebar mobile open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 pt-20 md:pt-6">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </AuthGuard>
  );
}
