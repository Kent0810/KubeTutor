import "dotenv/config";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type QuizQuestionSeed = {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
};

type LessonEnrichment = {
  objectives: string[];
  tryIt: string;
  takeaways: string[];
};

type CourseFileData = {
  title: string;
  description: string;
  order: number;
};

type ModuleFileData = {
  title: string;
  description: string;
  order: number;
};

type ModuleQuizFileData = {
  title: string;
  questions: QuizQuestionSeed[];
};

type LessonFrontmatter = LessonEnrichment & {
  title: string;
  order: number;
  quiz?: QuizQuestionSeed[];
};

type LessonSeed = {
  title: string;
  slug: string;
  order: number;
  content: string;
  enrichment?: LessonEnrichment;
  quiz?: QuizQuestionSeed[];
};

type ModuleSeed = {
  title: string;
  description: string;
  slug: string;
  order: number;
  lessons: LessonSeed[];
  quiz?: ModuleQuizFileData;
};

type CourseSeed = {
  title: string;
  description: string;
  slug: string;
  order: number;
  modules: ModuleSeed[];
};

function applyEnrichment(content: string, enrichment: LessonEnrichment | undefined): string {
  if (!enrichment) return content;
  const objectives = [
    "## Learning objectives",
    "",
    ...enrichment.objectives.map((objective) => `- ${objective}`),
  ].join("\n");
  const tryIt = `> Try it: ${enrichment.tryIt}`;
  const takeaways = [
    "## Key takeaways",
    "",
    ...enrichment.takeaways.map((takeaway) => `- ${takeaway}`),
  ].join("\n");
  return [objectives, content.trim(), tryIt, takeaways].join("\n\n");
}

function parseYamlFile<T>(filePath: string): T {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return matter(`---\n${fileContent}\n---`).data as T;
}

function readCourseSeeds(contentRoot: string): CourseSeed[] {
  const courseDirectories = fs
    .readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const courses = courseDirectories.map((courseSlug) => {
    const courseDir = path.join(contentRoot, courseSlug);
    const courseMeta = parseYamlFile<CourseFileData>(path.join(courseDir, "course.yml"));

    const modules = fs
      .readdirSync(courseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const moduleSlug = entry.name;
        const moduleDir = path.join(courseDir, moduleSlug);
        const moduleMeta = parseYamlFile<ModuleFileData>(path.join(moduleDir, "module.yml"));
        const moduleQuizPath = path.join(moduleDir, "quiz.yml");
        const moduleQuiz = fs.existsSync(moduleQuizPath)
          ? parseYamlFile<ModuleQuizFileData>(moduleQuizPath)
          : undefined;
        const lessons = fs
          .readdirSync(moduleDir, { withFileTypes: true })
          .filter((child) => child.isFile() && child.name.endsWith(".md"))
          .map((child) => {
            const lessonPath = path.join(moduleDir, child.name);
            const parsed = matter.read(lessonPath);
            const data = parsed.data as LessonFrontmatter;
            const content = parsed.content;
            return {
              title: data.title,
              slug: child.name.replace(/\.md$/, ""),
              order: data.order,
              content: content.startsWith("\n") ? content.slice(1) : content,
              enrichment: {
                objectives: data.objectives,
                tryIt: data.tryIt,
                takeaways: data.takeaways,
              },
              quiz: data.quiz,
            } satisfies LessonSeed;
          })
          .sort((left, right) => left.order - right.order);

        return {
          title: moduleMeta.title,
          description: moduleMeta.description,
          slug: moduleSlug,
          order: moduleMeta.order,
          lessons,
          quiz: moduleQuiz,
        } satisfies ModuleSeed;
      })
      .sort((left, right) => left.order - right.order);

    return {
      title: courseMeta.title,
      description: courseMeta.description,
      slug: courseSlug,
      order: courseMeta.order,
      modules,
    } satisfies CourseSeed;
  });

  return courses.sort((left, right) => left.order - right.order);
}

type SeededModuleQuiz = {
  moduleId: string;
  title: string;
  questions: QuizQuestionSeed[];
};

type SeededLessonQuiz = {
  lessonId: string;
  title: string;
  questions: QuizQuestionSeed[];
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function normalizeQuizQuestions(questions: QuizQuestionSeed[]) {
  return questions.map((question) => ({
    text: question.text,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation ?? null,
  }));
}

async function upsertQuizWithQuestions(quiz: SeededModuleQuiz | SeededLessonQuiz) {
  const relationFilter =
    "moduleId" in quiz ? { moduleId: quiz.moduleId } : { lessonId: quiz.lessonId };
  const existingQuiz = await prisma.quiz.findFirst({ where: relationFilter });

  if (existingQuiz) {
    await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });
    await prisma.quiz.update({
      where: { id: existingQuiz.id },
      data: {
        title: quiz.title,
        questions: { create: normalizeQuizQuestions(quiz.questions) },
      },
    });
    return false;
  }

  await prisma.quiz.create({
    data: {
      title: quiz.title,
      ...relationFilter,
      questions: { create: normalizeQuizQuestions(quiz.questions) },
    },
  });
  return true;
}

async function main() {
  console.log("Seeding database...");

  const contentRoot = path.join(process.cwd(), "content", "courses");
  const courseSeeds = readCourseSeeds(contentRoot);
  const moduleQuizSeeds: SeededModuleQuiz[] = [];
  const lessonQuizSeeds: SeededLessonQuiz[] = [];
  let moduleCount = 0;
  let lessonCount = 0;
  let enrichedCount = 0;

  for (const courseSeed of courseSeeds) {
    const course = await prisma.course.upsert({
      where: { slug: courseSeed.slug },
      update: {
        title: courseSeed.title,
        description: courseSeed.description,
        order: courseSeed.order,
      },
      create: {
        title: courseSeed.title,
        description: courseSeed.description,
        slug: courseSeed.slug,
        order: courseSeed.order,
      },
    });

    for (const moduleSeed of courseSeed.modules) {
      const seededModule = await prisma.module.upsert({
        where: { courseId_slug: { courseId: course.id, slug: moduleSeed.slug } },
        update: {
          title: moduleSeed.title,
          description: moduleSeed.description,
          order: moduleSeed.order,
        },
        create: {
          title: moduleSeed.title,
          description: moduleSeed.description,
          slug: moduleSeed.slug,
          order: moduleSeed.order,
          courseId: course.id,
        },
      });
      moduleCount++;

      if (moduleSeed.quiz?.questions?.length) {
        moduleQuizSeeds.push({
          moduleId: seededModule.id,
          title: moduleSeed.quiz.title,
          questions: moduleSeed.quiz.questions,
        });
      }

      for (const lessonSeed of moduleSeed.lessons) {
        const enrichedContent = applyEnrichment(lessonSeed.content, lessonSeed.enrichment);
        const seededLesson = await prisma.lesson.upsert({
          where: { moduleId_slug: { moduleId: seededModule.id, slug: lessonSeed.slug } },
          update: {
            title: lessonSeed.title,
            content: enrichedContent,
            order: lessonSeed.order,
          },
          create: {
            title: lessonSeed.title,
            slug: lessonSeed.slug,
            order: lessonSeed.order,
            content: enrichedContent,
            moduleId: seededModule.id,
          },
        });
        lessonCount++;
        if (lessonSeed.enrichment) enrichedCount++;
        if (lessonSeed.quiz?.length) {
          lessonQuizSeeds.push({
            lessonId: seededLesson.id,
            title: `${lessonSeed.title} — Quiz`,
            questions: lessonSeed.quiz,
          });
        }
      }
    }
  }

  const flashcards = [
    {
      question: "What is a Docker container?",
      answer:
        "A lightweight, isolated runtime environment that packages an application and its dependencies, sharing the host OS kernel.",
      topic: "Docker",
    },
    {
      question: "What is a Docker image?",
      answer:
        "A read-only template with instructions for creating a Docker container. Images are built from Dockerfiles.",
      topic: "Docker",
    },
    {
      question: "How do you list running containers?",
      answer: "Use `docker ps`. Add `-a` flag to also list stopped containers: `docker ps -a`.",
      topic: "Docker",
    },
    {
      question: "What does the `-d` flag do in `docker run`?",
      answer:
        "Runs the container in detached (background) mode, returning control to the terminal immediately.",
      topic: "Docker",
    },
    {
      question: "What is the purpose of EXPOSE in a Dockerfile?",
      answer:
        "Documents which port the containerized application listens on. It does NOT publish the port — use `-p` with `docker run` for that.",
      topic: "Docker",
    },
    {
      question: "What is Docker Compose?",
      answer:
        "A tool for defining and running multi-container Docker applications using a YAML file (docker-compose.yml).",
      topic: "Docker",
    },
    {
      question: "What is a Kubernetes Pod?",
      answer:
        "The smallest deployable unit in Kubernetes. A Pod wraps one or more containers that share the same network namespace and storage volumes.",
      topic: "Kubernetes",
    },
    {
      question: "What is a Kubernetes Deployment?",
      answer:
        "A controller that manages a set of identical Pod replicas, handling rolling updates, scaling, and rollbacks automatically.",
      topic: "Kubernetes",
    },
    {
      question: "What is a Kubernetes Service?",
      answer:
        "An abstraction that provides a stable network endpoint (DNS name and IP) for accessing a group of Pods, even as Pod IPs change.",
      topic: "Kubernetes",
    },
    {
      question: "What does `kubectl get pods` do?",
      answer: "Lists all Pods in the current namespace, showing their status, restarts, and age.",
      topic: "Kubernetes",
    },
    {
      question: "What is a ConfigMap?",
      answer:
        "A Kubernetes object that stores non-confidential configuration data as key-value pairs, decoupling config from container images.",
      topic: "Kubernetes",
    },
    {
      question: "What is the difference between ClusterIP and NodePort?",
      answer:
        "ClusterIP is only reachable inside the cluster. NodePort exposes the service on each node's IP at a static port (30000–32767), making it reachable from outside the cluster.",
      topic: "Kubernetes",
    },
  ];

  for (const card of flashcards) {
    const existing = await prisma.flashcard.findFirst({ where: { question: card.question } });
    if (!existing) await prisma.flashcard.create({ data: card });
  }

  let quizzesCreated = 0;
  for (const quiz of moduleQuizSeeds) {
    if (await upsertQuizWithQuestions(quiz)) quizzesCreated++;
  }
  for (const quiz of lessonQuizSeeds) {
    if (await upsertQuizWithQuestions(quiz)) quizzesCreated++;
  }

  const totalQuizzes = await prisma.quiz.count();

  console.log("✅ Seeding complete!");
  console.log(`  Courses: ${courseSeeds.length}`);
  console.log(`  Modules: ${moduleCount}`);
  console.log(`  Lessons: ${lessonCount} (${enrichedCount} enriched)`);
  console.log(`  Flashcards: ${flashcards.length}`);
  console.log(
    `  Quizzes: ${totalQuizzes} (${moduleQuizSeeds.length} module + ${lessonQuizSeeds.length} lesson, created this run: ${quizzesCreated})`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
