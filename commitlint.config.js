/**
 * Commitlint Configuration
 * Enforces conventional commit messages for better changelog generation
 * and semantic versioning support.
 */

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Customize the allowed types for this financial software project
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Performance improvement
        "test", // Adding missing tests or correcting existing tests
        "build", // Changes that affect the build system or external dependencies
        "ci", // Changes to our CI configuration files and scripts
        "chore", // Other changes that don't modify src or test files
        "revert", // Reverts a previous commit
        "security", // Security-related changes (important for financial software)
        "config", // Configuration changes
        "deps", // Dependency updates
      ],
    ],
    // Ensure subject case is sentence-case
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    // Set max subject length
    "subject-max-length": [2, "always", 72],
    // Ensure subject is not empty
    "subject-empty": [2, "never"],
    // Ensure body max line length
    "body-max-line-length": [2, "always", 100],
    // Allow longer footers for breaking changes
    "footer-max-line-length": [0, "always", 100],
  },
  helpUrl:
    "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",
};
