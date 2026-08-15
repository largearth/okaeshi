import { Link } from "react-router-dom";
import { expenses } from "../data/expenses";
import { Badge, Card, Icon } from "./ui";

export function ExpenseList({ selectable = true }: { selectable?: boolean }) {
  return (
    <Card>
      {expenses.map((expense) => {
        const content = (
          <>
            <span className="grid size-10 shrink-0 place-items-center bg-neutral-100 text-black">
              <Icon name="wallet" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-sm text-black">
                {expense.name}
                {expense.id === "daily" && (
                  <>
                    {" "}
                    <Badge tone="green">精算済み</Badge>
                  </>
                )}
              </b>
              <small className="block text-xs text-neutral-600">
                {expense.detail}
              </small>
            </div>
            <strong className="text-sm text-black">
              ¥{expense.amount.toLocaleString()}
            </strong>
            <Icon name="chevron" size={16} />
          </>
        );
        return selectable ? (
          <Link
            className="flex min-h-[74px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0 hover:bg-neutral-50"
            to="/payments/new/allocation"
            state={{ payment: expense }}
            key={expense.id}
          >
            {content}
          </Link>
        ) : (
          <div
            className="flex min-h-[74px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0"
            key={expense.id}
          >
            {content}
          </div>
        );
      })}
    </Card>
  );
}
