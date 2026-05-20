"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Sign up failed.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="KubeTutor Learner"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="At least 8 characters"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Confirm Password</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Repeat your password"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? "Creating account…" : "Sign Up"}
      </button>
    </form>
  );
}
