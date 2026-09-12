import { spawnSync } from "node:child_process";

const commands = [
  ["node", ["--import", "tsx", "--test", "tests/agentCapabilities.test.ts", "tests/agentExecution.test.ts", "tests/webmcpAdapter.test.ts", "tests/internalGuide.test.ts", "tests/agentGuidePolicy.test.ts", "tests/internalGuideAI.test.ts", "tests/agentGuideApi.test.ts", "tests/agentUserState.test.ts", "tests/questionnaireWebhookPolicy.test.ts"]],
  ["npm", ["run", "lint"]],
  ["npm", ["run", "build"]],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
