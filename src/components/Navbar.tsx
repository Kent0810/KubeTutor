"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "ADMIN";
};

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/flashcards", label: "Flashcards" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setSettingsOpen } = useSettings();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition hover:text-blue-600"
          onClick={() => setIsOpen(false)}
        >
          🐳 KubeTutor
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(pathname, "/admin")
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* Settings button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open preferences"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name ?? user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-rose-200 hover:text-rose-600"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-blue-200 hover:text-blue-600"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="text-xl">{isOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {isOpen ? (
        <div className="animate-slide-in-down border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Admin
              </Link>
            )}

            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={() => { setIsOpen(false); setSettingsOpen(true); }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preferences
              </button>
              {user ? (
                <div className="space-y-2">
                  <p className="px-4 py-1 text-sm text-slate-500">
                    Signed in as <strong>{user.name ?? user.email}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-rose-200 px-4 py-3 text-center text-sm font-semibold text-rose-600"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
