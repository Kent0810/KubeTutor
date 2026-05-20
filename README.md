# KubeTutor

A learning platform for Docker and Kubernetes. Built with Next.js 16, PostgreSQL, Prisma, and Tailwind CSS.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Content authoring](#content-authoring)
  - [How content works](#how-content-works)
  - [Edit a lesson](#edit-a-lesson)
  - [Edit a lesson quiz](#edit-a-lesson-quiz)
  - [Edit a module quiz](#edit-a-module-quiz)
  - [Edit course or module metadata](#edit-course-or-module-metadata)
  - [Add a new lesson](#add-a-new-lesson)
  - [Add a new module](#add-a-new-module)
  - [Add a new course](#add-a-new-course)
  - [Push changes to the database](#push-changes-to-the-database)
- [Development](#development)
- [Database](#database)
- [Routes](#routes)
- [Roles](#roles)

---

## Tech stack

| Layer           | Technology                                            |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 16 (App Router)                               |
| Language        | TypeScript                                            |
| Styling         | Tailwind CSS v4                                       |
| ORM             | Prisma 7                                              |
| Database        | PostgreSQL                                            |
| Auth            | JWT via `jose`, passwords hashed with `bcryptjs`      |
| Content parsing | `gray-matter` (frontmatter), custom `lessonParser.ts` |

---

## Project structure

```
KubeTutor/
├── content/                   # All course content (edit these files!)
│   └── courses/
│       ├── docker-foundations/
│       │   ├── course.yml
│       │   ├── getting-started/
│       │   │   ├── module.yml
│       │   │   ├── quiz.yml          # Module-level quiz
│       │   │   ├── what-is-docker.md
│       │   │   ├── installing-docker.md
│       │   │   └── your-first-container.md
│       │   └── ... (9 more modules)
│       └── kubernetes-essentials/
│           ├── course.yml
│           └── ... (10 modules)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                # Reads content/ and seeds the DB
│   └── migrations/
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── admin/             # Admin CRUD UI
│   │   ├── api/               # REST API routes
│   │   ├── auth/              # Login / signup pages
│   │   ├── courses/           # Course, module, and lesson pages
│   │   ├── dashboard/
│   │   ├── flashcards/
│   │   ├── quizzes/
│   │   └── roadmap/
│   ├── components/
│   │   ├── LessonContent.tsx  # Renders parsed lesson blocks
│   │   ├── LessonQuiz.tsx     # Inline lesson quiz (client component)
│   │   ├── LessonToc.tsx      # Table of contents sidebar
│   │   └── ...
│   └── lib/
│       ├── auth.ts
│       ├── lessonParser.ts    # Parses raw lesson text into typed blocks
│       ├── courseTheme.ts
│       └── prisma.ts
└── .env                       # DATABASE_URL, JWT_SECRET
```

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (default: `localhost:5432`)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kubetutor
JWT_SECRET=your-secret-key
```

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Seed the database

```bash
npx tsx prisma/seed.ts
```

This reads all files in `content/` and populates courses, modules, lessons, quizzes, and flashcards.

### 5. Start the dev server

```bash
npm run dev
```

App is at [http://localhost:3000](http://localhost:3000).

---

## Content authoring

### How content works

All course content lives in `content/courses/`. The file system defines the structure:

```
content/courses/{course-slug}/{module-slug}/{lesson-slug}.md
```

After editing any file, run `npx tsx prisma/seed.ts` to push changes to the database. The seed script uses upserts — re-running it is always safe.

---

### Edit a lesson

Open the lesson's `.md` file and edit the body text below the `---` frontmatter block:

```
content/courses/docker-foundations/getting-started/what-is-docker.md
```

The body uses a lightweight custom format (not standard Markdown):

- **Plain paragraphs** — just text
- **Section headers** — a line ending with `:` followed by indented content
- **Code blocks** — a label line ending with `:` followed by lines indented with 2 spaces
- **Bullet lists** — lines starting with `- `
- **Callouts** — lines starting with `> `
- **Tables** — lines with `|` separators

---

### Edit a lesson quiz

Each lesson `.md` file has a `quiz:` section in its frontmatter:

```yaml
---
title: "What is Docker?"
order: 1
objectives:
  - ...
tryIt: "..."
takeaways:
  - ...
quiz:
  - text: "What is a container?"
    options:
      - "A virtual machine"
      - "A process isolated by namespaces and cgroups"
      - "A cloud server"
      - "A Docker image"
    correctAnswer: 1
    explanation: "Containers use Linux namespaces and cgroups, not full hardware virtualization."
---
```

- `correctAnswer` is the **0-based index** of the correct option
- `explanation` is shown to the user after they answer
- Each lesson should have 4 questions

---

### Edit a module quiz

Each module has a `quiz.yml` file:

```
content/courses/docker-foundations/getting-started/quiz.yml
```

```yaml
title: "Getting Started with Docker — Quiz"
questions:
  - text: "What command lists running containers?"
    options:
      - "docker list"
      - "docker ps"
      - "docker containers"
      - "docker show"
    correctAnswer: 1
    explanation: "`docker ps` lists running containers."
```

---

### Edit course or module metadata

**Course** — `content/courses/{course-slug}/course.yml`:

```yaml
title: "Docker Foundations"
description: "Learn everything you need to containerize applications with Docker."
order: 1
```

**Module** — `content/courses/{course-slug}/{module-slug}/module.yml`:

```yaml
title: "Getting Started with Docker"
description: "Install Docker, understand containers vs VMs, and run your first container."
order: 1
```

---

### Add a new lesson

1. Create a `.md` file in the module directory. The filename (without `.md`) becomes the slug:

   ```
   content/courses/docker-foundations/getting-started/my-new-lesson.md
   ```

2. Add frontmatter and body:

   ```markdown
   ---
   title: "My New Lesson"
   order: 4
   objectives:
     - "Learn something new"
   tryIt: "Try this thing."
   takeaways:
     - "Key fact from this lesson"
   quiz:
     - text: "Question?"
       options:
         - "Option A"
         - "Option B"
         - "Option C"
         - "Option D"
       correctAnswer: 0
       explanation: "Because A is correct."
   ---

   Lesson content goes here...
   ```

3. Re-seed: `npx tsx prisma/seed.ts`

---

### Add a new module

1. Create a directory with `module.yml`:

   ```
   content/courses/docker-foundations/my-new-module/module.yml
   ```

   ```yaml
   title: "My New Module"
   description: "What this module covers."
   order: 11
   ```

2. Optionally add a `quiz.yml` for the module quiz.

3. Add lesson `.md` files inside the directory.

4. Re-seed: `npx tsx prisma/seed.ts`

---

### Add a new course

1. Create a directory with `course.yml`:

   ```
   content/courses/my-new-course/course.yml
   ```

   ```yaml
   title: "My New Course"
   description: "Course description."
   order: 3
   ```

2. Add module directories and lesson files inside.

3. Re-seed: `npx tsx prisma/seed.ts`

---

### Push changes to the database

Any time you edit content files, run:

```bash
npx tsx prisma/seed.ts
```

Safe to run multiple times — uses upserts, will not duplicate data.

---

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Run a Prisma migration
npx prisma migrate dev --name describe-your-change

# Open Prisma Studio (DB browser)
npx prisma studio

# Re-generate Prisma client after schema changes
npx prisma generate
```

---

## Database

### Schema overview

| Model          | Description                                   |
| -------------- | --------------------------------------------- |
| `User`         | Accounts with `STUDENT` or `ADMIN` role       |
| `Course`       | Top-level course (e.g. Docker Foundations)    |
| `Module`       | Section within a course                       |
| `Lesson`       | Individual lesson within a module             |
| `Quiz`         | Belongs to either a `Module` or a `Lesson`    |
| `Question`     | Multiple-choice question belonging to a quiz  |
| `Flashcard`    | Standalone flashcard (not tied to a lesson)   |
| `UserProgress` | Tracks which lessons a user has completed     |
| `QuizResult`   | Stores a user's score for a module-level quiz |

### Reset and re-seed

```bash
# Drop and recreate all tables, then re-seed
npx prisma migrate reset
npx tsx prisma/seed.ts
```

---

## Routes

| Path                                        | Description                       |
| ------------------------------------------- | --------------------------------- |
| `/`                                         | Home page                         |
| `/courses`                                  | Course browser                    |
| `/courses/[slug]`                           | Course detail page                |
| `/courses/[slug]/[moduleSlug]`              | Module detail page                |
| `/courses/[slug]/[moduleSlug]/[lessonSlug]` | Lesson viewer (with inline quiz)  |
| `/quizzes`                                  | Module quiz list                  |
| `/quizzes/[id]`                             | Module quiz page                  |
| `/flashcards`                               | Flashcard deck                    |
| `/dashboard`                                | User progress dashboard           |
| `/roadmap`                                  | Learning roadmap / skill tree     |
| `/auth/login`                               | Login                             |
| `/auth/signup`                              | Sign up                           |
| `/admin`                                    | Admin panel (ADMIN role required) |

### API routes

| Method         | Path                       | Description                  |
| -------------- | -------------------------- | ---------------------------- |
| POST           | `/api/auth/signup`         | Create account               |
| POST           | `/api/auth/login`          | Log in, receive JWT cookie   |
| POST           | `/api/auth/logout`         | Clear session                |
| GET            | `/api/auth/me`             | Current user                 |
| GET            | `/api/courses`             | List all courses             |
| GET/PUT/DELETE | `/api/courses/[id]`        | Single course                |
| GET            | `/api/modules`             | List modules                 |
| GET/PUT/DELETE | `/api/modules/[id]`        | Single module                |
| GET            | `/api/lessons`             | List lessons                 |
| GET/PUT/DELETE | `/api/lessons/[id]`        | Single lesson                |
| GET            | `/api/quizzes`             | List quizzes                 |
| GET            | `/api/quizzes/[id]`        | Single quiz                  |
| POST           | `/api/quizzes/[id]/submit` | Submit quiz answers          |
| GET/POST       | `/api/flashcards`          | List / create flashcards     |
| GET/PUT/DELETE | `/api/flashcards/[id]`     | Single flashcard             |
| GET/POST       | `/api/progress`            | Get / update lesson progress |

---

## Roles

| Role                | Access                                                             |
| ------------------- | ------------------------------------------------------------------ |
| `STUDENT` (default) | All content, progress tracking, quizzes                            |
| `ADMIN`             | Everything above + `/admin` panel (create/edit/delete all content) |

To make a user an admin, update their record directly in the DB:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```
