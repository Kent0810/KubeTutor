import type { Metadata } from "next";
import HomeTabs from "@/components/HomeTabs";

export const metadata: Metadata = {
  title: "Roadmap — KubeTutor",
  description:
    "Interactive skill tree, common Docker & Kubernetes problems, and pro tips to level up your container engineering.",
};

export default function RoadmapPage() {
  return (
    <main className="flex-1 bg-gray-50">
      {/* Header */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
            Interactive · Self-paced
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-bold tracking-tight lg:text-5xl">
            Your Learning Roadmap
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Explore the skill tree, diagnose common problems fast, and pick up pro tips that
            separate good engineers from great ones.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <HomeTabs />
      </section>
    </main>
  );
}
