import { ExpenseList } from "../components/expenses";
import { Heading, Screen } from "../components/layout";
import { Icon } from "../components/ui";

export function RecordsPage() {
  return (
    <Screen active="records">
      <Heading eyebrow="支払いの履歴" title="出金記録" />
      <p className="mt-[-10px] mb-5 flex items-center gap-2 text-[13px] text-neutral-600">
        <Icon name="calendar" size={17} />
        2026年8月
      </p>
      <ExpenseList selectable />
    </Screen>
  );
}
