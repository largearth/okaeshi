import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiRequestError,
  createGroupWithdrawal,
  getGroupWallets,
  type Wallet,
} from "../api";
import { Heading, Screen } from "../components/layout";
import { Card, Icon } from "../components/ui";
import { useGroupContext } from "../use-group-context";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-4 block text-sm font-bold">
      <b className="mb-2 block">{label}</b>
      {children}
    </label>
  );
}
export function PaymentPage() {
  const navigate = useNavigate();
  const { currentGroup, errorMessage, isLoading, refresh, unauthenticate } =
    useGroupContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletsError, setWalletsError] = useState<string | null>(null);
  const [areWalletsLoading, setAreWalletsLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [withdrawnOn, setWithdrawnOn] = useState(today());
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshWallets = useCallback(async () => {
    if (!currentGroup) return;

    setAreWalletsLoading(true);
    setWalletsError(null);
    try {
      setWallets(await getGroupWallets(currentGroup.id));
    } catch (error) {
      setWallets([]);
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setWalletsError(
        error instanceof Error
          ? error.message
          : "財布情報の取得に失敗しました。",
      );
    } finally {
      setAreWalletsLoading(false);
    }
  }, [currentGroup, unauthenticate]);

  useEffect(() => {
    void Promise.resolve().then(refreshWallets);
  }, [refreshWallets]);

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
    if (!withdrawnOn) {
      setSubmitError("支出日を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createGroupWithdrawal(currentGroup.id, {
        purpose: trimmedPurpose,
        amount,
        walletId,
        withdrawnOn,
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
      <header className="mb-4 flex items-center justify-between">
        <Link
          to="/home"
          className="grid size-10 place-items-center border border-black"
        >
          <Icon name="back" />
        </Link>
      </header>
      <Heading eyebrow="支払いを追加" title="支払いを記録する" />
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
      ) : areWalletsLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            財布情報を取得中です…
          </p>
        </Card>
      ) : walletsError ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {walletsError}
          </p>
          <button
            type="button"
            onClick={() => void refreshWallets()}
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
        <form onSubmit={saveWithdrawal}>
          <Field label="何に支払いましたか？">
            <input
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="h-12 w-full border border-black px-4 outline-none"
              maxLength={200}
              disabled={isSubmitting}
            />
          </Field>
          <Field label="支払った金額">
            <div className="flex h-12 w-full items-center gap-2 border border-black px-4">
              <span>¥</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full outline-none"
                inputMode="numeric"
                disabled={isSubmitting}
              />
            </div>
          </Field>
          <Field label="支払元の財布">
            <select
              value={walletId}
              onChange={(event) => setWalletId(event.target.value)}
              className="h-12 w-full border border-black bg-white px-4 outline-none"
              disabled={isSubmitting}
            >
              <option value="">選択してください</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="支払った日">
            <input
              type="date"
              value={withdrawnOn}
              onChange={(event) => setWithdrawnOn(event.target.value)}
              className="h-12 w-full border border-black px-4 outline-none"
              disabled={isSubmitting}
            />
          </Field>
          <Field label="メモ　（任意）">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="h-24 w-full border border-black p-4 outline-none"
              maxLength={1000}
              placeholder="例：駅前パーキング"
              disabled={isSubmitting}
            />
          </Field>
          {submitError && (
            <p className="mb-4 text-sm" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 grid h-12 w-full place-items-center bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-500"
          >
            {isSubmitting ? "保存中…" : "出金を記録する"}
          </button>
        </form>
      )}
    </Screen>
  );
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
