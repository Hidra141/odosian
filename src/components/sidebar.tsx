"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Detection Rules",
    href: "/dashboard/rules",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "AI Analysis",
    href: "/dashboard/analysis",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
        <path d="M4 13h4M16 13h4M8 17h8" />
      </svg>
    ),
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    label: "MITRE ATT&CK",
    href: "/dashboard/mitre",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M12 18v-6M9 15l3 3 3-3" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/dashboard/users",
    adminOnly: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

interface SidebarProps {
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearAuth();
      addToast("info", "Signed out successfully");
      router.push("/login");
    } catch {
      addToast("error", "Failed to sign out");
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    if (mobile && onClose) onClose();
  };

  if (mobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between px-4 py-5 border-b border-border">
            <Link href="/dashboard" className="text-xl font-bold text-text" onClick={handleNavClick}>
              <span className="text-primary">Odo</span>sian
            </Link>
            <button onClick={onClose} className="text-text-muted hover:text-text p-1 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text hover:bg-surface-light"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            {user && (
              <Link href="/dashboard/profile" className="block mb-3 group" onClick={handleNavClick}>
                <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-danger transition-colors"
              title="Sign out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside
      className={`flex flex-col bg-surface border-r border-border h-screen sticky top-0 transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-text">
            <span className="text-primary">Odo</span>sian
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text p-1 transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:text-text hover:bg-surface-light"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        {!collapsed && user && (
          <Link href="/dashboard/profile" className="block mb-3 group">
            <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-sm text-text-secondary hover:text-danger transition-colors ${
            collapsed ? "justify-center w-full" : ""
          }`}
          title="Sign out"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
