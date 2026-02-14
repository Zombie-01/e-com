"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Нэвтрэхэд алдаа гарлаа");
      return;
    }

    const session = await getSession();

    if (session?.user?.role !== "ADMIN") {
      setError("Та админ эрхгүй байна!");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form className="space-y-4 p-6 bg-white rounded-lg shadow" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold">Admin Login</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Нэвтрэх
        </button>
      </form>
    </div>
  );
}
