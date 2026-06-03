import type { Metadata } from "next";
import CoursesBrowser, { type CourseCardData } from "@/components/CoursesBrowser";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "KubeTutor | Courses",
  description: "Browse Docker and Kubernetes learning tracks.",
};

export const dynamic = "force-dynamic";

const HIGHLIGHTS: Record<string, string[]> = {
  "docker-foundations": [
    "Container fundamentals",
    "Production Dockerfiles",
    "Compose multi-service stacks",
    "Image security & scanning",
    "CI/CD with images",
  ],
  "kubernetes-essentials": [
    "Pods & Deployments",
    "Services & Ingress",
    "ConfigMaps & Secrets",
    "Autoscaling (HPA/VPA)",
    "Observability & Helm",
  ],
  "linux-essentials": [
    "Filesystem & navigation",
    "File permissions & ownership",
    "Process management",
    "Shell scripting basics",
    "System monitoring",
  ],
  "git-and-devops": [
    "Commits & branching",
    "Merge & rebase strategies",
    "CI/CD pipeline design",
    "GitHub Actions",
    "GitOps & ArgoCD",
  ],
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        select: {
          slug: true,
          title: true,
          order: true,
          _count: { select: { lessons: true } },
        },
        orderBy: { order: "asc" },
      },
      _count: { select: { modules: true } },
    },
    orderBy: { order: "asc" },
  });

  const cards: CourseCardData[] = courses.map((course) => {
    const lessonCount = course.modules.reduce((s, m) => s + m._count.lessons, 0);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      moduleCount: course._count.modules,
      lessonCount,
      firstModuleSlug: course.modules[0]?.slug,
      modulePreview: course.modules.slice(0, 4).map((m) => ({
        slug: m.slug,
        title: m.title,
        lessonCount: m._count.lessons,
      })),
      highlights: HIGHLIGHTS[course.slug] ?? [],
    };
  });

  const totalLessons = cards.reduce((s, c) => s + c.lessonCount, 0);
  const totalModules = cards.reduce((s, c) => s + c.moduleCount, 0);

  return (
    <main className="flex-1 bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(34,211,238,0.4), transparent 40%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.4), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="animate-slide-in-left text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">
            Learning Library
          </p>
          <h1 className="animate-fade-in-up delay-100 mt-4 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl">
            Choose your next platform skill track
          </h1>
          <p className="animate-fade-in-up delay-200 mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Build production-grade Docker and Kubernetes knowledge through guided modules, hands-on
            examples, and battle-tested patterns from real platform teams.
          </p>
          <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-semibold transition hover:bg-white/20">
              {cards.length} tracks
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-semibold transition hover:bg-white/20">
              {totalModules} modules
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-semibold transition hover:bg-white/20">
              {totalLessons} in-depth lessons
            </span>
            <span className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-4 py-1.5 font-semibold text-emerald-100 transition hover:bg-emerald-400/25">
              Free during beta
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CoursesBrowser courses={cards} />
      </section>
    </main>
  );
}
