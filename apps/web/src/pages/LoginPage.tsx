import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "../auth-client";
import { Card, Icon } from "../components/ui";

export function LoginPage() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/home" replace />;
  }

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: `${window.location.origin}/home`,
    });

    if (signInError) {
      setError("ログイン ID またはパスワードが正しくありません。");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="mx-auto grid min-h-svh w-full max-w-[393px] place-items-center bg-white p-6">
      <Card className="w-full border-0 p-6">
        <span className="mb-8 grid size-12 place-items-center bg-black text-white">
          <Icon name="wallet" />
        </span>
        <p className="mb-1 text-sm font-bold">精算を、もっとシンプルに</p>
        <h1 className="mb-4 text-3xl font-extrabold">seisan</h1>
        <p className="mb-8 text-sm leading-7 text-neutral-600">
          家族やパートナーとの支払いを記録し、負担額の調整から請求までをひとつにまとめます。
        </p>
        <form onSubmit={signIn} className="space-y-4">
          <label className="block text-sm font-bold">
            ログイン ID（メールアドレス）
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              disabled={isPending || isSubmitting}
              className="mt-2 h-12 w-full border border-neutral-300 px-3 font-normal"
            />
          </label>
          <label className="block text-sm font-bold">
            パスワード
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={isPending || isSubmitting}
              className="mt-2 h-12 w-full border border-neutral-300 px-3 font-normal"
            />
          </label>
          {error && (
            <p className="text-center text-xs text-red-700" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || isSubmitting}
            className="flex h-12 w-full items-center justify-center border border-black text-sm font-bold disabled:opacity-60"
          >
            {isSubmitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>
        <small className="mt-5 block text-center text-[11px] text-neutral-600">
          ⓘ Safari に保存すると、次回から ID・パスワードを自動入力できます
        </small>
        <em className="mt-6 block text-center text-[11px] leading-5 text-neutral-500">
          続行すると、利用規約およびプライバシーポリシーに同意したものとみなされます。
        </em>
      </Card>
    </main>
  );
}
