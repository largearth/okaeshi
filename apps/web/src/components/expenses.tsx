import type { Withdrawal } from "../api";
import { Card, Icon } from "./ui";

export function WithdrawalList({
  withdrawals,
  walletNameById,
  deletingWithdrawalId,
  onDelete,
}: {
  withdrawals: Withdrawal[];
  walletNameById: Map<string, string>;
  deletingWithdrawalId: string | null;
  onDelete: (withdrawal: Withdrawal) => void;
}) {
  return (
    <Card>
      {withdrawals.map((withdrawal) => (
        <div
          className="flex min-h-[74px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0"
          key={withdrawal.id}
        >
          <span className="grid size-10 shrink-0 place-items-center bg-neutral-100 text-black">
            <Icon name="wallet" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block text-sm text-black">{withdrawal.purpose}</b>
            <small className="block text-xs text-neutral-600">
              {walletNameById.get(withdrawal.walletId) ?? "不明な財布"} ・{" "}
              {withdrawal.withdrawnOn}
            </small>
          </div>
          <strong className="text-sm text-black">
            ¥{BigInt(withdrawal.amount).toLocaleString("ja-JP")}
          </strong>
          {withdrawal.status === "unallocated" && (
            <button
              type="button"
              aria-label={`${withdrawal.purpose}を削除`}
              onClick={() => onDelete(withdrawal)}
              disabled={deletingWithdrawalId === withdrawal.id}
              className="shrink-0 text-sm font-bold underline disabled:cursor-not-allowed disabled:text-neutral-400"
            >
              {deletingWithdrawalId === withdrawal.id ? "削除中…" : "削除"}
            </button>
          )}
        </div>
      ))}
    </Card>
  );
}
