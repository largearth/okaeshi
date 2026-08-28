import { config } from "dotenv";
import { hashPassword } from "better-auth/crypto";

import { createDb } from "./client";
import {
  accounts,
  allocations,
  groupMembers,
  groups,
  users,
  wallets,
  withdrawals,
} from "./schema";

config({ path: process.env.OKAESHI_ENV_FILE ?? ".dev.vars" });

const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} must be configured before running verification`);
  }

  return value;
};

if (process.env.ENVIRONMENT !== "development") {
  throw new Error(
    "Verification fixtures can only be created with ENVIRONMENT=development",
  );
}

const databaseUrl = required(process.env.DATABASE_URL, "DATABASE_URL");
const verificationUser = {
  id: "7a60140c-6060-4a84-b3d8-6e0571554db8",
  name: process.env.VERIFY_USER_NAME ?? "Verification user",
  email: (
    process.env.VERIFY_USER_EMAIL ?? "verification@example.test"
  ).toLowerCase(),
  password:
    process.env.VERIFY_USER_PASSWORD ?? "verify-records-delete-password",
};
const verificationGroup = {
  id: "de086a07-0c9c-4a2a-bf75-029c7d0df01d",
  name: process.env.VERIFY_GROUP_NAME ?? "E2E verification household",
};
const verificationMemberId = "280e9f97-5c9d-4d7b-9c73-a44d7636b3c9";
const verificationWalletId = "cb405d7e-8317-4e3e-8f63-25c5067d1b50";
const unallocatedWithdrawalId = "4d7a43b0-cedd-40ee-949a-c450e6122881";
const allocatedWithdrawalId = "4d7c411a-c697-4dc2-88a9-7f070e93dfa6";
const allocationId = "705b68a9-3c61-4e66-9d90-1f2e8b724b59";

const db = createDb(databaseUrl);

const seed = async () => {
  const passwordHash = await hashPassword(verificationUser.password);

  await db
    .insert(users)
    .values({
      id: verificationUser.id,
      name: verificationUser.name,
      email: verificationUser.email,
      emailVerified: true,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: verificationUser.name,
        email: verificationUser.email,
        emailVerified: true,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(accounts)
    .values({
      userId: verificationUser.id,
      providerId: "credential",
      accountId: verificationUser.id,
      password: passwordHash,
    })
    .onConflictDoUpdate({
      target: [accounts.providerId, accounts.accountId],
      set: { password: passwordHash, updatedAt: new Date() },
    });

  await db
    .insert(groups)
    .values(verificationGroup)
    .onConflictDoUpdate({
      target: groups.id,
      set: { name: verificationGroup.name, updatedAt: new Date() },
    });

  await db
    .insert(groupMembers)
    .values({
      id: verificationMemberId,
      groupId: verificationGroup.id,
      userId: verificationUser.id,
      role: "owner",
      status: "active",
    })
    .onConflictDoUpdate({
      target: groupMembers.id,
      set: { role: "owner", status: "active", leftAt: null },
    });

  await db
    .insert(wallets)
    .values({
      id: verificationWalletId,
      groupId: verificationGroup.id,
      name: "E2E 検証用財布",
      ownerType: "shared",
    })
    .onConflictDoUpdate({
      target: wallets.id,
      set: { name: "E2E 検証用財布", ownerType: "shared", ownerMemberId: null },
    });

  await db
    .insert(withdrawals)
    .values({
      id: unallocatedWithdrawalId,
      groupId: verificationGroup.id,
      walletId: verificationWalletId,
      purpose: "E2E 未配分出金",
      amount: 1000n,
      withdrawnOn: "2026-01-01",
      status: "unallocated",
    })
    .onConflictDoUpdate({
      target: withdrawals.id,
      set: {
        walletId: verificationWalletId,
        purpose: "E2E 未配分出金",
        amount: 1000n,
        withdrawnOn: "2026-01-01",
        status: "unallocated",
        updatedAt: new Date(),
      },
    });

  await db
    .insert(withdrawals)
    .values({
      id: allocatedWithdrawalId,
      groupId: verificationGroup.id,
      walletId: verificationWalletId,
      purpose: "E2E 配分済出金",
      amount: 2000n,
      withdrawnOn: "2026-01-02",
      status: "allocated",
    })
    .onConflictDoUpdate({
      target: withdrawals.id,
      set: {
        walletId: verificationWalletId,
        purpose: "E2E 配分済出金",
        amount: 2000n,
        withdrawnOn: "2026-01-02",
        status: "allocated",
        updatedAt: new Date(),
      },
    });

  await db
    .insert(allocations)
    .values({
      id: allocationId,
      withdrawalId: allocatedWithdrawalId,
      memberId: verificationMemberId,
      amount: 2000n,
    })
    .onConflictDoUpdate({
      target: allocations.id,
      set: { amount: 2000n, updatedAt: new Date() },
    });
};

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
