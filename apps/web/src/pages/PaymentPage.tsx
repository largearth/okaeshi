import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiRequestError, createGroupWithdrawal } from "../api";
import { Screen } from "../components/layout";
import { Card } from "../components/ui";
import { useWalletStore } from "../stores/use-wallet-store";
import { useGroupContext } from "../use-group-context";

export function PaymentPage() {
  const navigate = useNavigate();
  const { currentGroup, errorMessage, isLoading, refresh, unauthenticate } =
    useGroupContext();
  const wallets = useWalletStore((state) => state.wallets);
  const walletStatus = useWalletStore((state) => state.walletStatus);
  const walletErrorMessage = useWalletStore(
    (state) => state.walletErrorMessage,
  );
  const retryWalletLoad = useWalletStore((state) => state.retryWalletLoad);
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [withdrawnOn, setWithdrawnOn] = useState(today());
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const isFormReady =
    /^[1-9][0-9]*$/.test(amount) &&
    Boolean(walletId) &&
    Boolean(purpose.trim());

  useEffect(() => {
    if (!isLoading && walletStatus === "success" && wallets.length > 0) {
      amountInputRef.current?.focus();
    }
  }, [isLoading, walletStatus, wallets.length]);

  const handleAmountChange = (value: string) => {
    const digits = value.replaceAll(/\D/g, "").replace(/^0+/, "");
    setAmount(digits);
  };

  const saveWithdrawal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGroup) return;

    const trimmedPurpose = purpose.trim();
    const trimmedNote = note.trim();
    if (!trimmedPurpose) {
      setSubmitError("用途を入力してください。");
      return;
    }
    if (!/^[1-9][0-9]*$/.test(amount)) {
      setSubmitError("金額は正の円整数で入力してください。");
      return;
    }
    if (!walletId) {
      setSubmitError("出金元の財布を選択してください。");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createGroupWithdrawal(currentGroup.id, {
        purpose: trimmedPurpose,
        amount,
        walletId,
        withdrawnOn: withdrawnOn || today(),
        ...(trimmedNote ? { note: trimmedNote } : {}),
      });
      navigate("/records");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setSubmitError(
        error instanceof Error ? error.message : "出金を記録できませんでした。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <header className="relative mb-10 flex items-center justify-center">
        <h1 className="text-xl font-extrabold tracking-[-0.04em]">
          出金を記録する
        </h1>
        <Link
          to="/home"
          className="absolute right-0 grid size-10 place-items-center text-3xl leading-none"
          aria-label="記録をやめる"
        >
          ×
        </Link>
      </header>
      {isLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            グループ情報を取得中です…
          </p>
        </Card>
      ) : !currentGroup ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {errorMessage ?? "現在、所属しているグループはありません。"}
          </p>
          {errorMessage && (
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-3 text-sm font-bold underline"
            >
              再試行
            </button>
          )}
        </Card>
      ) : walletStatus === "idle" || walletStatus === "loading" ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            財布情報を取得中です…
          </p>
        </Card>
      ) : walletStatus === "error" ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {walletErrorMessage ?? "財布情報の取得に失敗しました。"}
          </p>
          <button
            type="button"
            onClick={retryWalletLoad}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : wallets.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm">出金を記録するには財布を追加してください。</p>
          <Link
            to="/wallets"
            className="mt-3 inline-block text-sm font-bold underline"
          >
            財布管理へ
          </Link>
        </Card>
      ) : (
        <form
          onSubmit={saveWithdrawal}
          className="flex min-h-[calc(100svh-180px)] flex-col"
        >
          <label className="border-b border-black pb-2">
            <span className="sr-only">金額</span>
            <div className="flex items-center gap-3">
              <span className="text-[42px] leading-none font-extrabold">¥</span>
              <input
                ref={amountInputRef}
                value={formatAmount(amount)}
                onChange={(event) => handleAmountChange(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-right text-[42px] leading-none font-extrabold outline-none placeholder:text-neutral-300"
                inputMode="numeric"
                placeholder="0"
                aria-label="金額"
                disabled={isSubmitting}
              />
            </div>
          </label>
          <Card className="mt-6">
            <label className="block border-b border-black">
              <span className="sr-only">出金元の財布</span>
              <select
                value={walletId}
                onChange={(event) => setWalletId(event.target.value)}
                className={`h-14 w-full bg-white px-4 text-sm font-bold outline-none ${
                  walletId ? "text-black" : "text-neutral-400"
                }`}
                disabled={isSubmitting}
              >
                <option value="">どの財布から出金しましたか？</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">用途</span>
              <input
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                className="h-14 w-full px-4 text-base font-bold outline-none placeholder:text-neutral-400"
                maxLength={200}
                placeholder="何に使いましたか？"
                disabled={isSubmitting}
              />
            </label>
          </Card>
          <label className="mt-3 ml-auto flex w-fit items-center gap-2 border border-black px-2 py-1 text-sm font-bold">
            <span>日付（任意）</span>
            <input
              type="date"
              value={withdrawnOn}
              onChange={(event) => setWithdrawnOn(event.target.value)}
              className="w-28 bg-transparent text-right outline-none"
              disabled={isSubmitting}
            />
          </label>
          <label className="mt-6 block text-sm font-bold">
            <span className="mb-2 block">メモ（任意）</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="h-24 w-full border border-black p-4 text-base outline-none"
              maxLength={1000}
              placeholder="例：駅前パーキング"
              disabled={isSubmitting}
            />
          </label>
          {submitError && (
            <p className="mt-4 text-sm" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isFormReady}
            className="mt-auto grid h-12 w-full place-items-center bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-500"
          >
            {isSubmitting ? "保存中…" : "出金を記録する"}
          </button>
          <Link
            to="/home"
            className="mt-3 grid h-12 w-full place-items-center border border-black text-sm font-bold"
          >
            キャンセル
          </Link>
        </form>
      )}
    </Screen>
  );
}

function formatAmount(amount: string) {
  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
