import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  accounts,
  activities,
  allocations,
  claimItems,
  claims,
  groupMembers,
  groups,
  sessions,
  users,
  verifications,
  wallets,
  withdrawals,
} from "./schema";

const tables = [
  groups,
  users,
  sessions,
  accounts,
  verifications,
  groupMembers,
  wallets,
  withdrawals,
  allocations,
  claims,
  claimItems,
  activities,
];

describe("database schema", () => {
  it("defines all tables from the database design", () => {
    expect(tables.map((table) => getTableConfig(table).name)).toEqual([
      "groups",
      "users",
      "sessions",
      "accounts",
      "verifications",
      "group_members",
      "wallets",
      "withdrawals",
      "allocations",
      "claims",
      "claim_items",
      "activities",
    ]);
  });

  it("adds the business-rule constraints that a table can enforce", () => {
    const userConfig = getTableConfig(users);
    const walletConfig = getTableConfig(wallets);
    const allocationConfig = getTableConfig(allocations);
    const claimItemConfig = getTableConfig(claimItems);

    expect(userConfig.checks.map((check) => check.name)).toEqual([
      "users_email_lowercase_check",
    ]);
    expect(walletConfig.checks.map((check) => check.name)).toEqual([
      "wallets_owner_type_check",
      "wallets_owner_member_check",
    ]);
    expect(
      allocationConfig.uniqueConstraints.map((constraint) => constraint.name),
    ).toEqual(["allocations_withdrawal_id_member_id_key"]);
    expect(
      claimItemConfig.uniqueConstraints.map((constraint) => constraint.name),
    ).toEqual(["claim_items_allocation_id_key"]);
    expect(
      userConfig.columns.find((column) => column.name === "email_verified"),
    ).toBeDefined();
  });

  it("adds the Better Auth account and session constraints", () => {
    const sessionConfig = getTableConfig(sessions);
    const accountConfig = getTableConfig(accounts);

    expect(
      sessionConfig.columns.find((column) => column.name === "token"),
    ).toBeDefined();
    expect(
      accountConfig.uniqueConstraints.map((constraint) => constraint.name),
    ).toEqual(["accounts_provider_id_account_id_key"]);
  });

  it("adds indexes for the documented list and timeline queries", () => {
    expect(
      getTableConfig(withdrawals).indexes.map((index) => index.config.name),
    ).toContain("withdrawals_group_id_withdrawn_on_index");
    expect(
      getTableConfig(claims).indexes.map((index) => index.config.name),
    ).toEqual(
      expect.arrayContaining([
        "claims_debtor_member_id_status_created_at_index",
        "claims_wallet_id_status_index",
      ]),
    );
    expect(
      getTableConfig(activities).indexes.map((index) => index.config.name),
    ).toContain("activities_group_id_created_at_index");
  });
});
