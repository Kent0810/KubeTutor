---
title: "Git Basics: Commits, Staging, and History"
order: 1
objectives:
  - "Initialize a repository and understand the three areas: working tree, index, and object store."
  - "Stage changes selectively with git add and commit with meaningful messages."
  - "Read and navigate git log history."
  - "Undo changes safely with git restore, git reset, and git revert."
  - "Configure Git identity and useful global settings."
tryIt: "Create a new directory, run `git init`, create three files, and make two commits. Then use `git log --oneline --graph` to visualise the history. Try `git show HEAD` to inspect the latest commit."
takeaways:
  - "Git stores snapshots, not diffs — every commit is a complete picture of the repo at that moment."
  - "The staging area is a feature, not a nuisance — use it to craft clean, atomic commits."
  - "Commit messages are love letters to your future self and teammates."
  - "`git revert` is safe for shared history; `git reset --hard` rewrites history and should only be used on private branches."
  - "Configure `git config --global` once and never think about it again."
quiz:
  - text: "What does `git add -p` do?"
    options:
      - "Adds all files in the current directory"
      - "Interactively stages hunks of changes, letting you review each one"
      - "Pushes commits to the remote"
      - "Creates a patch file from staged changes"
    correctAnswer: 1
    explanation: "`git add -p` (patch mode) walks you through each change hunk and lets you choose y (stage), n (skip), s (split), or e (edit). This is how professionals build clean atomic commits."
  - text: "Which command safely undoes the last commit but keeps the changes staged?"
    options:
      - "git reset --hard HEAD~1"
      - "git revert HEAD"
      - "git reset --soft HEAD~1"
      - "git restore --staged ."
    correctAnswer: 2
    explanation: "`git reset --soft HEAD~1` moves the branch pointer back one commit but leaves all changes in the staging area. `--hard` would delete the changes entirely."
  - text: "What is the git staging area (index)?"
    options:
      - "A remote server where commits are stored before pushing"
      - "An intermediate area where you prepare exactly what will go into the next commit"
      - "A backup copy of the last commit"
      - "The directory where Git stores its objects"
    correctAnswer: 1
    explanation: "The index (staging area) sits between your working tree and the commit history. It lets you decide precisely which changes belong in the next commit, independent of everything else you've edited."
---

Git is the version control system that underpins almost all modern software development. But most developers only use a fraction of its power. Understanding how Git actually works — not just memorizing commands — makes you dramatically more effective when things go wrong.

## How Git Stores Data

Git does not store diffs. It stores **snapshots**. Each commit is a complete picture of every file in the repository at that point in time, plus a pointer to the parent commit(s), a tree object, metadata, and a SHA-1 hash of all of this.

The three areas every Git user should understand:
- **Working tree** — the actual files you see and edit on disk
- **Index (staging area)** — a proposed next commit that you build deliberately
- **Object store** — the permanent, immutable history (.git/objects)

## Initial Setup

Configure your identity once per machine:

  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  git config --global core.editor "code --wait"
  git config --global init.defaultBranch main
  git config --global pull.rebase true

Useful aliases that senior engineers use daily:

  git config --global alias.lg "log --oneline --graph --decorate --all"
  git config --global alias.st "status -sb"
  git config --global alias.co "checkout"

## Starting a Repository

  # New repository
  mkdir myproject && cd myproject
  git init

  # Clone existing
  git clone https://github.com/org/repo.git

  # Clone with a specific branch
  git clone -b develop https://github.com/org/repo.git

## The Daily Workflow

  # Check what has changed
  git status
  git status -sb

  # See actual changes
  git diff              # unstaged changes
  git diff --staged     # staged changes

  # Stage specific files
  git add src/api.js
  git add src/

  # Stage interactively (recommended)
  git add -p

  # Commit with a message
  git commit -m "feat: add user authentication endpoint"

  # Stage all tracked changes and commit in one step
  git commit -am "fix: correct null check in login handler"

## Writing Good Commit Messages

The conventional commits format is widely adopted:

  type(scope): short summary in imperative mood

  Optional longer body explaining WHY the change was needed,
  not what was done (the diff shows what).

  Closes #123

Types: feat, fix, docs, style, refactor, test, chore, ci, perf

Examples:
  feat(auth): add Google OAuth sign-in
  fix(api): return 404 instead of 500 for missing resources
  refactor(db): extract query builder into separate module
  docs: update README with local dev setup instructions

## Reading History

  # Compact one-line log
  git log --oneline

  # Graph with branches
  git log --oneline --graph --decorate --all

  # Show what changed in a commit
  git show abc1234

  # Show who changed each line (blame)
  git blame src/auth.ts

  # Search commits by message
  git log --grep="authentication"

  # Search commits by code change
  git log -S "loginUser"

## Undoing Changes

  # Discard unstaged changes to a file
  git restore src/api.js

  # Unstage a file (keep changes in working tree)
  git restore --staged src/api.js

  # Amend the last commit (before pushing)
  git commit --amend

  # Undo last commit, keep changes staged
  git reset --soft HEAD~1

  # Undo last commit, keep changes unstaged
  git reset HEAD~1

  # DANGER: Undo last commit, discard all changes
  git reset --hard HEAD~1

  # Safe undo for shared history — creates a new reverting commit
  git revert HEAD

  # Revert a specific commit
  git revert abc1234

## Ignoring Files

Create a `.gitignore` in the repository root:

  # Dependencies
  node_modules/
  vendor/

  # Build output
  dist/
  build/
  *.egg-info/

  # Environment and secrets
  .env
  .env.local
  *.pem
  secrets.yml

  # Editor files
  .vscode/settings.json
  .idea/
  *.swp

Use `git check-ignore -v filename` to debug why a file is being ignored.

## Pro Tips

- Use `git stash` to shelve uncommitted work when you need to switch context fast.
- `git bisect` is a binary search through commits to find which commit introduced a bug.
- Run `git log --follow -p -- path/to/file` to see the full history of a specific file including renames.
- Keep commits small and focused — one logical change per commit makes code review and debugging much easier.
