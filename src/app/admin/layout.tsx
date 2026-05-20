import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block">
        <nav className="sticky top-[73px] flex flex-col gap-1 p-4">
          <p className="mb-2 px-3 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Admin
          </p>
          {[
            { href: "/admin", label: "Overview" },
            { href: "/admin/courses", label: "Courses" },
            { href: "/admin/modules", label: "Modules" },
            { href: "/admin/lessons", label: "Lessons" },
            { href: "/admin/quizzes", label: "Quizzes" },
            { href: "/admin/flashcards", label: "Flashcards" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
