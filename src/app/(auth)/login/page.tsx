"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (res.ok) router.replace("/dashboard");
    }).catch(() => {});
  }, [router]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error?.includes("verify")) {
          addToast("warning", "Please verify your email before logging in.");
        } else if (res.status === 423) {
          addToast("error", data.error || "Account is locked. Try again later.");
        } else {
          setErrors({ form: data.error || "Invalid credentials" });
        }
        return;
      }

      setAuth(data.user, data.token);
      addToast("success", "Welcome back!");
      router.push("/dashboard");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-text">Sign In</h2>
        <p className="text-sm text-text-secondary">
          Enter your credentials to access the platform
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3">
              {errors.form}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="analyst@example.com"
            required
          />
          <div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <div className="text-right mt-1">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
        <p className="text-sm text-text-secondary text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
