"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, FacebookIcon } from "lucide-react";

export default function SignInPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalid_credentials"));
      } else {
        const session = await getSession();
        if (session?.user?.role === "ADMIN") {
          router.push(`/admin`);
        } else {
          router.push(`/${locale}`);
        }
      }
    } catch (error) {
      setError(t("generic_error"));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await signIn("google", { callbackUrl: `/${locale}` }).then(() => {
        router.push(`/${locale}`);
    })
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            {t("welcome_back")}
          </CardTitle>
          <p className="text-gray-600">{t("sign_in_to_continue")}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            <Button
              onClick={signInWithGoogle}
              className="w-full"
              variant="outline">
              Continue with Google
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700">
                {t("email_address")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={t("enter_email")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700">
                {t("password")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={t("enter_password")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showPassword ? t("hide_password") : t("show_password")
                  }>
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("signing_in") : t("sign_in")}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {t("no_account")}{" "}
              <Link
                href={`/${locale}/auth/signup`}
                className="text-blue-600 hover:underline">
                {t("sign_up")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
