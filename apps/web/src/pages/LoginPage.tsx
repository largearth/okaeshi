import { Link } from "react-router-dom";
import { Card, Icon } from "../components/ui";

export function LoginPage() {
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
        <Link
          to="/home"
          className="mb-5 flex h-12 items-center justify-center gap-3 border border-black text-sm font-bold"
        >
          <b>G</b> Google で続行
        </Link>
        <small className="block text-center text-[11px] text-neutral-600">
          ⓘ Google アカウントの認証情報は保存しません
        </small>
        <em className="mt-6 block text-center text-[11px] leading-5 text-neutral-500">
          続行すると、利用規約およびプライバシーポリシーに同意したものとみなされます。
        </em>
      </Card>
    </main>
  );
}
