const apiOrigin = (
  import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8787"
).replace(/\/$/, "");

export type Group = {
  id: string;
  name: string;
  memberId: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  groups: Group[];
};

export type GroupMember = {
  id: string;
  name: string;
  role: "owner" | "member";
  avatarUrl: string | null;
};

type ErrorResponse = {
  message?: string;
};

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiOrigin}${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;
    throw new ApiRequestError(
      response.status,
      body?.message ?? "データの取得に失敗しました。",
    );
  }

  return response.json() as Promise<T>;
}

export function getCurrentUser() {
  return get<CurrentUser>("/api/me");
}

export async function getGroupMembers(groupId: string) {
  const response = await get<{ members: GroupMember[] }>(
    `/api/groups/${groupId}/members`,
  );
  return response.members;
}
