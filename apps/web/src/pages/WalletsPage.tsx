import { Heading, Screen } from "../components/layout";
import { Badge, Card, Icon } from "../components/ui";

const walletSections = [
  {
    title: "共有財布",
    wallets: [
      ["共有口座", "グループ共有"],
      ["共有財布", "グループ共有"],
    ],
  },
  {
    title: "個人財布",
    wallets: [
      ["現金財布", "大地の個人財布"],
      ["クレジットカード", "大地の個人財布"],
    ],
  },
];
export function WalletsPage() {
  return (
    <Screen active="mypage">
      <Heading eyebrow="支払い元と返済先" title="財布管理" />
      {walletSections.map(({ title, wallets }) => (
        <section className="mb-6" key={title}>
          <h2 className="mb-3 text-[15px] font-bold">{title}</h2>
          <Card>
            {wallets.map(([name, detail]) => (
              <div
                className="flex min-h-[73px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0"
                key={name}
              >
                <span className="grid size-10 place-items-center bg-neutral-100 text-black">
                  <Icon name="wallet" />
                </span>
                <div className="flex-1">
                  <b className="block text-sm">{name}</b>
                  <small className="block text-xs text-neutral-600">
                    {detail}
                  </small>
                </div>
                <Badge>公開中</Badge>
              </div>
            ))}
          </Card>
        </section>
      ))}
    </Screen>
  );
}
