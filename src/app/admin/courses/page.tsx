import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminCourseForm from "@/components/AdminCourseForm";

export const metadata: Metadata = {
  title: "KubeTutor | Admin — Courses",
};

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({ orderBy: { order: "asc" } });

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Courses</h1>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Create New Course</h2>
          <AdminCourseForm />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Existing Courses</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses yet.</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{course.title}</p>
                    <p className="text-xs text-slate-500">/{course.slug}</p>
                  </div>
                  <span className="text-sm text-slate-400">Order: {course.order}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
