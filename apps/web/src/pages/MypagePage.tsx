import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../auth-client";
import { Heading, Screen } from "../components/layout";
import { Avatar, Card, Icon } from "../components/ui";
import { useGroupContext } from "../use-group-context";

export function MypagePage() {
  const navigate = useNavigate();
  const { currentGroup, currentUser, errorMessage, isLoading, refresh } =
    useGroupContext();

  const signOut = async () => {
    await authClient.signOut();
    navigate("/", { replace: true });
  };

  return (
    <Screen active="mypage">
      <Heading
        eyebrow="アカウントとグループ"
        title="マイページ"
        right={<Avatar name={currentUser?.name ?? "ユーザー"} />}
      />
      <Card className="mb-6 p-4">
        <small className="block text-xs text-neutral-600">現在のグループ</small>
        {isLoading ? (
          <p className="mt-3 text-sm" aria-busy="true">
            グループ情報を取得中です…
          </p>
        ) : currentGroup ? (
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center bg-neutral-100 text-black">
              <Icon name="home" />
            </span>
            <div className="flex-1">
              <b className="block text-sm">{currentGroup.name}</b>
              <small className="block text-xs text-neutral-600">
                所属中のグループ
              </small>
            </div>
          </div>
        ) : (
          <div className="mt-3" role="alert">
            <p className="text-sm">
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
          </div>
        )}
      </Card>
      {currentGroup && (
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
                メンバーを確認
              </small>
            </div>
            <Icon name="chevron" size={17} />
          </Link>
        </Card>
      )}
      <button
        type="button"
        onClick={signOut}
        className="mt-6 flex h-12 w-full items-center justify-center border border-black text-sm font-bold"
      >
        ログアウト
      </button>
    </Screen>
  );
}
