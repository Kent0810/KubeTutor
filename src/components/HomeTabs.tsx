"use client";

import { useState, useEffect, useRef } from "react";
import SkillTree from "./SkillTree";

/* ── Data ───────────────────────────────────────────────────────── */
const commonProblems = [
  // Kubernetes
  {
    icon: "🔄",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "CrashLoopBackOff",
    cause: "Container keeps crashing on startup — bad entrypoint, missing env var, or a failing health check.",
    fix: "kubectl logs <pod> --previous  •  kubectl describe pod <pod>",
  },
  {
    icon: "⏳",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "Pod Stuck in Pending",
    cause: "Scheduler can't place the pod — not enough CPU/memory or no node matches the selector/taint.",
    fix: "kubectl describe pod <pod> → read Events. Check kubectl get nodes for capacity.",
  },
  {
    icon: "🔌",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "Service Not Reachable",
    cause: "Selector mismatch between Service and Pod labels, wrong targetPort, or the pod isn't Ready.",
    fix: "kubectl get endpoints <svc> — if empty, label selectors don't match any running pod.",
  },
  {
    icon: "💥",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "OOMKilled",
    cause: "Container exceeded its memory limit; the kernel terminated it with signal 9.",
    fix: "kubectl top pod. Raise limits or profile memory leaks. Set requests ≤ limits.",
  },
  {
    icon: "🖼️",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "ImagePullBackOff",
    cause: "Kubelet can't pull the image — wrong tag, private registry, or network issue on the node.",
    fix: "Verify imagePullSecrets. Run crictl pull <image> on the node to test directly.",
  },
  {
    icon: "♾️",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "Pod Stuck in Terminating",
    cause: "Finalizers are blocking deletion, or the node is unreachable and the pod can't be evicted.",
    fix: "kubectl delete pod <pod> --grace-period=0 --force  or remove stuck finalizers manually.",
  },
  {
    icon: "🗂️",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "ConfigMap / Secret Not Found",
    cause: "Pod references a ConfigMap or Secret that doesn't exist or is in a different namespace.",
    fix: "kubectl get cm,secret -n <namespace>. Names are case-sensitive and namespace-scoped.",
  },
  {
    icon: "🌐",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "DNS Not Resolving in Pod",
    cause: "CoreDNS pod is unhealthy, or a NetworkPolicy is blocking traffic to kube-dns on port 53.",
    fix: "kubectl -n kube-system get pods -l k8s-app=kube-dns. Test with: kubectl run -it --rm debug --image=busybox -- nslookup kubernetes",
  },
  {
    icon: "🚫",
    tag: "Kubernetes",
    tagColor: "#7C3AED",
    title: "Init Container Failing",
    cause: "Init container exits non-zero — often a missing dep, wrong command, or network not ready yet.",
    fix: "kubectl logs <pod> -c <init-container-name>  to read its output directly.",
  },
  // Docker
  {
    icon: "🐳",
    tag: "Docker",
    tagColor: "#2563EB",
    title: "Image Pull / Not Found",
    cause: "Wrong tag, private registry not logged in, or a typo in the image name.",
    fix: "docker pull <image> locally first. Use imagePullSecrets for private registries.",
  },
  {
    icon: "🔒",
    tag: "Docker",
    tagColor: "#2563EB",
    title: "Permission Denied in Container",
    cause: "Process runs as root locally but a non-root USER is set in the Dockerfile.",
    fix: "RUN chown -R appuser:appuser /app after COPY, then USER appuser before CMD.",
  },
  {
    icon: "📦",
    tag: "Docker",
    tagColor: "#2563EB",
    title: "Build Cache Invalidated Unexpectedly",
    cause: "A COPY of frequently-changing files (package.json, .env) invalidates all subsequent layers.",
    fix: "Copy dependency files first, run install, then COPY the rest of the source. Order matters.",
  },
  {
    icon: "🔗",
    tag: "Docker",
    tagColor: "#2563EB",
    title: "Containers Can't Talk to Each Other",
    cause: "Containers are on different networks, or you're using container name that isn't the DNS alias.",
    fix: "Put both on a user-defined bridge network. Use the service name / container name as hostname.",
  },
  {
    icon: "💾",
    tag: "Docker",
    tagColor: "#2563EB",
    title: "Data Lost After Container Restart",
    cause: "Writing data to the container layer — it disappears when the container is removed.",
    fix: "Mount a named volume or bind mount: -v my-data:/app/data or volumes: in Compose.",
  },
  {
    icon: "🐢",
    tag: "Docker",
    tagColor: "#2563EB",
    title: "Extremely Slow Builds",
    cause: "No layer caching, huge build context sent every time, or rebuilding from scratch.",
    fix: "Add a .dockerignore. Structure Dockerfile so rarely-changing layers come first.",
  },
];

const tips = [
  {
    icon: "📖",
    grad: "from-cyan-500 to-blue-600",
    title: "kubectl explain anything",
    body: "Forgot a field name? kubectl explain deployment.spec.strategy gives you inline API docs — no browser needed.",
    detail: "`kubectl explain` reads directly from the cluster's live OpenAPI spec — it's always accurate for the exact version you're running, no docs tab needed.\n\nDrill into any field:\n  kubectl explain pod.spec.containers\n  kubectl explain pod.spec.containers.resources.limits\n\nList all fields recursively:\n  kubectl explain deployment.spec --recursive\n\nFind a specific field with grep:\n  kubectl explain pod.spec --recursive | grep -i probe\n\nWorks for every resource including custom CRDs. When you forget whether a field is `targetPort` or `target-port`, this is faster than any browser search.",
  },
  {
    icon: "🧹",
    grad: "from-violet-500 to-fuchsia-600",
    title: "Reclaim disk space fast",
    body: "docker system prune -af --volumes removes all stopped containers, dangling images, and unused volumes in one shot.",
    detail: "Docker accumulates gigabytes over time: stopped containers, dangling images from builds, unused networks, and anonymous volumes.\n\nThe nuclear option — removes everything not currently in use:\n  docker system prune -af --volumes\n\n  -a          also removes images not referenced by any container\n  -f          skip the confirmation prompt\n  --volumes   also removes unused volumes (⚠ potential data loss)\n\nSafer per-resource commands:\n  docker container prune      stopped containers only\n  docker image prune -a       all unused images\n  docker volume prune         unused volumes\n  docker network prune        unused networks\n\nCheck usage first:\n  docker system df\n\nRunning this monthly keeps CI runner disks from filling up silently.",
  },
  {
    icon: "🔭",
    grad: "from-sky-500 to-indigo-600",
    title: "Debug without exec",
    body: "kubectl port-forward pod/<pod> 8080:80 maps a pod port to localhost so you can curl it directly from your machine.",
    detail: "`kubectl port-forward` tunnels a cluster port to localhost — no Ingress, no LoadBalancer, no public exposure required.\n\nForward a specific pod:\n  kubectl port-forward pod/my-app-abc123 8080:80\n\nForward via a Service (picks a healthy backing pod):\n  kubectl port-forward svc/my-service 8080:80\n\nForward a Deployment:\n  kubectl port-forward deploy/my-app 8080:80\n\nThen test locally:\n  curl http://localhost:8080/health\n\nUse cases:\n• Debug a database without a public endpoint (postgres:5432)\n• Inspect a Prometheus or metrics endpoint that's internal-only\n• Test an API before writing an Ingress rule\n• Access a Redis or RabbitMQ management UI\n\nThe tunnel closes when you hit Ctrl+C. No cluster resources are modified.",
  },
  {
    icon: "📦",
    grad: "from-lime-500 to-emerald-600",
    title: "Shrink images with multi-stage builds",
    body: "Compile in a builder stage, COPY only the binary to a scratch or distroless final. Images go from GBs to MBs.",
    detail: "Multi-stage builds use multiple FROM instructions in one Dockerfile. Each stage is isolated — only what you explicitly COPY carries over to the next stage.\n\nExample — Go binary:\n  FROM golang:1.22 AS builder\n  WORKDIR /app\n  COPY . .\n  RUN go build -o server .\n\n  FROM scratch\n  COPY --from=builder /app/server /server\n  ENTRYPOINT [\"/server\"]\n\nResult: the 1 GB Go toolchain never ships to production. The final image is just your binary.\n\nCommon minimal final base images:\n  scratch          zero-byte base, for fully static binaries\n  distroless        no shell or package manager, has libc/SSL\n  alpine:3          ~5 MB, has a shell and apk\n\nThis is the single biggest lever you have on image size and attack surface.",
  },
  {
    icon: "⏪",
    grad: "from-orange-500 to-rose-600",
    title: "One-command rollback",
    body: "kubectl rollout undo deployment/<name> reverts to the previous ReplicaSet. Add --to-revision=N for a specific version.",
    detail: "Every deployment creates a new ReplicaSet revision. Kubernetes retains the previous ones (up to 10 by default) so rollback is instant.\n\nUndo the last deployment:\n  kubectl rollout undo deployment/my-app\n\nRoll back to a specific revision:\n  kubectl rollout undo deployment/my-app --to-revision=3\n\nCheck revision history:\n  kubectl rollout history deployment/my-app\n\nWatch rollback progress:\n  kubectl rollout status deployment/my-app\n\nHow it works: Kubernetes scales up the old ReplicaSet and scales down the current one using the same rolling-update mechanism — so rollbacks are also zero-downtime.\n\nTip: annotate revisions with change-cause for a better audit trail:\n  kubectl annotate deployment/my-app kubernetes.io/change-cause=\"fix: corrected env var\"",
  },
  {
    icon: "🏷️",
    grad: "from-yellow-400 to-orange-500",
    title: "Label everything",
    body: "Consistent labels (app, env, team) make get/delete/select queries trivial and are required for NetworkPolicies.",
    detail: "Labels are key-value pairs attached to any resource. They're cheap to set but everything depends on them — selectors, NetworkPolicies, Ingress routing, autoscalers, and monitoring all target labels.\n\nRecommended standard labels (Kubernetes well-known labels):\n  app.kubernetes.io/name: my-service\n  app.kubernetes.io/version: \"1.4.2\"\n  app.kubernetes.io/component: api\n  app.kubernetes.io/part-of: payments-platform\n  environment: production\n  team: platform\n\nWhy they matter:\n• Services select pods via label selectors\n• NetworkPolicies use labels to allow/deny traffic flows\n• kubectl get pods -l app=my-svc,env=prod filters instantly\n• HPA, PodDisruptionBudgets, and Affinity rules target labels\n• Prometheus ServiceMonitor scraping depends on labels\n\nAdd labels at resource creation time — retrofitting hundreds of resources is painful.",
  },
  {
    icon: "⚡",
    grad: "from-amber-400 to-yellow-500",
    title: "Use kubectl aliases",
    body: "alias k=kubectl, kgp='kubectl get pods', kl='kubectl logs -f'. Add them to .bashrc/.zshrc and save 100s of keystrokes per day.",
    detail: "kubectl is typed thousands of times per day. Aliases save hours per year and reduce typos significantly.\n\nAdd to ~/.bashrc or ~/.zshrc:\n  alias k='kubectl'\n  alias kgp='kubectl get pods'\n  alias kgpa='kubectl get pods -A'\n  alias kgs='kubectl get svc'\n  alias kgd='kubectl get deploy'\n  alias kga='kubectl get all'\n  alias kl='kubectl logs -f'\n  alias kx='kubectl exec -it'\n  alias kdp='kubectl describe pod'\n  alias kns='kubectl config set-context --current --namespace'\n\nReload: source ~/.zshrc\n\nFor fast context and namespace switching, install kubectx + kubens:\n  brew install kubectx\n  kubectx prod-cluster     # switch cluster\n  kubens kube-system       # switch default namespace\n\nPower tip: combine aliases with fzf for interactive fuzzy pod selection.",
  },
  {
    icon: "🧪",
    grad: "from-teal-500 to-cyan-600",
    title: "Dry-run before applying",
    body: "kubectl apply -f manifest.yaml --dry-run=client -o yaml previews the final object without touching the cluster.",
    detail: "Always preview changes before touching a live cluster.\n\nClient-side dry run (validates YAML syntax, no API call):\n  kubectl apply -f manifest.yaml --dry-run=client\n\nServer-side dry run (runs admission webhooks, validates against live cluster state):\n  kubectl apply -f manifest.yaml --dry-run=server\n\nBetter yet — diff against what's already deployed:\n  kubectl diff -f manifest.yaml\n\nThis shows a git-style diff of what would actually change in the cluster. Essential before applying a Helm upgrade or a refactored ConfigMap.\n\nIn CI pipelines:\n  kubectl apply -f k8s/ --dry-run=server --validate=true\n\nWith kustomize:\n  kustomize build overlays/prod | kubectl diff -f -\n\nClient dry-run is instant (fully offline). Server dry-run catches admission webhook rejections and quota violations that client mode misses.",
  },
  {
    icon: "🪵",
    grad: "from-green-500 to-teal-600",
    title: "Stream logs from multiple pods",
    body: "Install stern and run stern <app-name> to tail logs from all matching pods at once, colour-coded by pod name.",
    detail: "kubectl logs only tails one pod at a time. When a Deployment has 5 replicas, you need all of them at once.\n\nInstall stern:\n  brew install stern                          # macOS\n  go install github.com/stern/stern@latest    # any platform\n\nTail all pods matching a name pattern:\n  stern my-app\n\nFilter by label selector:\n  stern -l app=my-service,env=prod\n\nTarget a specific container in multi-container pods:\n  stern my-app --container api\n\nFilter to lines matching a regex:\n  stern my-app --include \"ERROR|WARN\"\n\nTail across all namespaces:\n  stern my-app --all-namespaces\n\nOutput is colour-coded by pod name — it's immediately obvious which replica is misbehaving.\n\nBuilt-in alternative (no install required):\n  kubectl logs -l app=my-app -f --max-log-requests=10",
  },
  {
    icon: "🔍",
    grad: "from-blue-500 to-violet-600",
    title: "Sort events by time",
    body: "kubectl get events --sort-by='.lastTimestamp' gives you a chronological view of what just happened in the cluster.",
    detail: "Kubernetes Events are the internal journal of the cluster — every scheduler decision, image pull, probe failure, and OOMKill is recorded here.\n\nChronological events in current namespace:\n  kubectl get events --sort-by='.lastTimestamp'\n\nAll namespaces (great for cluster-wide incidents):\n  kubectl get events -A --sort-by='.lastTimestamp'\n\nWatch live as new events arrive:\n  kubectl get events --watch\n\nFilter to a specific pod:\n  kubectl get events --field-selector involvedObject.name=my-pod-abc123\n\nShow only Warning events:\n  kubectl get events --field-selector type=Warning\n\nEvents expire after ~1 hour by default. For longer retention, send them to a logging backend or use kube-state-metrics + Prometheus.\n\nPro tip: after a CrashLoopBackOff, run:\n  kubectl get events --sort-by='.lastTimestamp' | tail -20\nThis reveals the root cause faster than reading logs.",
  },
  {
    icon: "🖥️",
    grad: "from-purple-500 to-pink-600",
    title: "k9s — terminal cluster UI",
    body: "Install k9s for a real-time, interactive terminal dashboard. Navigate resources, view logs, exec into pods — all with keyboard shortcuts.",
    detail: "k9s is a real-time terminal dashboard for Kubernetes — think htop for your cluster, built into your shell.\n\nInstall:\n  brew install k9s     # macOS\n  choco install k9s    # Windows\n  # or grab a binary from https://k9scli.io\n\nLaunch against your current kubeconfig context:\n  k9s\n\nEssential keyboard shortcuts:\n  :pod / :deploy / :svc    navigate to resource type\n  / (forward slash)         filter by name (regex supported)\n  l                         stream live logs\n  e                         edit resource YAML in $EDITOR\n  d                         describe resource\n  ctrl+d                    delete resource\n  s                         exec shell into container\n  Esc                       go back\n\nWhy use k9s over kubectl:\n• Real-time resource updates without re-running commands\n• CPU/memory per pod at a glance (with metrics-server)\n• Kill pods, rollback deployments with a single keypress\n• Switch namespaces and clusters instantly",
  },
  {
    icon: "🏗️",
    grad: "from-rose-500 to-orange-500",
    title: "Multi-arch builds with buildx",
    body: "docker buildx build --platform linux/amd64,linux/arm64 -t myimage:latest --push builds images for both x86 and Apple Silicon at once.",
    detail: "By default, docker build targets your local machine's CPU architecture. Multi-arch images bundle both amd64 and arm64 — Docker picks the right variant automatically on pull.\n\nOne-time setup:\n  # Enable QEMU cross-compilation emulation\n  docker run --privileged --rm tonistiigi/binfmt --install all\n\n  # Create a multi-arch buildx builder\n  docker buildx create --use --name multi-builder\n\nBuild and push a multi-arch image:\n  docker buildx build \\\n    --platform linux/amd64,linux/arm64 \\\n    -t myrepo/myimage:latest \\\n    --push \\\n    .\n\nNote: --push is required. Multi-arch manifests can't be loaded into the local store. Use --load for single-arch local testing.\n\nVerify the manifest list:\n  docker buildx imagetools inspect myrepo/myimage:latest\n\nUse cases:\n• Devs on Apple Silicon M-series running the same image as x86 CI\n• Kubernetes clusters with mixed node architectures\n• IoT/edge deployments on ARM devices",
  },
  {
    icon: "🔐",
    grad: "from-indigo-500 to-blue-600",
    title: "Never store secrets in images",
    body: "Use --secret in BuildKit (RUN --mount=type=secret) or runtime env vars. Secrets baked into image layers are readable by anyone with pull access.",
    detail: "Image layers are permanent and immutable. Copying a secret file into an image — even if you delete it in a later layer — leaves it readable in the layer history by anyone who can pull the image.\n\nBad pattern (secret lives in layer history forever):\n  COPY .env /app/.env   # ⚠ never do this\n\nCorrect: BuildKit secret mount (used during build, never stored):\n  # syntax=docker/dockerfile:1\n  RUN --mount=type=secret,id=db_pass \\\n      ./configure --db-pass=$(cat /run/secrets/db_pass)\n\n  # Build with:\n  docker build --secret id=db_pass,src=./db_password.txt .\n\nProduction runtime secrets:\n  • Kubernetes Secrets as env vars or volume mounts\n  • AWS Secrets Manager / HashiCorp Vault via init container\n  • Azure Key Vault / GCP Secret Manager with workload identity\n\nScan images for accidentally committed secrets:\n  trivy image myimage:latest\n\nGolden rule: images contain only code and dependencies. All credentials come from the runtime environment.",
  },
  {
    icon: "📊",
    grad: "from-emerald-500 to-green-600",
    title: "Resource quotas per namespace",
    body: "Apply a ResourceQuota to each namespace so one team can't starve another. Pair with LimitRange to set default requests/limits automatically.",
    detail: "Without quotas, one misconfigured Deployment can exhaust cluster CPU and memory, starving every other team.\n\nApply a ResourceQuota to a namespace:\n  apiVersion: v1\n  kind: ResourceQuota\n  metadata:\n    name: team-quota\n    namespace: team-a\n  spec:\n    hard:\n      requests.cpu: \"4\"\n      requests.memory: 8Gi\n      limits.cpu: \"8\"\n      limits.memory: 16Gi\n      pods: \"20\"\n\nPair with LimitRange to set default requests/limits automatically:\n  apiVersion: v1\n  kind: LimitRange\n  spec:\n    limits:\n    - type: Container\n      default: { cpu: 200m, memory: 256Mi }\n      defaultRequest: { cpu: 100m, memory: 128Mi }\n\nCheck usage vs quota:\n  kubectl describe resourcequota -n team-a\n\nBest practice: create ResourceQuota + LimitRange every time you create a namespace. Add them to your namespace-creation Helm chart or GitOps template.",
  },
];

/* ── Tab config ─────────────────────────────────────────────────── */
const TABS = [
  {
    id: "roadmap",
    icon: "🗺️",
    label: "Skill Tree",
    desc: "Interactive roadmap",
    activeGrad: "from-cyan-500 via-blue-500 to-violet-600",
    glowColor: "rgba(139,92,246,0.35)",
  },
  {
    id: "problems",
    icon: "🔥",
    label: "Common Problems",
    desc: "Diagnose & fix fast",
    activeGrad: "from-rose-500 via-red-500 to-orange-500",
    glowColor: "rgba(244,63,94,0.35)",
  },
  {
    id: "tips",
    icon: "💡",
    label: "Tips & Tricks",
    desc: "Level up your workflow",
    activeGrad: "from-yellow-400 via-amber-400 to-orange-500",
    glowColor: "rgba(251,191,36,0.35)",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ── Tip Modal ──────────────────────────────────────────────────── */
function TipModal({
  idx, onClose, onPrev, onNext,
}: {
  idx: number; onClose: () => void;
  onPrev: (() => void) | null; onNext: (() => void) | null;
}) {
  const tip = tips[idx];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")  { e.preventDefault(); onNext?.(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); onPrev?.(); }
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${tip.grad} flex flex-col items-center gap-2 px-6 pt-8 pb-6`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-inner">
            {tip.icon}
          </div>
          <h3 className="mt-1 text-center text-lg font-extrabold text-white drop-shadow">{tip.title}</h3>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
            Tip {idx + 1} of {tips.length}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm font-semibold leading-6 text-slate-800 mb-3">{tip.body}</p>
          <div className="space-y-1">
            {tip.detail.split('\n').map((line, i) => {
              if (line.trim() === '') return <div key={i} className="h-2" />;
              const isCode = line.startsWith('  ') || line.startsWith('\t');
              return isCode
                ? <code key={i} className="block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800 whitespace-pre">{line}</code>
                : <p key={i} className="text-sm leading-6 text-slate-700">{line}</p>;
            })}
          </div>
        </div>

        {/* Nav footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
          <button
            onClick={onPrev ?? undefined}
            disabled={!onPrev}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition
              disabled:cursor-not-allowed disabled:text-slate-300
              enabled:text-slate-600 enabled:hover:bg-slate-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={onNext ?? undefined}
            disabled={!onNext}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition
              disabled:cursor-not-allowed disabled:text-slate-300
              enabled:text-slate-600 enabled:hover:bg-slate-100"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────── */
export default function HomeTabs() {
  const [active, setActive] = useState<TabId>("roadmap");
  const [selectedTipIdx, setSelectedTipIdx] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const activeTab = TABS.find((t) => t.id === active)!;

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredProblems = query.trim()
    ? commonProblems.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.tag.toLowerCase().includes(query.toLowerCase()) ||
          p.cause.toLowerCase().includes(query.toLowerCase()) ||
          p.fix.toLowerCase().includes(query.toLowerCase())
      )
    : commonProblems;

  const suggestions = query.trim()
    ? [
        ...new Set([
          ...commonProblems
            .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
            .map((p) => ({ label: p.title, sub: p.tag })),
          ...commonProblems
            .filter(
              (p) =>
                p.tag.toLowerCase().includes(query.toLowerCase()) &&
                !p.title.toLowerCase().includes(query.toLowerCase())
            )
            .map((p) => ({ label: p.tag, sub: "Category" })),
        ].map((s) => JSON.stringify(s))),
      ]
        .map((s) => JSON.parse(s) as { label: string; sub: string })
        .slice(0, 6)
    : [];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-slate-100 bg-slate-50">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 px-3 py-4 text-center transition-all duration-200
                ${isActive ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-white/60"}`}
            >
              {/* Active bottom border */}
              {isActive && (
                <span className={`absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r ${tab.activeGrad}`} />
              )}
              <span className="relative text-xl">{tab.icon}</span>
              <span className="relative text-sm font-bold leading-tight">{tab.label}</span>
              <span className={`relative text-[10px] leading-tight ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section heading */}
      <div className="px-6 pt-8 pb-2 text-center">
        <h2 className={`text-2xl font-extrabold bg-gradient-to-r ${activeTab.activeGrad} bg-clip-text text-transparent`}>
          {activeTab.icon} {activeTab.label}
        </h2>
      </div>

      {/* Tab content */}
      <div className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        {active === "roadmap" && <SkillTree />}

        {active === "problems" && (
          <div>
            {/* Search bar */}
            <div ref={searchRef} className="relative mb-6">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search problems by name, tag, or symptom…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); setShowSuggestions(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1.5 w-full rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setQuery(s.label); setShowSuggestions(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                      </svg>
                      <span className="font-medium text-slate-800">{s.label}</span>
                      <span className="ml-auto text-xs text-slate-400">{s.sub}</span>
                    </button>
                  ))}
                </div>
              )}

              {query.trim() && (
                <p className="mt-2 text-xs text-slate-400 pl-1">
                  {filteredProblems.length === 0
                    ? "No results found"
                    : `${filteredProblems.length} result${filteredProblems.length !== 1 ? "s" : ""}`}
                </p>
              )}
            </div>

            {/* Results grid */}
            {filteredProblems.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProblems.map((p) => (
                  <div
                    key={p.title}
                    className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: p.tagColor + "44" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{p.icon}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest"
                        style={{ background: p.tagColor + "18", color: p.tagColor }}
                      >
                        {p.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{p.title}</h3>
                    <p className="text-xs leading-5 text-slate-500">{p.cause}</p>
                    <p
                      className="mt-auto rounded-xl px-3 py-2 font-mono text-xs leading-5 text-green-700 bg-slate-900"
                      style={{ borderLeft: `3px solid ${p.tagColor}` }}
                    >
                      {p.fix}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <p className="text-sm font-medium">No problems match &ldquo;{query}&rdquo;</p>
                <button onClick={() => setQuery("")} className="text-xs text-blue-500 hover:underline">Clear search</button>
              </div>
            )}
          </div>
        )}

        {active === "tips" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, i) => (
              <button
                key={tip.title}
                onClick={() => setSelectedTipIdx(i)}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200"
              >
                {/* Gradient accent corner */}
                <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 bg-gradient-to-br ${tip.grad} blur-xl transition-opacity group-hover:opacity-30`} />
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tip.grad} text-xl shadow`}>
                  {tip.icon}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">{tip.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-2">{tip.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-600">
                  Read more
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tip modal */}
      {selectedTipIdx !== null && (
        <TipModal
          idx={selectedTipIdx}
          onClose={() => setSelectedTipIdx(null)}
          onPrev={selectedTipIdx > 0 ? () => setSelectedTipIdx((i) => i! - 1) : null}
          onNext={selectedTipIdx < tips.length - 1 ? () => setSelectedTipIdx((i) => i! + 1) : null}
        />
      )}
    </div>
  );
}
