import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminModuleForm from "@/components/AdminModuleForm";

export const metadata: Metadata = {
  title: "KubeTutor | Admin — Modules",
};

export const dynamic = "force-dynamic";

export default async function AdminModulesPage() {
  const modules = await prisma.module.findMany({
    include: { course: true, _count: { select: { lessons: true } } },
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
  });

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Modules</h1>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Create New Module</h2>
          <AdminModuleForm />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Existing Modules ({modules.length})
          </h2>
          {modules.length === 0 ? (
            <p className="text-sm text-slate-500">No modules yet.</p>
          ) : (
            <div className="space-y-3">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-xs font-semibold text-blue-600">{m.course.title}</p>
                    <p className="font-semibold text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">
                      /{m.slug} · {m._count.lessons} lessons
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">Order: {m.order}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
