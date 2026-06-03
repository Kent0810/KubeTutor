---
title: "Git Internals & Reflog"
order: 4
objectives:
  - "Understand Git's object model: blobs, trees, commits, and tags."
  - "Use plumbing commands to inspect objects directly."
  - "Navigate and use the reflog to recover lost commits."
  - "Understand how references and packed-refs work."
  - "Optimise repository size with gc and filter-repo."
tryIt: "After making a commit, run `git cat-file -p HEAD` to inspect the commit object, then follow the tree SHA to see the file blobs. Use `git reflog` to find the SHA of a commit you previously reset away."
takeaways:
  - "Everything in Git is a content-addressed object stored by its SHA-1 hash — understanding this demystifies nearly every Git command."
  - "The reflog is your safety net — it records every move HEAD has made and lets you recover work that looks lost."
  - "Plumbing commands are stable and script-friendly; porcelain commands are user-friendly but change between versions."
  - "Large binary files bloat Git history permanently — use Git LFS or filter-repo to remove them."
  - "Tags are just refs — annotated tags store a tag object with metadata; lightweight tags point directly to a commit."
quiz:
  - text: "What type of Git object stores a directory listing mapping filenames to blob SHAs?"
    options:
      - "Commit"
      - "Blob"
      - "Tree"
      - "Tag"
    correctAnswer: 2
    explanation: "A tree object represents a directory snapshot. It contains entries pairing filenames with the SHA of the corresponding blob (file content) or another tree (subdirectory)."
  - text: "You ran `git reset --hard HEAD~2` and now need to recover the two commits you removed. Which command helps you find their SHAs?"
    options:
      - "git log"
      - "git status"
      - "git reflog"
      - "git diff HEAD~2"
    correctAnswer: 2
    explanation: "The reflog records every position HEAD has pointed to, even after a reset. Run `git reflog` to find the SHA of the lost commit, then `git checkout <sha>` or `git reset --hard <sha>` to restore it."
  - text: "What is the difference between a lightweight tag and an annotated tag?"
    options:
      - "Lightweight tags can be pushed to remotes; annotated tags cannot"
      - "Annotated tags store a tag object with author, date, and message; lightweight tags are just a ref pointing directly to a commit"
      - "Lightweight tags are faster to create but cannot be shared"
      - "There is no practical difference"
    correctAnswer: 1
    explanation: "An annotated tag creates a full tag object in the object store with tagger identity, date, and message. A lightweight tag is simply a named pointer to a commit SHA — essentially a branch that never moves."
---

Most developers treat Git as a black box of commands. Understanding the object model underneath turns Git from a mystery into a transparent, predictable system. It also gives you the mental model to recover from almost any mistake.

## The Git Object Model

Git stores everything as four types of objects in `.git/objects/`:

### Blob

A blob stores the raw content of a single file. Two files with identical content share one blob. No filename is stored — the tree handles that.

  # Inspect a blob
  git cat-file -p $(git hash-object README.md)

### Tree

A tree object represents a directory snapshot. It contains entries like:

  100644 blob a1b2c3d4...  README.md
  100644 blob e5f6a7b8...  package.json
  040000 tree c9d0e1f2...  src

  # Inspect the tree of the current commit
  git cat-file -p HEAD^{tree}

### Commit

A commit object records:
- The root tree SHA
- Parent commit SHA(s)
- Author and committer (name, email, timestamp)
- The commit message

  # Inspect the latest commit object
  git cat-file -p HEAD

  # Output example:
  # tree  f1e2d3c4...
  # parent a9b8c7d6...
  # author Jane Doe <jane@example.com> 1700000000 +0000
  # committer Jane Doe <jane@example.com> 1700000000 +0000
  #
  # feat: add user authentication endpoint

### Tag

Lightweight tags are refs. Annotated tags are full objects:

  # Inspect an annotated tag object
  git cat-file -p v1.0.0

## Plumbing vs Porcelain Commands

Git has two layers of commands:

| Layer      | Commands                                 | Stability |
|------------|------------------------------------------|-----------|
| Porcelain  | commit, merge, log, push, pull           | May change output format between versions |
| Plumbing   | cat-file, hash-object, update-ref, ls-tree | Stable, script-safe |

Use plumbing commands in scripts and CI pipelines:

  # Get the SHA of HEAD
  git rev-parse HEAD

  # Check if a ref exists
  git rev-parse --verify refs/heads/main

  # List all files tracked in HEAD
  git ls-tree -r --name-only HEAD

  # Hash a file without writing it
  git hash-object path/to/file

  # Low-level object inspection
  git cat-file -t <sha>    # type (blob, tree, commit, tag)
  git cat-file -s <sha>    # size in bytes
  git cat-file -p <sha>    # pretty-print content

## The Reflog: Your Safety Net

The reflog (reference log) records every time a ref (HEAD, branch pointer) changes. It is stored locally in `.git/logs/` and persists for 90 days by default.

  # Show the HEAD reflog
  git reflog

  # Example output:
  # abc1234 HEAD@{0}: reset: moving to HEAD~2
  # def5678 HEAD@{1}: commit: feat: add retry logic
  # ghi9012 HEAD@{2}: commit: fix: handle null response

  # Show reflog for a specific branch
  git reflog show main

  # Recover a commit lost after reset
  git reset --hard HEAD@{1}

  # Or just checkout the specific SHA
  git checkout def5678

  # Create a recovery branch
  git branch recovery def5678

**What reflog saves you from:**
- `git reset --hard` going too far
- Accidentally deleting a branch
- A rebasing session gone wrong
- Any operation that moves HEAD unexpectedly

## References and packed-refs

Refs are stored as files under `.git/refs/`:

  .git/refs/heads/main          ← local branch
  .git/refs/heads/feature/auth  ← local branch
  .git/refs/remotes/origin/main ← remote-tracking branch
  .git/refs/tags/v1.0.0         ← tag

When you have many refs, Git packs them into a single file for efficiency:

  cat .git/packed-refs

Git writes to this file automatically during `git gc`. Individual ref files take precedence over packed-refs.

## Inspecting the Object Store

  # Count objects
  git count-objects -vH

  # Verify the integrity of the object store
  git fsck

  # Find the largest objects in history
  git rev-list --objects --all \
    | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
    | grep blob \
    | sort -k3 -n -r \
    | head -20

## Optimising Repository Size

### git gc (garbage collection)

  # Manual garbage collection and packing
  git gc

  # Aggressive (slower, better compression)
  git gc --aggressive

Git runs gc automatically in the background, but manual runs can help after a large history rewrite.

### Removing Files from History

If a large binary or secret was accidentally committed:

  # Install git-filter-repo (recommended over git filter-branch)
  pip install git-filter-repo

  # Remove a file from all history
  git filter-repo --path secrets.env --invert-paths

  # After rewriting, force-push all branches
  git push origin --force --all

**Warning:** History rewriting changes all SHAs after the affected commit. All collaborators must re-clone or perform a complex rebase. Coordinate with the team and invalidate any cached CI artifacts.

### Git LFS (Large File Storage)

For repositories that legitimately contain large binary files:

  # Install Git LFS
  git lfs install

  # Track file patterns
  git lfs track "*.psd"
  git lfs track "*.mp4"
  git add .gitattributes

  # Normal git commands work transparently
  git add design.psd
  git commit -m "add hero design asset"
  git push

LFS stores the actual binary in a separate server and only puts a small pointer file in the Git history.

## Pro Tips

- `git verify-pack -v .git/objects/pack/*.idx | sort -k3 -n -r | head` quickly identifies the largest packed objects.
- After a hard reset or accidental branch deletion, always try `git reflog` before panicking — the data is almost certainly still there.
- `git replace` can substitute one object for another without rewriting history, useful for connecting truncated repo segments.
- Run `git fsck --unreachable` occasionally on long-lived repos to check for data integrity issues.
