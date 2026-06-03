---
title: "Processes & Signals"
order: 1
objectives:
  - "Explain what a Linux process is and how it relates to a program."
  - "View running processes with ps, top, and htop."
  - "Send signals to processes using kill and pkill."
  - "Manage foreground and background jobs with fg, bg, and &."
  - "Understand zombie and orphan processes."
tryIt: "Run `sleep 120 &` to start a background process. Use `jobs` to see it, then `kill %1` to terminate it. Then run `top` and identify the process using the most CPU."
takeaways:
  - "Every process has a PID, PPID, UID, and state — these four fields explain most debugging scenarios."
  - "`ps aux` is your snapshot; `top` or `htop` is your live view."
  - "SIGTERM (15) asks politely; SIGKILL (9) cannot be caught or ignored."
  - "Append `&` to run a command in the background; `nohup` survives terminal close."
  - "Zombie processes are harmless but indicate the parent isn't calling wait()."
quiz:
  - text: "What signal does `kill` send by default when no signal is specified?"
    options:
      - "SIGKILL (9)"
      - "SIGTERM (15)"
      - "SIGHUP (1)"
      - "SIGSTOP (19)"
    correctAnswer: 1
    explanation: "By default, `kill <PID>` sends SIGTERM (15), which gives the process a chance to clean up before exiting. Use `kill -9` only when the process ignores SIGTERM."
  - text: "What does `ps aux` display?"
    options:
      - "Only processes owned by the current user"
      - "All running processes from all users with detailed information"
      - "Only kernel processes"
      - "Process memory maps"
    correctAnswer: 1
    explanation: "`a` shows processes from all users, `u` displays user-oriented format, `x` includes processes not attached to a terminal. Together they give a full system view."
  - text: "How do you run a command in the background so the terminal stays usable?"
    options:
      - "Prefix the command with bg:"
      - "Append & to the end of the command"
      - "Use the background keyword before the command"
      - "Press Ctrl+Z after starting the command"
    correctAnswer: 1
    explanation: "Appending `&` launches the command as a background job immediately. Ctrl+Z suspends a foreground process and moves it to the stopped state — you then need `bg` to resume it in the background."
---

A process is a running instance of a program. The Linux kernel tracks every process with a unique Process ID (PID), maintains a tree of parent-child relationships, and enforces resource limits using cgroups. Understanding how to observe and control processes is a fundamental sysadmin and DevOps skill.

## What Makes Up a Process

Every process has:
- **PID** — unique process identifier
- **PPID** — parent process ID (who spawned it)
- **UID/GID** — which user and group owns the process
- **State** — R (running), S (sleeping), D (uninterruptible sleep), Z (zombie), T (stopped)
- **Priority and nice value** — scheduling priority (-20 to 19, lower = higher priority)

## Viewing Processes

  # Snapshot of all processes with details
  ps aux

  # Process tree — see parent-child relationships
  ps auxf

  # Filter by process name
  ps aux | grep nginx

  # Real-time interactive view
  top

  # Better real-time view (if installed)
  htop

  # Find PID by name
  pgrep nginx

  # List process and all children
  pstree -p 1234

## Understanding ps aux Output

  USER       PID  %CPU %MEM    VSZ   RSS TTY  STAT START   TIME COMMAND
  root         1   0.0  0.1  22560  1024 ?    Ss   06:00   0:01 /sbin/init
  www-data  1532   1.2  2.4 456320 24576 ?    S    06:01   2:04 nginx: worker

Columns explained:
- `%CPU` — CPU usage averaged over the lifetime
- `%MEM` — percentage of physical RAM used
- `VSZ` — virtual memory size
- `RSS` — resident set size (actual RAM in use)
- `STAT` — process state

## Signals

Signals are software interrupts sent to processes. The most important ones:

  Signal    Number    Meaning
  SIGHUP      1       Reload config (hangup)
  SIGINT      2       Interrupt (Ctrl+C)
  SIGQUIT     3       Quit with core dump
  SIGKILL     9       Force kill — cannot be caught or ignored
  SIGTERM    15       Graceful termination request (default)
  SIGSTOP    19       Pause process — cannot be caught
  SIGCONT    18       Resume a stopped process

Sending signals:

  # Graceful shutdown by PID
  kill 1532

  # Force kill by PID
  kill -9 1532

  # Send signal by name to all matching processes
  pkill -TERM nginx

  # Reload nginx config without restart
  kill -HUP $(pgrep nginx)

  # Kill all processes matching a pattern
  pkill -f "python worker.py"

## Job Control

  # Run in background
  sleep 300 &

  # List background jobs
  jobs

  # Bring job 1 to foreground
  fg %1

  # Resume job 1 in background
  bg %1

  # Suspend current foreground job
  Ctrl+Z

  # Disown a job so it survives terminal close
  sleep 300 &
  disown %1

  # Run immune to hangup (terminal close)
  nohup python worker.py &

## Monitoring Resources

  # CPU, memory, disk activity live
  top

  # Memory usage
  free -h

  # Disk usage of mounted filesystems
  df -h

  # Disk usage of a directory tree
  du -sh /var/log/*

  # I/O statistics (requires sysstat)
  iostat -xz 1

  # Network connections and ports
  ss -tlnp

  # List open files for a process
  lsof -p 1532

## Zombie and Orphan Processes

A **zombie process** has finished execution but its parent hasn't collected its exit status with `wait()`. It shows as state `Z` in `ps`. Zombies consume a PID slot but minimal resources. They disappear when the parent collects the status or dies.

An **orphan process** is one whose parent has died. The init process (PID 1) automatically adopts orphans and cleans them up.

In containerized environments, this is why PID 1 inside containers matters — a process that doesn't reap children properly creates zombie buildup. Use an init process like `tini` or `dumb-init` in Docker containers for this reason.

## Pro Tips

- Use `kill -0 <PID>` to test if a process exists without sending a signal.
- `watch -n 1 'ps aux | grep nginx'` gives you a refreshing filtered view.
- `strace -p <PID>` traces system calls of a running process — powerful for debugging hangs.
- Set `ulimit -n 65536` in service startup to increase the open file descriptor limit for high-connection services.
