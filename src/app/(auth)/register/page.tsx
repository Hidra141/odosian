"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { useToastStore } from "@/stores/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of data.details) {
            const field = issue.path?.[0];
            if (field) fieldErrors[field] = issue.message;
          }
          setErrors(fieldErrors);
        } else {
          setErrors({ form: data.error || "Registration failed" });
        }
        return;
      }

      addToast(
        "success",
        data.emailSent
          ? "Account created! Check your email to verify."
          : "Account created! Check the server console for the verification link."
      );
      router.push("/verify");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-text">Create Account</h2>
        <p className="text-sm text-text-secondary">
          Register to start analyzing detection rules
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
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            error={errors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="analyst@example.com"
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 chars, uppercase, number, special"
            error={errors.password}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            placeholder="••••••••"
            error={errors.confirmPassword}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>
        <p className="text-sm text-text-secondary text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
