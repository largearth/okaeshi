import type { Withdrawal } from "../api";
import { Card, Icon } from "./ui";

export function WithdrawalList({
  withdrawals,
  walletNameById,
}: {
  withdrawals: Withdrawal[];
  walletNameById: Map<string, string>;
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
        </div>
      ))}
    </Card>
  );
}
