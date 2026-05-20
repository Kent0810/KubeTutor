import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "KubeTutor | Sign Up",
  description: "Create a KubeTutor account to track your learning progress.",
};

export default function SignupPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-md items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-scale-in w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign up to save progress, quiz results, and review history.
          </p>
          <SignupForm />
          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
