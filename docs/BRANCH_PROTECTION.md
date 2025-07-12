# Branch Protection Setup

This document explains how to configure GitHub branch protection rules to ensure code quality.

## Required GitHub Settings

Navigate to: **Settings → Branches → Add rule**

### Branch name pattern
- Pattern: `main`

### Protection Settings

✅ **Require a pull request before merging**
- ✅ Require approvals: 1
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from CODEOWNERS

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging

**Required status checks:**
- `quality-gate` (from PR Quality Check workflow)
- `lint` (🔍 Lint & Format Check)
- `typecheck` (🔍 TypeScript Check)
- `test` (🧪 Unit Tests)
- `build` (🏗 Build Application)
- `security` (🔒 Security Audit)

✅ **Require conversation resolution before merging**

✅ **Do not allow bypassing the above settings**

## Additional Recommendations

1. **Enable auto-merge** for PRs that pass all checks
2. **Set up CODEOWNERS** file for critical paths
3. **Enable branch protection for `develop` branch** with similar rules

## Automated Checks

Our CI/CD pipeline enforces:

1. **ESLint** - No linting errors allowed
2. **TypeScript** - No type errors allowed
3. **Tests** - All tests must pass
4. **Build** - Production build must succeed
5. **Security** - No high/critical vulnerabilities

## Local Enforcement

Pre-commit hooks prevent commits with:
- Linting errors
- Type errors
- Failing tests

Pre-push hooks prevent pushing with:
- Type errors
- Build failures

## Important Notes

⚠️ **NEVER use `--no-verify`** to bypass hooks
⚠️ **NEVER force push** to protected branches
⚠️ **Fix errors properly** instead of bypassing checks

These rules ensure that `main` branch always has:
- ✅ Clean, linted code
- ✅ Type-safe TypeScript
- ✅ Passing tests
- ✅ Successful builds
- ✅ No security vulnerabilities