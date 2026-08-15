import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Heading, Screen } from "../components/layout";
import { Icon } from "../components/ui";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-4 block text-sm font-bold">
      <b className="mb-2 block">{label}</b>
      {children}
    </label>
  );
}
export function PaymentPage() {
  return (
    <Screen>
      <header className="mb-4 flex items-center justify-between">
        <Link
          to="/home"
          className="grid size-10 place-items-center border border-black"
        >
          <Icon name="back" />
        </Link>
        <b>1 / 2</b>
      </header>
      <Heading eyebrow="支払いを追加" title="支払いを記録する" />
      <Field label="何に支払いましたか？">
        <input
          className="h-12 w-full border border-black px-4 outline-none"
          defaultValue="駐車場代"
        />
      </Field>
      <Field label="支払った金額">
        <div className="flex h-12 w-full items-center gap-2 border border-black px-4">
          <span>¥</span>
          <input className="w-full outline-none" defaultValue="400" />
        </div>
      </Field>
      <Field label="支払元の財布">
        <div className="flex h-12 items-center justify-between border border-black px-4">
          共有財布 <Icon name="chevron" size={18} />
        </div>
      </Field>
      <Field label="支払った日">
        <div className="flex h-12 items-center justify-between border border-black px-4">
          2026/08/09 <Icon name="calendar" size={17} />
        </div>
      </Field>
      <Field label="メモ　（任意）">
        <textarea
          className="h-24 w-full border border-black p-4 outline-none"
          placeholder="例：駅前パーキング"
        />
      </Field>
      <Link
        className="mt-9 grid h-12 place-items-center bg-black text-sm font-bold text-white"
        to="/payments/new/allocation"
      >
        負担金額を設定する
      </Link>
    </Screen>
  );
}
