import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const packagesDir = join(process.cwd(), "packages");
const requiredDemoStubs = [
  "crowdfunding_core.ts",
  "guess_the_number.ts",
  "impact_sbt.ts",
].map((fileName) => join(process.cwd(), "src", "contracts", fileName));

function getGeneratedPackages() {
  if (!existsSync(packagesDir)) return [];

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesDir, entry.name))
    .filter((packageDir) => existsSync(join(packageDir, "package.json")));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const generatedPackages = getGeneratedPackages();

if (generatedPackages.length === 0) {
  const missingStubs = requiredDemoStubs.filter(
    (stubPath) => !existsSync(stubPath),
  );

  if (missingStubs.length > 0) {
    console.error("No generated Stellar client packages were found.");
    console.error("The demo fallback stubs are also missing:");
    missingStubs.forEach((stubPath) => console.error(`- ${stubPath}`));
    process.exit(1);
  }

  console.log(
    "No generated Stellar client packages found; using committed demo stubs.",
  );
  process.exit(0);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

console.log(
  `Found ${generatedPackages.length} generated Stellar client package(s).`,
);

run(npmCommand, ["install", "--workspaces", "--include-workspace-root=false"]);
run(npmCommand, ["run", "build", "--workspaces", "--if-present"]);
