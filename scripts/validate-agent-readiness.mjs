import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const testFiles = readdirSync("tests")
  .filter((name) => name.endsWith(".test.ts"))
  .sort()
  .map((name) => `tests/${name}`);

const commands = [
  ["node", ["--import", "tsx", "--test", ...testFiles]],
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
