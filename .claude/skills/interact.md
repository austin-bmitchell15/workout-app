# Skill: interact
# Trigger: Before running any build/test/lint/run command
# Purpose: Ensure commands run safely in a non-interactive shell

## Pre-Command Checklist

Before executing any command, verify:
- [ ] Using **Yarn** (not npm or bun)
- [ ] No heredoc syntax (`<<EOF`) — write files with Write tool instead
- [ ] Git commands include `--no-pager`
- [ ] Long-running commands have `timeout 30` prefix
- [ ] Interactive flags avoided (`-i`, `--interactive`); use `-y`, `--yes`, `--non-interactive` instead
- [ ] Not running `git push`, deploy scripts, or `rm -rf` without explicit user confirmation

## Standard Commands

```bash
# Tests (run after every functional code change)
yarn test                                        # all tests
yarn test <path/to/file.test.ts>                 # single file
yarn test --testNamePattern="<pattern>"          # specific test
yarn test:coverage                               # with coverage

# Quality
yarn lint                                        # ESLint
yarn format                                      # Prettier
yarn typecheck                                   # tsc --noEmit
yarn check                                       # all three

# Git (always --no-pager)
git --no-pager diff
git --no-pager log --oneline -10
git --no-pager diff --cached --stat
```

## After Code Changes

1. Run tests: `yarn test` (or targeted file test)
2. If tests fail: diagnose and fix before reporting completion
3. If new functions added: write corresponding tests
4. If architecture changed: invoke `memorize` skill to update KB

## Test Failure Protocol

1. Read the exact error message
2. Check `kb/issues.md` for known issues
3. Check `kb/testing.md` for mock patterns
4. Fix the root cause — never suppress or skip failing tests
5. Re-run the test to confirm fix
