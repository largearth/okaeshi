import { Heading, Screen } from "../components/layout";
import { Avatar, Badge, Card } from "../components/ui";

export function GroupPage() {
  return (
    <Screen active="mypage">
      <Heading eyebrow="わが家" title="グループ" />
      <section>
        <h2 className="mb-3 text-[15px] font-bold">メンバー</h2>
        <Card>
          <div className="flex min-h-[73px] items-center gap-3 border-b border-black px-3.5 py-3">
            <Avatar />
            <div className="flex-1">
              <b className="block text-sm">大地</b>
              <small className="block text-xs text-neutral-600">管理者</small>
            </div>
            <Badge tone="green">あなた</Badge>
          </div>
          <div className="flex min-h-[73px] items-center gap-3 px-3.5 py-3">
            <Avatar name="愛美" />
            <div className="flex-1">
              <b className="block text-sm">愛美</b>
              <small className="block text-xs text-neutral-600">メンバー</small>
            </div>
          </div>
        </Card>
      </section>
    </Screen>
  );
}
