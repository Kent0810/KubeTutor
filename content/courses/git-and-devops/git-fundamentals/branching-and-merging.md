---
title: "Branching, Merging & Collaboration"
order: 2
objectives:
  - "Create, switch, and delete branches confidently."
  - "Merge branches and resolve conflicts."
  - "Rebase branches to maintain a clean linear history."
  - "Work with remote repositories: fetch, pull, push, and pull requests."
  - "Understand common branching strategies: GitHub Flow, Gitflow, and trunk-based development."
tryIt: "Create a feature branch from main, make two commits, then merge it back with `--no-ff`. Inspect the graph with `git log --oneline --graph --all` before and after the merge."
takeaways:
  - "Branches are cheap pointers to commits — create them freely, merge or delete them often."
  - "Rebase rewrites history for cleanliness; merge preserves it for auditability. Know when to use each."
  - "Always pull before you push; stale local state is the source of most push rejections."
  - "Trunk-based development with short-lived feature branches is the industry standard for high-velocity teams."
  - "Never force-push to a shared branch without team agreement."
quiz:
  - text: "What is the difference between `git merge` and `git rebase`?"
    options:
      - "Merge creates a new branch; rebase deletes one"
      - "Merge preserves the full history with a merge commit; rebase rewrites commits onto a new base for a linear history"
      - "Rebase only works with remote branches; merge works locally"
      - "They produce identical results"
    correctAnswer: 1
    explanation: "Merge keeps the true history of when branches diverged and reconverged. Rebase replays your commits on top of the target branch, producing a cleaner linear log but rewriting the commit SHAs."
  - text: "Which command downloads remote changes without applying them to your working branch?"
    options:
      - "git pull"
      - "git clone"
      - "git fetch"
      - "git sync"
    correctAnswer: 2
    explanation: "`git fetch` updates your remote-tracking branches (like origin/main) without touching your working branch or local commits. `git pull` fetches and then merges (or rebases) in one step."
  - text: "In GitHub Flow, when is code deployed to production?"
    options:
      - "Only from long-lived release branches"
      - "After merging a pull request to main, which triggers deployment"
      - "From develop branches after a sprint review"
      - "Manually by the operations team each week"
    correctAnswer: 1
    explanation: "GitHub Flow keeps a single main branch that is always deployable. Every change goes through a feature branch and pull request, then merges directly to main and deploys immediately."
---

Git's branching model is its killer feature. Understanding how to branch, merge, and collaborate effectively separates developers who fight their VCS from those who use it as a productivity multiplier.

## Branches Are Just Pointers

A branch in Git is literally a file containing a 40-character SHA-1 hash. It points to a commit. Creating a branch is an O(1) operation with no copying involved — this is why Git branching is so fast compared to older systems.

HEAD is a special pointer that indicates your current location in the graph.

## Branch Operations

  # List branches
  git branch           # local
  git branch -r        # remote
  git branch -a        # all

  # Create and switch to new branch
  git checkout -b feature/user-auth
  # Modern equivalent
  git switch -c feature/user-auth

  # Switch to existing branch
  git switch main

  # Rename current branch
  git branch -m new-name

  # Delete a merged branch
  git branch -d feature/user-auth

  # Force delete unmerged branch
  git branch -D abandoned-experiment

## Merging

  # Merge a feature branch into main
  git switch main
  git merge feature/user-auth

  # No-fast-forward: always create a merge commit (preserves branch history)
  git merge --no-ff feature/user-auth

  # Squash all branch commits into one for a clean merge
  git merge --squash feature/user-auth
  git commit -m "feat: add user authentication"

## Resolving Merge Conflicts

When Git cannot auto-merge, it marks conflicts in the file:

  <<<<<<< HEAD
  const timeout = 5000;
  =======
  const timeout = 10000;
  >>>>>>> feature/retry-logic

Resolution steps:
1. Edit the file to keep the correct version (remove markers)
2. `git add resolved-file.ts`
3. `git commit`

Use a visual merge tool:
  git mergetool

Configure your preferred tool:
  git config --global merge.tool vscode

## Rebasing

Rebase replays your commits on top of another branch:

  # Rebase current branch onto main
  git rebase main

  # Interactive rebase — squash, reorder, or edit commits
  git rebase -i HEAD~4

Interactive rebase options for each commit:
  pick   — keep as-is
  reword — change commit message
  edit   — pause to amend
  squash — combine with previous commit
  fixup  — like squash but discard this message
  drop   — delete the commit

Abort a rebase that went wrong:
  git rebase --abort

Continue after resolving a conflict:
  git add resolved-file.ts
  git rebase --continue

## Working with Remotes

  # Add a remote
  git remote add origin https://github.com/org/repo.git

  # List remotes with URLs
  git remote -v

  # Download without applying
  git fetch origin

  # Update and rebase current branch
  git pull --rebase origin main

  # Push and set upstream tracking
  git push -u origin feature/user-auth

  # Push to existing tracked remote
  git push

  # Delete a remote branch
  git push origin --delete feature/old-feature

  # Force push (ONLY on your own private branches)
  git push --force-with-lease

## Branching Strategies

**GitHub Flow** (recommended for most teams):
- `main` is always deployable
- Feature work happens in short-lived branches
- Changes merge via pull request
- Deploy immediately after merge

**Gitflow** (suitable for release-based software):
- Long-lived `main` and `develop` branches
- Feature branches off `develop`
- Release branches for stabilization
- Hotfix branches off `main`
- Adds complexity; only justified for products with formal versioned releases

**Trunk-based development** (recommended for continuous delivery):
- Everyone commits to `main` (or trunk) frequently — at least once per day
- Feature flags hide incomplete work
- Fastest path to CI/CD nirvana

## Tagging Releases

  # Create a lightweight tag
  git tag v1.0.0

  # Create an annotated tag (recommended for releases)
  git tag -a v1.0.0 -m "Release 1.0.0 - initial public release"

  # Push tags to remote
  git push origin --tags

  # List tags
  git tag -l "v1.*"

## Pro Tips

- Use `git log --merges --first-parent main` to see only the merge commits on main — a clean history of features shipped.
- `git cherry-pick abc1234` applies a single commit from another branch without merging everything.
- Set up branch protection rules on GitHub/GitLab: require PR reviews and passing CI before merge.
- Delete branches immediately after merge. Stale branches are noise and confusion.
