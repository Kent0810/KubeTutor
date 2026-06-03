---
title: "File Permissions & Ownership"
order: 2
objectives:
  - "Read and interpret the permission string from ls -l output."
  - "Change file permissions using chmod with both symbolic and octal notation."
  - "Change file ownership using chown and chgrp."
  - "Explain the special bits: setuid, setgid, and sticky bit."
  - "Apply the principle of least privilege when setting permissions."
tryIt: "Create a file, set it to 644, then try to execute it. Now set it to 755 and add a shebang line (`#!/bin/bash`). Run it. Observe the difference."
takeaways:
  - "Every file has read (r=4), write (w=2), execute (x=1) permissions for owner, group, and others."
  - "Use octal notation (755, 644) for scripting; symbolic (+x, u=rw) for clarity."
  - "Directories need execute permission to be entered — not just read."
  - "The sticky bit on `/tmp` prevents users from deleting each other's files."
  - "Always apply least privilege: give the minimum permissions needed."
quiz:
  - text: "What does the permission string `-rwxr-xr--` mean?"
    options:
      - "Owner: read/write/execute, Group: read/execute, Others: read only"
      - "Owner: read only, Group: read/write, Others: execute"
      - "Owner: all, Group: write/execute, Others: read/write"
      - "Everyone has full permissions"
    correctAnswer: 0
    explanation: "Breaking it down: `-` = regular file, `rwx` = owner can read/write/execute, `r-x` = group can read/execute, `r--` = others can only read."
  - text: "Which octal value gives owner read/write, and group and others read-only?"
    options:
      - "755"
      - "777"
      - "644"
      - "600"
    correctAnswer: 2
    explanation: "6 = r+w (4+2) for owner, 4 = r for group, 4 = r for others. 644 is the standard for regular files like config files and HTML."
  - text: "How do you make a script executable by everyone?"
    options:
      - "chmod 600 script.sh"
      - "chmod +x script.sh"
      - "chown +x script.sh"
      - "chmod -w script.sh"
    correctAnswer: 1
    explanation: "`chmod +x` adds the execute bit for owner, group, and others. It's the quickest way to make a script runnable."
---

Linux permissions are the foundation of multi-user security. Every file and directory carries an owner, a group, and three permission sets. Misunderstanding permissions is one of the most common sources of "permission denied" errors — and of unintentional security holes.

## Reading the Permission String

Run `ls -la` and you see output like:

  -rwxr-xr--  1  alice  developers  4096  Jun 1 10:00  deploy.sh
  drwxr-xr-x  2  root   root        4096  Jun 1 09:00  /etc/nginx

The permission string has 10 characters:
- Position 1: file type (`-` regular, `d` directory, `l` symlink, `b` block device)
- Positions 2-4: owner permissions (r, w, x or -)
- Positions 5-7: group permissions
- Positions 8-10: others (world) permissions

Permission meanings:
- `r` (read=4): read file contents; list directory contents
- `w` (write=2): modify file; create/delete files in directory
- `x` (execute=1): run file as program; enter (cd into) directory

## Changing Permissions with chmod

Symbolic notation (easier to read):

  # Add execute for owner
  chmod u+x script.sh

  # Remove write from group and others
  chmod go-w config.yml

  # Set exact permissions for all
  chmod u=rwx,g=rx,o=r deploy.sh

  # Recursively change a directory
  chmod -R 755 /var/www/html

Octal notation (faster for scripting):

  # 755: owner rwx, group rx, others rx — standard for executables and directories
  chmod 755 /usr/local/bin/mytool

  # 644: owner rw, group r, others r — standard for regular files
  chmod 644 /etc/app/config.yml

  # 600: owner rw only — good for private keys and secrets
  chmod 600 ~/.ssh/id_rsa

  # 700: owner rwx only — private directory
  chmod 700 ~/.ssh

## Octal Quick Reference

  7 = rwx (4+2+1)
  6 = rw- (4+2)
  5 = r-x (4+1)
  4 = r-- (4)
  0 = --- (nothing)

Common combinations:
  755 — executables, public directories
  644 — config files, web assets
  600 — SSH private keys, credential files
  400 — read-only sensitive files
  777 — avoid in production (gives world write access)

## Changing Ownership with chown

  # Change owner
  sudo chown alice file.txt

  # Change owner and group together
  sudo chown alice:developers file.txt

  # Recursively change a directory tree
  sudo chown -R www-data:www-data /var/www/html

  # Change only the group
  sudo chgrp developers /srv/shared/

  # Verify the result
  ls -la file.txt

## The Special Bits

**Setuid (SUID)**: Run the file with the owner's permissions, not the caller's.
  chmod u+s /usr/bin/passwd
  # Shows as -rwsr-xr-x

**Setgid (SGID)**: Files created inside a SGID directory inherit the directory's group.
  chmod g+s /srv/team-share/
  # Shows as drwxr-sr-x

**Sticky bit**: On directories (like /tmp), users can only delete their own files.
  chmod +t /tmp
  # Shows as drwxrwxrwt

View special bits in octal — they occupy a 4th leading digit:
  4755 = setuid + 755
  2755 = setgid + 755
  1777 = sticky + 777 (classic /tmp permissions)

## Viewing Effective Permissions

  # See numeric permissions
  stat -c "%a %n" filename

  # Check if you can read/write/execute a file
  test -r file && echo readable
  test -w file && echo writable
  test -x file && echo executable

  # Show current user and groups
  id

## The /etc/passwd and /etc/group Files

  # List all users
  cat /etc/passwd | cut -d: -f1

  # List all groups
  cat /etc/group

  # See which groups your user belongs to
  groups
  id

## Pro Tips

- Always use `chmod 600` for private keys and credentials. SSH will refuse to use a key with world-readable permissions.
- Use ACLs (`setfacl`, `getfacl`) when standard owner/group/other is not granular enough.
- In Docker containers, running as root is common but wrong — create a non-root user in your Dockerfile with specific UID/GID for security.
- The `umask` command controls default permissions for new files (default 022 means new files get 644).
