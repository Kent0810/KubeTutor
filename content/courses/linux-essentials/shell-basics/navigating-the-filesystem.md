---
title: "Navigating the Linux Filesystem"
order: 1
objectives:
  - "Explain the Linux filesystem hierarchy and why key directories exist."
  - "Navigate the filesystem confidently using pwd, cd, ls, and tab completion."
  - "Create, copy, move, and delete files and directories."
  - "Use absolute vs relative paths correctly."
  - "Find files efficiently with find and locate."
tryIt: "Open a terminal and run `ls -la /` to list root directory contents. Identify at least 5 directories and explain what each stores based on the FHS standard."
takeaways:
  - "Everything in Linux is a file — devices, sockets, and pipes included."
  - "The FHS defines where things live; knowing it saves hours of debugging."
  - "`ls -lah` is your daily driver for listing files with human-readable sizes."
  - "Use `find` when you need to search by name, size, time, or type."
  - "Tab completion is not optional — it prevents typos and speeds up every workflow."
quiz:
  - text: "Which command shows your current working directory?"
    options:
      - "ls"
      - "pwd"
      - "cd"
      - "dir"
    correctAnswer: 1
    explanation: "`pwd` stands for Print Working Directory and outputs the full absolute path of your current location."
  - text: "What does the `-a` flag add to the `ls` command?"
    options:
      - "Sorts output alphabetically"
      - "Shows hidden files (those starting with a dot)"
      - "Lists files in reverse order"
      - "Displays file sizes in human-readable format"
    correctAnswer: 1
    explanation: "Files starting with `.` are hidden by default. The `-a` flag tells `ls` to include them in its output."
  - text: "How do you recursively delete a directory and all its contents?"
    options:
      - "rm mydir"
      - "del -r mydir"
      - "rm -rf mydir"
      - "rmdir mydir"
    correctAnswer: 2
    explanation: "`rm -rf` removes files and directories recursively and forcefully. Use with caution — there is no trash can on the command line."
  - text: "What is the difference between an absolute path and a relative path?"
    options:
      - "Absolute paths use forward slashes; relative paths use backslashes"
      - "Absolute paths start from root (/); relative paths start from the current directory"
      - "Absolute paths are shorter; relative paths are longer"
      - "There is no practical difference"
    correctAnswer: 1
    explanation: "An absolute path always starts with `/` and is the same regardless of your current location. A relative path is interpreted starting from wherever you currently are."
---

The Linux filesystem is a tree. Every file, device, socket, and directory hangs off a single root node represented by `/`. Understanding this tree and the conventions around it is the difference between confidently navigating any Linux system and getting lost in unfamiliar territory.

## The Filesystem Hierarchy Standard

The Filesystem Hierarchy Standard (FHS) defines what goes where on a Linux system. Senior engineers memorize this because it tells them exactly where logs, binaries, config files, and temporary data should live — even on systems they have never logged into before.

Key directories:
- `/bin` — essential binaries available to all users (ls, cp, mv, rm, bash)
- `/sbin` — system administration binaries (fsck, ip, iptables)
- `/etc` — all system-wide configuration files (never put binaries here)
- `/home` — user home directories; your personal files live under `/home/yourusername`
- `/root` — home directory for the root superuser
- `/var` — variable data: logs (`/var/log`), databases, mail queues, caches
- `/tmp` — temporary files wiped on reboot; never store persistent data here
- `/usr` — user-space programs, libraries, documentation
- `/opt` — optional third-party software packages
- `/proc` — virtual filesystem exposing kernel and process information
- `/dev` — device files (disks, terminals, random number generators)
- `/mnt` and `/media` — temporary and removable mount points

## Essential Navigation Commands

Your most-used commands for exploring the filesystem:

  # Where am I?
  pwd

  # List contents of current directory
  ls

  # Long format with hidden files and human-readable sizes
  ls -lah

  # Change to home directory
  cd ~

  # Change to previous directory (very useful)
  cd -

  # Go up one level
  cd ..

  # Go up two levels
  cd ../..

  # Change to an absolute path
  cd /var/log

  # Change to a relative path
  cd ../etc

## Listing Files Effectively

The `ls` command has many useful flags:

  # Show one file per line
  ls -1

  # Sort by modification time, newest first
  ls -lt

  # Sort by size, largest first
  ls -lS

  # Show file type indicators (/ for dir, * for executable)
  ls -F

  # List a specific directory without entering it
  ls -la /etc/nginx

## Creating and Managing Files

  # Create an empty file or update its timestamp
  touch app.log

  # Create a file with content
  echo "hello world" > greeting.txt

  # Append to a file
  echo "second line" >> greeting.txt

  # Create a directory
  mkdir myproject

  # Create nested directories in one command
  mkdir -p myproject/src/components

  # Copy a file
  cp source.txt destination.txt

  # Copy a directory recursively
  cp -r srcdir/ destdir/

  # Move or rename
  mv old-name.txt new-name.txt
  mv file.txt /tmp/file.txt

  # Delete a file
  rm file.txt

  # Delete a directory and all its contents (irreversible!)
  rm -rf mydir/

## Finding Files

The `find` command is one of the most powerful tools in your arsenal:

  # Find by name (case-sensitive)
  find /var/log -name "*.log"

  # Find by name (case-insensitive)
  find /etc -iname "nginx*"

  # Find files modified in the last 24 hours
  find /home -mtime -1

  # Find files larger than 100 MB
  find / -size +100M -type f

  # Find and execute a command on each result
  find /tmp -name "*.tmp" -exec rm {} \;

  # Find directories only
  find /usr -type d -name "bin"

For a faster but less real-time alternative, use `locate` after running `updatedb`:

  sudo updatedb
  locate nginx.conf

## Viewing File Contents

  # Print entire file
  cat /etc/os-release

  # View with paging (q to quit, / to search)
  less /var/log/syslog

  # Print first 20 lines
  head -n 20 /var/log/nginx/access.log

  # Print last 50 lines
  tail -n 50 /var/log/nginx/error.log

  # Follow a file in real time (Ctrl+C to stop)
  tail -f /var/log/app.log

## Understanding Hard Links and Symbolic Links

  # Create a symbolic link (like a shortcut)
  ln -s /usr/local/bin/python3.11 /usr/local/bin/python

  # Verify where a symlink points
  ls -la /usr/local/bin/python
  readlink -f /usr/local/bin/python

Hard links share the same inode. Symbolic links are separate files that reference a path. Use symlinks when you need to create aliases across different filesystem locations.

## Pro Tips

- Use `!!` to repeat the last command, and `!$` to reuse the last argument.
- Press Tab once for completion, twice to see all options when there are multiple matches.
- `Ctrl+R` reverse-searches your command history — one of the biggest productivity unlocks on the CLI.
- Prefer `/var/log` for investigating issues before reaching for `journalctl`.
- Never run `rm -rf /` — modern systems protect against it, but not against `rm -rf ./` with a typo in a script.
