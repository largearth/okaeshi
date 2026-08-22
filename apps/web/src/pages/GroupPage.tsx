import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, getGroupMembers, type GroupMember } from "../api";
import { Heading, Screen } from "../components/layout";
import { Avatar, Badge, Card } from "../components/ui";
import { useGroupContext } from "../use-group-context";

export function GroupPage() {
  const { currentGroup, errorMessage, isLoading, refresh, unauthenticate } =
    useGroupContext();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [areMembersLoading, setAreMembersLoading] = useState(false);

  const refreshMembers = useCallback(async () => {
    if (!currentGroup) return;

    setAreMembersLoading(true);
    setMembersError(null);
    try {
      setMembers(await getGroupMembers(currentGroup.id));
    } catch (error) {
      setMembers([]);
      if (error instanceof ApiRequestError && error.status === 401) {
        unauthenticate();
        return;
      }
      setMembersError(
        error instanceof Error
          ? error.message
          : "メンバーの取得に失敗しました。",
      );
    } finally {
      setAreMembersLoading(false);
    }
  }, [currentGroup, unauthenticate]);

  useEffect(() => {
    void Promise.resolve().then(refreshMembers);
  }, [refreshMembers]);

  return (
    <Screen active="mypage">
      <Heading eyebrow={currentGroup?.name ?? "グループ"} title="グループ" />
      <section>
        <h2 className="mb-3 text-[15px] font-bold">メンバー</h2>
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
        ) : areMembersLoading ? (
          <Card className="p-4">
            <p className="text-sm" aria-busy="true">
              メンバー情報を取得中です…
            </p>
          </Card>
        ) : membersError ? (
          <Card className="p-4">
            <p className="text-sm" role="alert">
              {membersError}
            </p>
            <button
              type="button"
              onClick={() => void refreshMembers()}
              className="mt-3 text-sm font-bold underline"
            >
              再試行
            </button>
          </Card>
        ) : (
          <Card>
            {members.map((member, index) => (
              <div
                key={member.id}
                className={`flex min-h-[73px] items-center gap-3 px-3.5 py-3 ${index < members.length - 1 ? "border-b border-black" : ""}`}
              >
                <Avatar name={member.name} />
                <div className="flex-1">
                  <b className="block text-sm">{member.name}</b>
                  <small className="block text-xs text-neutral-600">
                    {member.role === "owner" ? "管理者" : "メンバー"}
                  </small>
                </div>
                {member.id === currentGroup.memberId && <Badge>あなた</Badge>}
              </div>
            ))}
          </Card>
        )}
      </section>
    </Screen>
  );
}
