import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "KubeTutor | Log In",
  description: "Log in to KubeTutor to access your learning dashboard.",
};

export default function LoginPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-md items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Log In</h1>
          <p className="mt-2 text-sm text-slate-500">
            Access your learning dashboard and saved progress.
          </p>
          <LoginForm />
          <p className="mt-6 text-sm text-slate-500">
            Need an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
