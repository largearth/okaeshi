import { useCallback, useEffect, useState } from "react";
import {
  ApiRequestError,
  deleteGroupWithdrawal,
  getGroupWallets,
  getGroupWithdrawals,
  type Wallet,
  type Withdrawal,
} from "../api";
import { WithdrawalList } from "../components/expenses";
import { Heading, Screen } from "../components/layout";
import { Card } from "../components/ui";
import { useGroupContext } from "../use-group-context";

export function RecordsPage() {
  const { currentGroup, errorMessage, isLoading, refresh, unauthenticate } =
    useGroupContext();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [areRecordsLoading, setAreRecordsLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingWithdrawalId, setDeletingWithdrawalId] = useState<
    string | null
  >(null);

  const refreshRecords = useCallback(async () => {
    if (!currentGroup) return;

    setAreRecordsLoading(true);
    setRecordsError(null);
    try {
      const [nextWithdrawals, nextWallets] = await Promise.all([
        getGroupWithdrawals(currentGroup.id),
        getGroupWallets(currentGroup.id),
      ]);
      setWithdrawals(nextWithdrawals);
      setWallets(nextWallets);
    } catch (error) {
      setWithdrawals([]);
      setWallets([]);
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

  const deleteWithdrawal = async (withdrawal: Withdrawal) => {
    if (!currentGroup) return;
    if (!window.confirm(`「${withdrawal.purpose}」を削除しますか？`)) return;

    setDeletingWithdrawalId(withdrawal.id);
    setDeleteError(null);
    try {
      await deleteGroupWithdrawal(currentGroup.id, withdrawal.id);
      setWithdrawals((currentWithdrawals) =>
        currentWithdrawals.filter((item) => item.id !== withdrawal.id),
      );
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setDeleteError(
        error instanceof Error
          ? error.message
          : "出金記録を削除できませんでした。",
      );
    } finally {
      setDeletingWithdrawalId(null);
    }
  };

  const walletNameById = new Map(
    wallets.map((wallet) => [wallet.id, wallet.name]),
  );

  return (
    <Screen active="records">
      <Heading
        eyebrow={currentGroup?.name ?? "支払いの履歴"}
        title="出金記録"
      />
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
        <>
          {deleteError && (
            <Card className="mb-4 p-4">
              <p className="text-sm" role="alert">
                {deleteError}
              </p>
            </Card>
          )}
          <WithdrawalList
            withdrawals={withdrawals}
            walletNameById={walletNameById}
            deletingWithdrawalId={deletingWithdrawalId}
            onDelete={(withdrawal) => void deleteWithdrawal(withdrawal)}
          />
        </>
      )}
    </Screen>
  );
}
