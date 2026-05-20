"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ── Canvas ─────────────────────────────────────────────────────── */
const W = 1120;
const H = 1792;
const NW = 238;
const NH = 90;

/* ── Types ──────────────────────────────────────────────────────── */
type Track = "docker" | "k8s" | "production";
type Status = "done" | "available" | "locked";

interface SkillNode {
  id: string;
  label: string;
  sublabel: string;
  track: Track;
  cx: number;
  cy: number;
  why: string;
  purpose: string;
  topics: string[];
}

/* ── Node data ──────────────────────────────────────────────────── */
const NODES: SkillNode[] = [
  // Docker
  {
    id: "cli",
    label: "Docker CLI",
    sublabel: "run · exec · logs · inspect",
    track: "docker",
    cx: 560,
    cy: 98,
    why: "The CLI is your primary interface to Docker — without it you can't start, stop, debug, or inspect a single container.",
    purpose:
      "Manage the full container lifecycle, exec into running containers, tail real-time logs, and inspect metadata.",
    topics: [
      "Container lifecycle (run/stop/rm)",
      "docker exec -it for shell access",
      "docker logs --follow --tail N",
      "docker inspect for full metadata",
      "Detached vs foreground (--detach / -it)",
    ],
  },
  {
    id: "images",
    label: "Images & Registry",
    sublabel: "pull · tag · push · layers",
    track: "docker",
    cx: 308,
    cy: 266,
    why: "Images are the immutable blueprint for every container. Understanding layers is the key to fast builds and small artefacts.",
    purpose:
      "Push, pull, and tag releases across registries. Master layer caching to cut build times from minutes to seconds.",
    topics: [
      "docker pull / push / tag",
      "Understanding image layers & cache",
      "Docker Hub, GHCR, Amazon ECR",
      "docker image prune -a to reclaim space",
      "Image size best practices",
    ],
  },
  {
    id: "dockerfile",
    label: "Dockerfile",
    sublabel: "FROM · RUN · COPY · CMD",
    track: "docker",
    cx: 812,
    cy: 266,
    why: "Every image you use was built from a Dockerfile. Writing good ones is the single biggest lever on image size, security, and reproducibility.",
    purpose:
      "Define your app's entire environment — from base OS to runtime config — in a single versioned, auditable file.",
    topics: [
      "Choosing the right base image",
      "RUN, COPY, ADD, WORKDIR directives",
      "CMD vs ENTRYPOINT differences",
      ".dockerignore patterns",
      "ARG vs ENV variables",
    ],
  },
  {
    id: "volumes",
    label: "Volumes & Mounts",
    sublabel: "named · bind · tmpfs",
    track: "docker",
    cx: 168,
    cy: 448,
    why: "Containers are ephemeral by design. Without volumes, your database data disappears the moment the container is removed.",
    purpose:
      "Persist data beyond the container lifecycle, share files between containers, and mount host paths for fast local development.",
    topics: [
      "Named volumes (persistent data)",
      "Bind mounts (host path mapping)",
      "tmpfs in-memory mounts",
      "docker volume ls / inspect / rm",
      "Sharing data between containers",
    ],
  },
  {
    id: "networking",
    label: "Networking",
    sublabel: "bridge · host · custom",
    track: "docker",
    cx: 560,
    cy: 448,
    why: "Microservices only work if containers can discover and communicate with each other reliably and securely.",
    purpose:
      "Connect services across containers, control port exposure, and lay the foundation for Kubernetes service networking.",
    topics: [
      "Default bridge network behaviour",
      "Custom user-defined bridge networks",
      "Container-to-container DNS resolution",
      "Host & none network drivers",
      "Port publishing: -p host:container",
    ],
  },
  {
    id: "compose",
    label: "Docker Compose",
    sublabel: "services · healthcheck · profiles",
    track: "docker",
    cx: 952,
    cy: 448,
    why: "Managing multi-container apps with separate docker run commands is error-prone and not reproducible. Compose solves both problems.",
    purpose:
      "Define, start, and tear down complete application stacks — app, database, cache, reverse proxy — with a single command.",
    topics: [
      "docker-compose.yml syntax",
      "depends_on with healthcheck condition",
      "Environment files (.env)",
      "Profiles for optional services",
      "docker-compose.override.yml pattern",
    ],
  },
  {
    id: "multistage",
    label: "Multi-stage Builds",
    sublabel: "builder pattern · distroless",
    track: "docker",
    cx: 560,
    cy: 623,
    why: "Shipping your compiler, build tools, and dev dependencies to production is a security and size disaster. Multi-stage builds eliminate this.",
    purpose:
      "Produce minimal, hardened production images by completely separating the build environment from the runtime environment.",
    topics: [
      "Builder pattern: compile → minimal final",
      "COPY --from=<stage> the binary only",
      "Distroless base images (Google)",
      "scratch for near-zero-size images",
      "Reducing image attack surface",
    ],
  },
  // Kubernetes
  {
    id: "pods",
    label: "Pods",
    sublabel: "spec · probes · sidecars",
    track: "k8s",
    cx: 560,
    cy: 812,
    why: "Everything in Kubernetes runs as a Pod. You cannot deploy, debug, or monitor anything without understanding Pod internals and YAML.",
    purpose:
      "The atomic unit of Kubernetes — wraps one or more containers, defines resource limits, health checks, and storage attachments.",
    topics: [
      "Pod YAML spec & manifest structure",
      "Init containers for setup tasks",
      "Sidecar container pattern",
      "Liveness, readiness & startup probes",
      "CPU/memory requests & limits",
    ],
  },
  {
    id: "deployments",
    label: "Deployments",
    sublabel: "ReplicaSet · rolling · rollback",
    track: "k8s",
    cx: 294,
    cy: 980,
    why: "Manually managing Pod replicas doesn't scale and provides no rollback. Deployments give you declarative control with zero-downtime updates.",
    purpose:
      "Maintain a desired number of healthy Pod replicas with automatic rolling updates, instant rollback, and self-healing on failure.",
    topics: [
      "Deployment spec & label selectors",
      "Rolling update strategy",
      "kubectl rollout undo (instant rollback)",
      "maxSurge & maxUnavailable settings",
      "Pausing & resuming rollouts",
    ],
  },
  {
    id: "services",
    label: "Services & DNS",
    sublabel: "ClusterIP · NodePort · LB",
    track: "k8s",
    cx: 826,
    cy: 980,
    why: "Pods are ephemeral with constantly changing IPs. Services provide the stable network identity that makes inter-service communication reliable.",
    purpose:
      "Expose workloads with stable virtual IPs and DNS names — whether to other services inside the cluster or to external consumers.",
    topics: [
      "ClusterIP for cluster-internal traffic",
      "NodePort for external node access",
      "LoadBalancer via cloud provider",
      "Headless services (no virtual IP)",
      "CoreDNS service discovery",
    ],
  },
  {
    id: "configmaps",
    label: "ConfigMaps & Secrets",
    sublabel: "envFrom · volume mount",
    track: "k8s",
    cx: 168,
    cy: 1155,
    why: "Hard-coding configuration and credentials into images breaks portability and makes rotating secrets a rebuild-and-redeploy nightmare.",
    purpose:
      "Decouple environment-specific config from your image, inject it at runtime, and manage credentials separately from application code.",
    topics: [
      "ConfigMap from file / literal / dir",
      "envFrom in Pod spec",
      "Secret types (Opaque, TLS, docker)",
      "Volume-mounted configuration files",
      "Sealed Secrets for GitOps workflows",
    ],
  },
  {
    id: "ingress",
    label: "Ingress & TLS",
    sublabel: "NGINX · cert-manager · rules",
    track: "k8s",
    cx: 560,
    cy: 1155,
    why: "Creating a separate LoadBalancer per service is expensive and unmanageable. Ingress routes all external traffic through a single point.",
    purpose:
      "Route HTTP/HTTPS traffic to multiple internal services by hostname and path, with TLS termination and optional auth policies.",
    topics: [
      "Ingress resource & routing rules",
      "NGINX Ingress Controller setup",
      "TLS termination with K8s Secrets",
      "cert-manager + Let's Encrypt ACME",
      "Path-based and host-based routing",
    ],
  },
  {
    id: "storage",
    label: "Persistent Storage",
    sublabel: "PV · PVC · StorageClass",
    track: "k8s",
    cx: 952,
    cy: 1155,
    why: "Stateful workloads like databases need storage that survives Pod restarts and rescheduling across nodes — container storage alone cannot do this.",
    purpose:
      "Attach durable, independently-managed block or file storage to Pods with dynamic provisioning and access-mode control.",
    topics: [
      "PersistentVolume (PV) spec",
      "PersistentVolumeClaim (PVC) binding",
      "StorageClass & dynamic provisioning",
      "Access modes: RWO, ROX, RWX",
      "StatefulSet volumeClaimTemplates",
    ],
  },
  {
    id: "rbac",
    label: "RBAC",
    sublabel: "Role · ClusterRole · SA",
    track: "k8s",
    cx: 294,
    cy: 1330,
    why: "A compromised workload with cluster-admin access can destroy everything. Least-privilege access is non-negotiable in any production cluster.",
    purpose:
      "Control exactly who (user or service account) can perform which operations on which resources across namespaces.",
    topics: [
      "Role & ClusterRole definitions",
      "RoleBinding & ClusterRoleBinding",
      "ServiceAccounts for workloads",
      "Least-privilege principle",
      "kubectl auth can-i for access testing",
    ],
  },
  {
    id: "hpa",
    label: "Autoscaling (HPA)",
    sublabel: "CPU · memory · custom metrics",
    track: "k8s",
    cx: 826,
    cy: 1330,
    why: "Traffic spikes are unpredictable. Manual scaling means either over-provisioning (expensive) or under-provisioning (outages).",
    purpose:
      "Automatically scale Pod count up and down based on real CPU, memory, or custom metrics to match actual demand.",
    topics: [
      "HorizontalPodAutoscaler spec",
      "CPU & memory utilization targets",
      "Custom metrics via Prometheus Adapter",
      "KEDA for event-driven autoscaling",
      "Cluster Autoscaler for node scaling",
    ],
  },
  // Production
  {
    id: "helm",
    label: "Helm",
    sublabel: "charts · values · hooks",
    track: "production",
    cx: 560,
    cy: 1505,
    why: "Raw YAML files don't support parameterisation, versioning, or atomic rollback. Helm brings package-manager semantics to Kubernetes deployments.",
    purpose:
      "Package, version, template, and deploy applications as reusable charts with overridable values and lifecycle hooks.",
    topics: [
      "Chart directory structure",
      "values.yaml & --set / --values overrides",
      "helm install / upgrade / rollback",
      "Pre & post release lifecycle hooks",
      "Helmfile for multi-chart management",
    ],
  },
  {
    id: "cicd",
    label: "CI/CD & GitOps",
    sublabel: "Actions · ArgoCD · Flux",
    track: "production",
    cx: 217,
    cy: 1666,
    why: "Manual kubectl deploys are slow, error-prone, and leave no audit trail. GitOps makes the cluster state a direct function of your Git history.",
    purpose:
      "Automate build-test-deploy pipelines and keep cluster state continuously synchronised with a Git repository for full traceability.",
    topics: [
      "GitHub Actions Kubernetes deploy jobs",
      "ArgoCD app-of-apps pattern",
      "Flux CD & image update automation",
      "Environment promotion (dev → prod)",
      "Canary & blue-green with GitOps",
    ],
  },
  {
    id: "observability",
    label: "Observability",
    sublabel: "Prometheus · Grafana · Loki",
    track: "production",
    cx: 560,
    cy: 1666,
    why: "You cannot fix what you cannot see. Without metrics, logs, and traces you are flying blind when incidents happen in production.",
    purpose:
      "Collect, visualise, and alert on metrics, logs, and distributed traces so you can detect, diagnose, and resolve incidents fast.",
    topics: [
      "Prometheus scraping & PromQL basics",
      "Grafana dashboards & alert rules",
      "Loki log aggregation & LogQL",
      "Alertmanager routing & silences",
      "Distributed tracing with Jaeger / Tempo",
    ],
  },
  {
    id: "security",
    label: "Security Hardening",
    sublabel: "PSA · NetworkPolicy · OPA",
    track: "production",
    cx: 903,
    cy: 1666,
    why: "Default Kubernetes clusters are intentionally permissive. Without hardening, a single compromised Pod can pivot across the entire cluster.",
    purpose:
      "Enforce least-privilege at network, runtime, and image levels using admission policies, NetworkPolicies, and continuous scanning.",
    topics: [
      "Pod Security Admission (PSA) levels",
      "NetworkPolicy ingress/egress rules",
      "OPA / Gatekeeper admission policies",
      "Image vulnerability scanning (Trivy)",
      "Runtime threat detection with Falco",
    ],
  },
];

const EDGES: readonly [string, string][] = [
  ["cli", "images"],
  ["cli", "dockerfile"],
  ["images", "volumes"],
  ["images", "networking"],
  ["dockerfile", "networking"],
  ["dockerfile", "compose"],
  ["volumes", "multistage"],
  ["networking", "multistage"],
  ["compose", "multistage"],
  ["multistage", "pods"],
  ["pods", "deployments"],
  ["pods", "services"],
  ["deployments", "configmaps"],
  ["deployments", "ingress"],
  ["services", "ingress"],
  ["services", "storage"],
  ["configmaps", "rbac"],
  ["ingress", "rbac"],
  ["ingress", "hpa"],
  ["storage", "hpa"],
  ["rbac", "helm"],
  ["hpa", "helm"],
  ["helm", "cicd"],
  ["helm", "observability"],
  ["helm", "security"],
];

const PREREQ_MAP = new Map<string, string[]>();
NODES.forEach((n) => PREREQ_MAP.set(n.id, []));
EDGES.forEach(([f, t]) => PREREQ_MAP.get(t)!.push(f));
const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));
const TOTAL = NODES.length;

/* ── Course links ───────────────────────────────────────────────── */
const COURSE_HREF: Record<string, string> = {
  cli: "/courses/docker-foundations",
  images: "/courses/docker-foundations",
  dockerfile: "/courses/docker-foundations",
  volumes: "/courses/docker-foundations",
  networking: "/courses/docker-foundations",
  compose: "/courses/docker-foundations",
  multistage: "/courses/docker-foundations",
  pods: "/courses/kubernetes-essentials",
  deployments: "/courses/kubernetes-essentials",
  services: "/courses/kubernetes-essentials",
  configmaps: "/courses/kubernetes-essentials",
  ingress: "/courses/kubernetes-essentials",
  storage: "/courses/kubernetes-essentials",
  rbac: "/courses/kubernetes-essentials",
  hpa: "/courses/kubernetes-essentials",
  helm: "/courses",
  cicd: "/courses",
  observability: "/courses",
  security: "/courses",
};

/* ── Colours ────────────────────────────────────────────────────── */
const NODE_STYLE: Record<
  Track,
  { grad: string; glow: string; border: string; line: string; sectionColor: string }
> = {
  docker: {
    grad: "linear-gradient(135deg,#22D3EE,#2563EB)",
    glow: "node-glow-docker",
    border: "#2563EB",
    line: "#2563EB",
    sectionColor: "#2563EB",
  },
  k8s: {
    grad: "linear-gradient(135deg,#A855F7,#6D28D9)",
    glow: "node-glow-k8s",
    border: "#7C3AED",
    line: "#7C3AED",
    sectionColor: "#7C3AED",
  },
  production: {
    grad: "linear-gradient(135deg,#10B981,#059669)",
    glow: "node-glow-production",
    border: "#059669",
    line: "#059669",
    sectionColor: "#059669",
  },
};
const DONE_STYLE = {
  grad: "linear-gradient(135deg,#F59E0B,#EF4444)",
  glow: "node-glow-done",
  border: "#F59E0B",
};

/* ── Helpers ────────────────────────────────────────────────────── */
function getStatus(id: string, completed: Set<string>): Status {
  if (completed.has(id)) return "done";
  return "available";
}

function edgeStroke(fromId: string, toId: string, completed: Set<string>) {
  if (completed.has(fromId) && completed.has(toId))
    return { color: "#F59E0B", width: 3, opacity: 1 };
  if (completed.has(fromId))
    return { color: NODE_STYLE[NODE_MAP.get(fromId)!.track].line, width: 2.5, opacity: 0.8 };
  return { color: "#CBD5E1", width: 1.5, opacity: 1 };
}

/* ── Modal ──────────────────────────────────────────────────────── */
function Modal({
  node,
  status,
  completed,
  onToggle,
  onClose,
  onPrev,
  onNext,
  position,
}: {
  node: SkillNode;
  status: Status;
  completed: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  position: { current: number; total: number };
}) {
  const missing = (PREREQ_MAP.get(node.id) ?? []).filter((p) => !completed.has(p));
  const style = NODE_STYLE[node.track];
  const trackLabel: Record<Track, string> = {
    docker: "🐳 Docker",
    k8s: "☸️ Kubernetes",
    production: "🚀 Production",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border bg-white shadow-2xl"
        style={{ borderColor: style.border + "55" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient accent bar */}
        <div
          className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl"
          style={{ background: style.grad }}
        />

        {/* Header row */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ background: style.border + "18", color: style.border }}
          >
            {trackLabel[node.track]}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {position.current} / {position.total}
            </span>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pt-2 pb-0">
          <h3 className="text-xl font-bold text-slate-900">{node.label}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{node.sublabel}</p>
        </div>

        <div className="mt-4 px-6">
          {status === "done" && (
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
              ⭐ Mastered
            </span>
          )}
          {status === "available" && (
            <span
              className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: style.border + "18", color: style.border }}
            >
              ✦ Ready to learn
            </span>
          )}
          {status === "locked" && (
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-400">
              🔒 Locked
            </span>
          )}
        </div>

        {status === "locked" && missing.length > 0 && (
          <div className="mx-6 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold tracking-wide text-amber-700 uppercase">
              Complete first:
            </p>
            <ul className="mt-2 space-y-1">
              {missing.map((pid) => (
                <li key={pid} className="flex items-center gap-2 text-sm text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {NODE_MAP.get(pid)?.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why & Purpose */}
        <div className="mt-4 space-y-3 px-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1.5 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Why learn this
            </p>
            <p className="text-sm leading-6 text-slate-700">{node.why}</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: style.border + "0d", border: `1px solid ${style.border}33` }}
          >
            <p
              className="mb-1.5 text-xs font-bold tracking-wide uppercase"
              style={{ color: style.border }}
            >
              What it enables
            </p>
            <p className="text-sm leading-6 text-slate-700">{node.purpose}</p>
          </div>
        </div>

        <div className="mt-4 px-6">
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Topics covered</p>
          <ul className="mt-2 space-y-1.5">
            {node.topics.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: style.border }}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {status !== "locked" ? (
          <div className="mt-5 flex gap-3 px-6">
            <button
              onClick={() => onToggle(node.id)}
              className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
              style={{ background: status === "done" ? "#94A3B8" : style.grad }}
            >
              {status === "done" ? "✕  Mark as not learned" : "✓  Mark as learned"}
            </button>
            <Link
              href={COURSE_HREF[node.id] ?? "/courses"}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-bold transition hover:shadow-md active:scale-95"
              style={{ borderColor: style.border, color: style.border }}
            >
              Go to Lesson
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="mt-5 px-6">
            <Link
              href={COURSE_HREF[node.id] ?? "/courses"}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-bold transition hover:shadow-md"
              style={{ borderColor: style.border, color: style.border }}
            >
              Preview Lesson
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            onClick={onPrev ?? undefined}
            disabled={!onPrev}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition enabled:text-slate-600 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <span className="text-xs text-slate-400">← → to navigate · Esc to close</span>
          <button
            onClick={onNext ?? undefined}
            disabled={!onNext}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition enabled:text-slate-600 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Next
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function SkillTree() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kubetutor-skill-tree");
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  // Keyboard navigation
  const selectedIndex = selected ? NODES.findIndex((n) => n.id === selected) : -1;
  const prevId = selectedIndex > 0 ? NODES[selectedIndex - 1].id : null;
  const nextId = selectedIndex < NODES.length - 1 ? NODES[selectedIndex + 1].id : null;

  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (nextId) setSelected(nextId);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (prevId) setSelected(prevId);
      } else if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, prevId, nextId]);

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("kubetutor-skill-tree", JSON.stringify([...next]));
      return next;
    });
  }

  const doneCount = completed.size;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const selectedNode = selected ? NODE_MAP.get(selected) : null;
  const selectedStatus = selected ? getStatus(selected, completed) : "locked";

  const trackStats = [
    { track: "docker" as Track, icon: "🐳", label: "Docker", color: "#2563EB" },
    { track: "k8s" as Track, icon: "☸️", label: "Kubernetes", color: "#7C3AED" },
    { track: "production" as Track, icon: "🚀", label: "Production", color: "#059669" },
  ].map(({ track, icon, label, color }) => {
    const nodes = NODES.filter((n) => n.track === track);
    const done = nodes.filter((n) => completed.has(n.id)).length;
    return { track, icon, label, color, total: nodes.length, done };
  });

  return (
    <>
      {/* Overall progress */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#2563EB,#7C3AED,#059669)",
            }}
          />
        </div>
        <span className="shrink-0 text-sm font-bold text-slate-700">
          {doneCount} / {TOTAL} mastered
        </span>
        {doneCount > 0 && (
          <button
            onClick={() => {
              setCompleted(new Set());
              localStorage.removeItem("kubetutor-skill-tree");
            }}
            className="shrink-0 text-xs text-slate-400 hover:text-slate-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Per-track progress */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {trackStats.map(({ icon, label, color, total: tTotal, done }) => {
          const tPct = tTotal > 0 ? Math.round((done / tTotal) * 100) : 0;
          return (
            <div
              key={label}
              className="flex flex-col gap-1.5 rounded-2xl border px-3 py-3"
              style={{ borderColor: color + "33", background: color + "08" }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-xs font-bold" style={{ color }}>
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {done}/{tTotal}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${tPct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap justify-center gap-4 text-xs font-semibold">
        {[
          { color: "#2563EB", label: "Docker" },
          { color: "#7C3AED", label: "Kubernetes" },
          { color: "#059669", label: "Production" },
          { color: "#F59E0B", label: "Mastered ⭐" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-slate-500">
            <span
              className="inline-block h-3 w-3 rounded-full border"
              style={{ background: color, borderColor: color }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 shadow-inner">
        <div className="relative mx-auto" style={{ width: W, height: H }}>
          {/* Subtle dot-grid */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* SVG edges + labels */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
          >
            <defs>
              <filter id="edge-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Section separator lines */}
            <line
              x1={70}
              y1={717}
              x2={1050}
              y2={717}
              stroke="#CBD5E1"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <line
              x1={70}
              y1={1431}
              x2={1050}
              y2={1431}
              stroke="#CBD5E1"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />

            {/* Section labels */}
            {[
              { y: 39, color: "#2563EB", text: "🐳  DOCKER  TRACK" },
              { y: 750, color: "#7C3AED", text: "☸️  KUBERNETES  TRACK" },
              { y: 1464, color: "#059669", text: "🚀  PRODUCTION  TRACK" },
            ].map(({ y, color, text }) => (
              <text
                key={text}
                x={W / 2}
                y={y}
                textAnchor="middle"
                fontSize={18}
                fontWeight={800}
                letterSpacing={3}
                fill={color}
                fontFamily="ui-sans-serif,system-ui,sans-serif"
              >
                {text}
              </text>
            ))}

            {/* Edges */}
            {EDGES.map(([fId, tId]) => {
              const f = NODE_MAP.get(fId)!;
              const t = NODE_MAP.get(tId)!;
              const { color, width, opacity } = edgeStroke(fId, tId, completed);
              const x1 = f.cx,
                y1 = f.cy + NH / 2;
              const x2 = t.cx,
                y2 = t.cy - NH / 2;
              const isDone = completed.has(fId) && completed.has(tId);
              return (
                <path
                  key={`${fId}-${tId}`}
                  d={`M ${x1} ${y1} C ${x1} ${y1 + 53}, ${x2} ${y2 - 53}, ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={width}
                  strokeLinecap="round"
                  opacity={opacity}
                  filter={isDone ? "url(#edge-glow)" : undefined}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {NODES.map((node) => {
            const status = getStatus(node.id, completed);
            const track = NODE_STYLE[node.track];
            const isDone = status === "done";

            const nodeStyle: React.CSSProperties = isDone
              ? {
                  background: DONE_STYLE.grad,
                  borderColor: DONE_STYLE.border,
                  color: "#fff",
                  cursor: "pointer",
                }
              : {
                  background: track.grad,
                  borderColor: track.border,
                  color: "#fff",
                  cursor: "pointer",
                };

            return (
              <div
                key={node.id}
                data-node-id={node.id}
                className={`skill-node absolute flex flex-col items-center justify-center rounded-2xl border-2 select-none shadow-lg cursor-pointer ${!isDone ? track.glow : ""} ${isDone ? DONE_STYLE.glow : ""}`}
                style={{
                  left: node.cx - NW / 2,
                  top: node.cy - NH / 2,
                  width: NW,
                  height: NH,
                  ...nodeStyle,
                }}
                onClick={() => {
                  setSelected(node.id);
                  const el = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                }}
                title={node.label}
              >
                {isDone && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] ring-2 ring-white">
                    ⭐
                  </span>
                )}
                <span className="px-2 text-center text-[15px] leading-tight font-extrabold tracking-tight">
                  {node.label}
                </span>
                <span className="mt-0.5 px-2 text-center text-[12px] leading-tight opacity-80">
                  {node.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedNode && (
        <Modal
          node={selectedNode}
          status={selectedStatus}
          completed={completed}
          onToggle={toggle}
          onClose={() => setSelected(null)}
          onPrev={prevId ? () => setSelected(prevId) : null}
          onNext={nextId ? () => setSelected(nextId) : null}
          position={{ current: selectedIndex + 1, total: TOTAL }}
        />
      )}
    </>
  );
}
