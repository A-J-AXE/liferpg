import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const required = [
  "docs/rebuild/component-source-map.md",
  "docs/rebuild/asset-manifest.md",
  "docs/rebuild/INSTALLATION.md",
  "docs/rebuild/visual-reference-matrix.md",
  "docs/rebuild/reward-v3.1-contract.md",
  "docs/rebuild/REBUILD-DECISIONS.md",
  ".agents/skills/lifeos-template-first-frontend/SKILL.md",
  "AGENTS.md",
];
for (const path of required) {
  assert(existsSync(path), "Missing required PR 00 source-lock document: " + path);
  assert(readFileSync(path, "utf8").trim().length > 100, "Empty source-lock document: " + path);
}
const contract = readFileSync("docs/rebuild/reward-v3.1-contract.md", "utf8");
const numberedTests = [...contract.matchAll(/^(\d{2})\. /gm)].map((match) => Number(match[1]));
assert.equal(numberedTests.length, 51, "Expected 51 numbered reward golden checks");
numberedTests.forEach((n, index) => assert.equal(n, index + 1, "Non-sequential golden check"));
for (const example of ["85 XP / 17 C", "145 XP / 29 C", "175 XP/35 C", "-13 XP/-3 C", "required"]) {
  assert(contract.includes(example), "Missing exact v3.1 invariant: " + example);
}
const art = readFileSync("docs/rebuild/asset-manifest.md", "utf8");
const rows = art.split("\n").filter((line) => line.startsWith("| ") && line.includes("public/assets/rpg/"));
assert.equal(rows.length, 13, "Expected 13 pinned original 3D art entries");
assert(rows.every((line) => line.includes("github.com/microsoft/fluentui-emoji/blob/1ffb34c752ecf5d402f04cfb4b392c77f57c54bc")), "Unpinned art source");
const selection = readFileSync("docs/rebuild/component-source-map.md", "utf8");
for (const source of ["satnaing/shadcn-admin", "ln-dev7/circle", "vmnog/calendarcn", "DuarteSantos8/openGym"]) {
  assert(selection.includes(source), "Missing pinned candidate " + source);
}
const agent = readFileSync("AGENTS.md", "utf8");
assert(agent.includes("PR 00") && agent.includes("PR 07"), "Missing phase and reward gates");
console.log("PASS PR 00: source catalog, 13 genuine image paths, 51 v3.1 golden test IDs, rebuild and skill contracts");
