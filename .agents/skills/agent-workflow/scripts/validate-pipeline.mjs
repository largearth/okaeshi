#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const skillRoot = fileURLToPath(new URL("..", import.meta.url));
const pipeline = JSON.parse(
  await readFile(`${skillRoot}/references/pipeline.json`, "utf8"),
);
const cases = JSON.parse(
  await readFile(`${skillRoot}/evals/routing-cases.json`, "utf8"),
);

const failures = [];
const requiredBlockedOrigins = [
  "router",
  "understand",
  "reproduce",
  "design",
  "build",
  "verification",
  "evidence",
  "delivery",
];
const requiredCompletionArtifacts = [
  "verification",
  "evidence",
  "self-review",
  "commit",
  "push",
  "pull-request",
];

for (const origin of requiredBlockedOrigins) {
  if (!pipeline.blocked_from.includes(origin)) {
    failures.push(`blocked_from に ${origin} がありません`);
  }
}

for (const artifact of requiredCompletionArtifacts) {
  if (!pipeline.normal_completion_requires.includes(artifact)) {
    failures.push(`normal_completion_requires に ${artifact} がありません`);
  }
}

for (const [taskType, playbookName] of Object.entries(pipeline.task_types)) {
  if (playbookName !== null && !pipeline.playbooks[playbookName]) {
    failures.push(
      `${taskType} が未定義のPlaybook ${playbookName} を参照しています`,
    );
  }
}

for (const [playbookName, playbook] of Object.entries(pipeline.playbooks)) {
  for (const requiredStage of ["verification", "evidence", "delivery"]) {
    if (!playbook.stages.includes(requiredStage)) {
      failures.push(
        `${playbookName} に必須Stage ${requiredStage} がありません`,
      );
    }
  }

  const requiredOrder = ["verification", "evidence", "delivery"];
  const actualOrder = playbook.stages.filter((stage) =>
    requiredOrder.includes(stage),
  );
  if (JSON.stringify(actualOrder) !== JSON.stringify(requiredOrder)) {
    failures.push(`${playbookName} のVerification以降の順序が不正です`);
  }

  for (const optionalStage of ["reproduce", "design"]) {
    if (
      !playbook.stages.includes(optionalStage) &&
      !playbook.skipped_stages[optionalStage]
    ) {
      failures.push(
        `${playbookName} に ${optionalStage} のskip理由がありません`,
      );
    }
  }
}

for (const testCase of cases) {
  const selectedPlaybook = pipeline.task_types[testCase.expected_type];
  if (selectedPlaybook === undefined) {
    failures.push(`${testCase.name}: expected_type が未定義です`);
    continue;
  }
  if (selectedPlaybook !== testCase.expected_playbook) {
    failures.push(`${testCase.name}: Task typeとPlaybookの対応が一致しません`);
    continue;
  }

  if (testCase.expected_final_state === "completed") {
    const expectedStages = pipeline.playbooks[selectedPlaybook]?.stages;
    if (
      JSON.stringify(expectedStages) !==
      JSON.stringify(testCase.expected_visited_stages)
    ) {
      failures.push(`${testCase.name}: 完了経路がPlaybookと一致しません`);
    }
    continue;
  }

  if (!testCase.blocked_at) {
    failures.push(`${testCase.name}: blocked_at がありません`);
    continue;
  }
  if (!pipeline.blocked_from.includes(testCase.blocked_at)) {
    failures.push(
      `${testCase.name}: ${testCase.blocked_at} からBlockedへ遷移できません`,
    );
  }
  if (testCase.expected_visited_stages.at(-1) !== testCase.blocked_at) {
    failures.push(`${testCase.name}: 通過経路がBlocked地点で終了していません`);
  }

  if (selectedPlaybook !== null) {
    const playbookStages = pipeline.playbooks[selectedPlaybook].stages;
    const blockedIndex = playbookStages.indexOf(testCase.blocked_at);
    const expectedPrefix = playbookStages.slice(0, blockedIndex + 1);
    if (
      blockedIndex === -1 ||
      JSON.stringify(expectedPrefix) !==
        JSON.stringify(testCase.expected_visited_stages)
    ) {
      failures.push(
        `${testCase.name}: Blockedまでの経路がPlaybookと一致しません`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`Pipeline validation failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Pipeline validation passed: ${Object.keys(pipeline.playbooks).length} playbooks, ${cases.length} routing cases`,
  );
}
