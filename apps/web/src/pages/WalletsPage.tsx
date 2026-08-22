import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ApiRequestError,
  createGroupWallet,
  getGroupMembers,
  getGroupWallets,
  type GroupMember,
  type Wallet,
} from "../api";
import { Heading, Screen } from "../components/layout";
import { Badge, Card, Icon } from "../components/ui";
import { useGroupContext } from "../use-group-context";

export function WalletsPage() {
  const { currentGroup, errorMessage, isLoading, refresh, unauthenticate } =
    useGroupContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [name, setName] = useState("");
  const [ownerType, setOwnerType] = useState<Wallet["ownerType"]>("shared");
  const [ownerMemberId, setOwnerMemberId] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const refreshWalletData = useCallback(async () => {
    if (!currentGroup) return;

    setIsDataLoading(true);
    setDataError(null);
    try {
      const [nextWallets, nextMembers] = await Promise.all([
        getGroupWallets(currentGroup.id),
        getGroupMembers(currentGroup.id),
      ]);
      setWallets(nextWallets);
      setMembers(nextMembers);
    } catch (error) {
      setWallets([]);
      setMembers([]);
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setDataError(
        error instanceof Error
          ? error.message
          : "財布情報の取得に失敗しました。",
      );
    } finally {
      setIsDataLoading(false);
    }
  }, [currentGroup, unauthenticate]);

  useEffect(() => {
    void Promise.resolve().then(refreshWalletData);
  }, [refreshWalletData]);

  const createWallet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGroup) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setCreateError("財布名を入力してください。");
      return;
    }
    if (ownerType === "personal" && !ownerMemberId) {
      setCreateError("所有者を選択してください。");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const wallet = await createGroupWallet(currentGroup.id, {
        name: trimmedName,
        ownerType,
        ...(ownerType === "personal" ? { ownerMemberId } : {}),
      });
      setWallets((currentWallets) => [...currentWallets, wallet]);
      setName("");
      setOwnerType("shared");
      setOwnerMemberId("");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setCreateError(
        error instanceof Error ? error.message : "財布を追加できませんでした。",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const sharedWallets = wallets.filter(
    (wallet) => wallet.ownerType === "shared",
  );
  const personalWallets = wallets.filter(
    (wallet) => wallet.ownerType === "personal",
  );
  const ownerNameById = new Map(
    members.map((member) => [member.id, member.name]),
  );

  return (
    <Screen active="mypage">
      <Heading
        eyebrow={currentGroup?.name ?? "支払い元と返済先"}
        title="財布管理"
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
      ) : isDataLoading ? (
        <Card className="p-4">
          <p className="text-sm" aria-busy="true">
            財布情報を取得中です…
          </p>
        </Card>
      ) : dataError ? (
        <Card className="p-4">
          <p className="text-sm" role="alert">
            {dataError}
          </p>
          <button
            type="button"
            onClick={() => void refreshWalletData()}
            className="mt-3 text-sm font-bold underline"
          >
            再試行
          </button>
        </Card>
      ) : (
        <>
          <section className="mb-6">
            <h2 className="mb-3 text-[15px] font-bold">財布を追加</h2>
            <Card className="p-4">
              <form onSubmit={createWallet} className="space-y-4">
                <label className="block text-sm font-bold">
                  <span className="mb-2 block">財布名</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 w-full border border-black px-4 font-normal outline-none"
                    maxLength={100}
                    disabled={isCreating}
                  />
                </label>
                <label className="block text-sm font-bold">
                  <span className="mb-2 block">種類</span>
                  <select
                    value={ownerType}
                    onChange={(event) => {
                      const nextOwnerType = event.target
                        .value as Wallet["ownerType"];
                      setOwnerType(nextOwnerType);
                      if (nextOwnerType === "shared") setOwnerMemberId("");
                    }}
                    className="h-12 w-full border border-black bg-white px-4 font-normal outline-none"
                    disabled={isCreating}
                  >
                    <option value="shared">共有財布</option>
                    <option value="personal">個人財布</option>
                  </select>
                </label>
                {ownerType === "personal" && (
                  <label className="block text-sm font-bold">
                    <span className="mb-2 block">所有者</span>
                    <select
                      value={ownerMemberId}
                      onChange={(event) => setOwnerMemberId(event.target.value)}
                      className="h-12 w-full border border-black bg-white px-4 font-normal outline-none"
                      disabled={isCreating}
                    >
                      <option value="">選択してください</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {createError && (
                  <p className="text-sm" role="alert">
                    {createError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="grid h-12 w-full place-items-center bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-500"
                >
                  {isCreating ? "追加中…" : "財布を追加"}
                </button>
              </form>
            </Card>
          </section>
          <WalletSection title="共有財布" wallets={sharedWallets} />
          <WalletSection
            title="個人財布"
            wallets={personalWallets}
            ownerNameById={ownerNameById}
          />
        </>
      )}
    </Screen>
  );
}

function WalletSection({
  title,
  wallets,
  ownerNameById,
}: {
  title: string;
  wallets: Wallet[];
  ownerNameById?: Map<string, string>;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-[15px] font-bold">{title}</h2>
      <Card>
        {wallets.length === 0 ? (
          <p className="p-4 text-sm text-neutral-600">まだ財布はありません。</p>
        ) : (
          wallets.map((wallet) => (
            <div
              className="flex min-h-[73px] items-center gap-3 border-b border-black px-3.5 py-3 last:border-b-0"
              key={wallet.id}
            >
              <span className="grid size-10 place-items-center bg-neutral-100 text-black">
                <Icon name="wallet" />
              </span>
              <div className="flex-1">
                <b className="block text-sm">{wallet.name}</b>
                <small className="block text-xs text-neutral-600">
                  {wallet.ownerType === "shared"
                    ? "グループ共有"
                    : `${ownerNameById?.get(wallet.ownerMemberId ?? "") ?? "不明"}の個人財布`}
                </small>
              </div>
              <Badge>公開中</Badge>
            </div>
          ))
        )}
      </Card>
    </section>
  );
}
