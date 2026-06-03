---
title: "Advanced Git Workflows"
order: 3
objectives:
  - "Use git stash to save and restore work-in-progress safely."
  - "Apply cherry-pick to port specific commits across branches."
  - "Use git bisect to identify regression-introducing commits."
  - "Set up Git hooks to enforce quality gates locally."
  - "Manage external dependencies with git submodules and subtrees."
tryIt: "Stash your current working tree changes with `git stash push -m 'wip: my change'`, switch to another branch, then restore with `git stash pop`. Inspect the stash list with `git stash list`."
takeaways:
  - "git stash is a stack — push to save, pop to restore. Always give stashes a descriptive message."
  - "Cherry-pick is surgical; use it sparingly — it duplicates commits and can create confusing histories."
  - "git bisect automates the binary search for regressions — know it and you will find bugs in minutes instead of hours."
  - "Hooks are scripts, not ceremonies — keep them fast so developers don't disable them."
  - "Prefer git subtree over git submodule for most mono-repo use cases; it keeps history simpler."
quiz:
  - text: "What does `git stash pop` do compared to `git stash apply`?"
    options:
      - "pop removes the stash entry after applying; apply leaves it in the stash list"
      - "apply removes the stash entry; pop leaves it"
      - "They are identical commands"
      - "pop only works on the most recent stash; apply can target any entry"
    correctAnswer: 0
    explanation: "`git stash pop` applies the stash and then drops it from the stash list. `git stash apply` applies it but keeps it stored so you can apply it again or to another branch."
  - text: "You need to apply a single bug-fix commit from a hotfix branch onto your release branch without merging everything else. Which command is most appropriate?"
    options:
      - "git merge --squash hotfix"
      - "git cherry-pick <commit-sha>"
      - "git rebase hotfix"
      - "git patch apply hotfix"
    correctAnswer: 1
    explanation: "`git cherry-pick <sha>` applies the changes introduced by that specific commit as a new commit on your current branch. It is the right tool when you need exactly one commit, not an entire branch."
  - text: "During `git bisect`, what do you type after testing a commit that does NOT have the bug?"
    options:
      - "git bisect skip"
      - "git bisect bad"
      - "git bisect good"
      - "git bisect pass"
    correctAnswer: 2
    explanation: "You tell Git whether each checked-out commit is `good` (no bug) or `bad` (has bug). Git narrows the search range by half each time until it pinpoints the first bad commit."
---

Once you master the basics, Git has a set of power tools that let you manage work-in-progress, debug regressions, surgically apply changes, and enforce team quality standards automatically.

## git stash: Shelving Work in Progress

Stash saves your dirty working tree so you can switch context without a premature commit.

  # Save everything (tracked + untracked)
  git stash push -u -m "wip: refactoring auth middleware"

  # List all stashes
  git stash list
  # stash@{0}: On feature/auth: wip: refactoring auth middleware
  # stash@{1}: On main: wip: docs update

  # Apply the most recent stash and keep it in the list
  git stash apply

  # Apply and remove from the stash list
  git stash pop

  # Apply a specific stash by index
  git stash apply stash@{1}

  # Create a branch from a stash (useful when the stash no longer applies cleanly)
  git stash branch feature/auth-refactor stash@{0}

  # Discard a stash
  git stash drop stash@{0}

  # Clear all stashes
  git stash clear

**When to stash:**
- Pulling in changes when you have uncommitted work
- Quickly switching to another branch for a hotfix
- Temporarily trying out an idea without committing

## git cherry-pick: Porting Specific Commits

Cherry-pick applies the diff of a single commit onto your current branch as a new commit.

  # Apply one commit
  git cherry-pick abc1234

  # Apply a range of commits
  git cherry-pick abc1234..def5678

  # Apply without auto-committing (useful to review the change first)
  git cherry-pick -n abc1234

  # If a conflict occurs during cherry-pick
  # 1. Resolve conflicts
  git add resolved-file.ts
  # 2. Continue
  git cherry-pick --continue
  # Or abort entirely
  git cherry-pick --abort

**Common use cases:**
- Backporting a security fix to older release branches
- Moving a commit made on the wrong branch
- Applying an upstream fix from a fork

**Caution:** Cherry-picking creates a new commit with a different SHA. If the source commit is later merged normally, Git will see two commits with the same diff and may produce a conflict.

## git bisect: Binary Search for Regressions

Bisect uses binary search to find the commit that introduced a bug. Given a known-good commit and a known-bad commit, Git checks out the midpoint and asks you to test it.

  # Start the bisect session
  git bisect start

  # Mark the current (broken) state as bad
  git bisect bad

  # Mark a known-good older commit
  git bisect good v2.1.0

  # Git checks out the midpoint commit
  # → Run your tests, then tell Git the result
  git bisect good    # no bug here
  git bisect bad     # bug is present

  # Repeat until Git announces: "abc1234 is the first bad commit"

  # End the session and return to HEAD
  git bisect reset

**Automated bisect with a test script:**

  git bisect start
  git bisect bad HEAD
  git bisect good v2.1.0
  git bisect run npm test
  # Git runs the script at each step and decides good/bad automatically

This can find the culprit commit in a history of 1,000 commits in just 10 steps (log₂ 1000 ≈ 10).

## Git Hooks: Automating Quality Gates

Hooks are scripts that Git runs at specific lifecycle events. They live in `.git/hooks/` and are not committed to the repository by default (use a tool like Husky to share them).

Common hook types:

  pre-commit      — runs before every commit; use for linting and formatting
  commit-msg      — validates the commit message format
  pre-push        — runs before pushing; use for running tests
  post-merge      — runs after a merge; use to install new dependencies

Example `pre-commit` hook:

  #!/bin/sh
  # .git/hooks/pre-commit
  npm run lint --silent
  if [ $? -ne 0 ]; then
    echo "Linting failed. Commit aborted."
    exit 1
  fi

Make it executable:
  chmod +x .git/hooks/pre-commit

**Sharing hooks with the team using Husky:**

  npm install --save-dev husky
  npx husky init
  echo "npm run lint" > .husky/pre-commit
  echo "npm test" > .husky/pre-push

Hooks are committed to the repository and automatically installed for every developer via `npm install`.

## git submodules and subtrees

### Submodules

Submodules let you embed one Git repository inside another.

  # Add a submodule
  git submodule add https://github.com/org/shared-lib.git libs/shared

  # Clone a repo with submodules
  git clone --recurse-submodules https://github.com/org/main-repo.git

  # Update all submodules to the committed SHAs
  git submodule update --init --recursive

  # Update submodules to the latest upstream commits
  git submodule update --remote

**Gotcha:** Submodules pin to a specific commit. If you update the submodule, you must commit the pointer change in the parent repo — this surprises many developers.

### Subtrees (simpler alternative)

  # Add a subtree (no extra metadata files)
  git subtree add --prefix=libs/shared https://github.com/org/shared-lib.git main --squash

  # Pull upstream changes
  git subtree pull --prefix=libs/shared https://github.com/org/shared-lib.git main --squash

  # Push changes back upstream
  git subtree push --prefix=libs/shared https://github.com/org/shared-lib.git main

Subtrees store the history inline without special metadata. They are easier for consumers of the parent repo but harder to push changes upstream.

## Pro Tips

- Run `git log --all --oneline --graph` after any complex operation to verify the history looks exactly as expected.
- Use `git reflog` as an emergency undo — it records every position HEAD has pointed to in the last 90 days.
- If a stash becomes impossible to pop cleanly, `git stash branch <name>` turns it into a branch where you can resolve conflicts properly.
- Keep pre-commit hooks under 3 seconds; slow hooks get bypassed with `--no-verify`.
