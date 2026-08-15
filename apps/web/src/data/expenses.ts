export const expenses = [
  {
    id: "parking",
    name: "駐車場代",
    detail: "共有財布 ・ 今日 12:30",
    amount: 400,
    wallet: "共有財布",
    tone: "orange",
  },
  {
    id: "groceries",
    name: "週の食料品",
    detail: "共有口座 ・ 昨日 18:20",
    amount: 8500,
    wallet: "共有口座",
    tone: "blue",
  },
  {
    id: "daily",
    name: "日用品",
    detail: "愛美のカード ・ 8月7日",
    amount: 1500,
    wallet: "愛美のカード",
    tone: "mint",
  },
] as const;

export type Expense = (typeof expenses)[number];
