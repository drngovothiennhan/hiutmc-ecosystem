const expected = "drngovothiennhan/hiutmc-ecosystem";
const actual = process.env.GITHUB_REPOSITORY;

if (actual && actual !== expected) {
  console.error(`Repository boundary violation: expected ${expected}, got ${actual}.`);
  process.exit(1);
}

console.log(`Repository boundary OK: ${actual || expected}.`);
