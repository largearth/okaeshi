import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, getGroupWithdrawals, type Withdrawal } from "../api";
import { WithdrawalList } from "../components/expenses";
import { BottomNav } from "../components/layout";
import { Card } from "../components/ui";
import { useWalletStore } from "../stores/use-wallet-store";
import { useGroupContext } from "../use-group-context";

export function RecordsPage() {
  const { currentGroup, errorMessage, isLoading, refresh, unauthenticate } =
    useGroupContext();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [areRecordsLoading, setAreRecordsLoading] = useState(false);
  const wallets = useWalletStore((state) => state.wallets);

  const refreshRecords = useCallback(async () => {
    if (!currentGroup) return;

    setAreRecordsLoading(true);
    setRecordsError(null);
    try {
      const nextWithdrawals = await getGroupWithdrawals(currentGroup.id);
      setWithdrawals(nextWithdrawals);
    } catch (error) {
      setWithdrawals([]);
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setRecordsError(
        error instanceof Error
          ? error.message
          : "出金記録の取得に失敗しました。",
      );
    } finally {
      setAreRecordsLoading(false);
    }
  }, [currentGroup, unauthenticate]);

  useEffect(() => {
    void Promise.resolve().then(refreshRecords);
  }, [refreshRecords]);

  const walletNameById = new Map(
    wallets.map((wallet) => [wallet.id, wallet.name]),
  );

  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl bg-white px-6 pt-8 pb-28">
      <header className="mb-9">
        <h1 className="text-[34px] leading-tight font-extrabold tracking-[-0.06em] text-black">
          Record
        </h1>
        <p className="text-xs font-bold text-black">出金記録を管理</p>
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
      ) : areRecordsLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            出金記録を取得中です…
          </p>
        </Card>
      ) : recordsError ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {recordsError}
          </p>
          <button
            type="button"
            onClick={() => void refreshRecords()}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : withdrawals.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-neutral-600">まだ出金記録はありません。</p>
        </Card>
      ) : (
        <WithdrawalList
          withdrawals={withdrawals}
          walletNameById={walletNameById}
        />
      )}
      <BottomNav active="records" />
    </main>
  );
}
