import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { createDb } from "./client";
import { accounts, groupMembers, groups, users } from "./schema";

config({ path: process.env.OKAESHI_ENV_FILE ?? ".dev.vars" });

const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} must be configured before running db:seed`);
  }

  return value;
};

const databaseUrl = required(process.env.DATABASE_URL, "DATABASE_URL");
const groupName = required(process.env.SEED_GROUP_NAME, "SEED_GROUP_NAME");
const seedUsers = [
  {
    name: required(process.env.SEED_USER_1_NAME, "SEED_USER_1_NAME"),
    email: required(process.env.SEED_USER_1_EMAIL, "SEED_USER_1_EMAIL"),
    password: required(
      process.env.SEED_USER_1_PASSWORD,
      "SEED_USER_1_PASSWORD",
    ),
    role: "owner",
  },
  {
    name: required(process.env.SEED_USER_2_NAME, "SEED_USER_2_NAME"),
    email: required(process.env.SEED_USER_2_EMAIL, "SEED_USER_2_EMAIL"),
    password: required(
      process.env.SEED_USER_2_PASSWORD,
      "SEED_USER_2_PASSWORD",
    ),
    role: "member",
  },
] as const;

const db = createDb(databaseUrl);

const seed = async () => {
  const seededUsers = [];

  for (const seedUser of seedUsers) {
    const email = seedUser.email.toLowerCase();
    const [user] = await db
      .insert(users)
      .values({
        name: seedUser.name,
        email,
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: seedUser.name,
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const passwordHash = await hashPassword(seedUser.password);
    await db
      .insert(accounts)
      .values({
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
      })
      .onConflictDoUpdate({
        target: [accounts.providerId, accounts.accountId],
        set: { password: passwordHash, updatedAt: new Date() },
      });

    seededUsers.push({ ...user, role: seedUser.role });
  }

  const [existingGroup] = await db
    .select()
    .from(groups)
    .where(eq(groups.name, groupName))
    .limit(1);
  const group =
    existingGroup ??
    (await db.insert(groups).values({ name: groupName }).returning())[0];

  for (const user of seededUsers) {
    await db
      .insert(groupMembers)
      .values({
        groupId: group.id,
        userId: user.id,
        role: user.role,
        status: "active",
      })
      .onConflictDoUpdate({
        target: [groupMembers.groupId, groupMembers.userId],
        set: { role: user.role, status: "active", leftAt: null },
      });
  }
};

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
