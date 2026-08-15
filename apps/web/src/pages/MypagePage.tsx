import { Link } from "react-router-dom";
import { Heading, Screen } from "../components/layout";
import { Avatar, Card, Icon } from "../components/ui";

export function MypagePage() {
  return (
    <Screen active="mypage">
      <Heading
        eyebrow="アカウントとグループ"
        title="マイページ"
        right={<Avatar />}
      />
      <Card className="mb-6 p-4">
        <small className="block text-xs text-neutral-600">現在のグループ</small>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid size-10 place-items-center bg-neutral-100 text-black">
            <Icon name="home" />
          </span>
          <div className="flex-1">
            <b className="block text-sm">わが家</b>
            <small className="block text-xs text-neutral-600">
              大地・愛美の2人
            </small>
          </div>
        </div>
      </Card>
      <Card>
        <Link
          className="flex min-h-[73px] items-center gap-3 border-b border-black px-3.5 py-3"
          to="/wallets"
        >
          <span className="grid size-10 place-items-center bg-neutral-100 text-black">
            <Icon name="wallet" />
          </span>
          <div className="flex-1">
            <b className="block text-sm">財布管理</b>
            <small className="block text-xs text-neutral-600">
              共有・個人の財布を確認
            </small>
          </div>
          <Icon name="chevron" size={17} />
        </Link>
        <Link
          className="flex min-h-[73px] items-center gap-3 px-3.5 py-3"
          to="/group"
        >
          <span className="grid size-10 place-items-center bg-neutral-100 text-black">
            <Icon name="group" />
          </span>
          <div className="flex-1">
            <b className="block text-sm">所属グループ</b>
            <small className="block text-xs text-neutral-600">
              メンバーと招待を管理
            </small>
          </div>
          <Icon name="chevron" size={17} />
        </Link>
      </Card>
    </Screen>
  );
}
