---
title: "Services Explained"
order: 1
objectives:
  - "Explain the Kubernetes networking contract (every Pod gets a routable IP)."
  - "Pick the right Service type — **ClusterIP**, **NodePort**, **LoadBalancer**, **ExternalName** — for a given problem."
  - "Understand how **kube-proxy** programs iptables / IPVS to implement Services."
  - "Resolve Services by DNS using the `<svc>.<ns>.svc.cluster.local` pattern."
  - "Debug broken Services using **endpoints** as your primary diagnostic signal."
tryIt: "When in doubt, `kubectl get endpoints <svc>` first. Create a Service whose selector doesn't match any Pods — the endpoints list is empty. Fix the selector and watch endpoints populate. That's 80% of Service debugging."
takeaways:
  - "A Service is just a **stable virtual IP** plus a **label selector** — endpoints are dynamic."
  - "**ClusterIP** is the default and right answer 90% of the time; expose externally through **Ingress**, not raw LoadBalancers per service."
  - "**Headless** Services (`clusterIP: None`) give per-Pod DNS — essential for StatefulSets and peer-aware databases."
  - "DNS pattern: `api-svc` inside the namespace, `api-svc.production` across namespaces."
  - "Empty `Endpoints` = label mismatch or no Ready Pods — almost never a networking issue."
quiz:
  - text: "When a Service is not routing traffic, what does the lesson say you should check first?"
    options:
      - "kubectl get endpoints <svc>"
      - "kubectl delete the Service and recreate it"
      - "The node's firewall rules before anything else"
      - "CoreDNS logs before checking Pods"
    correctAnswer: 0
    explanation: "The lesson says endpoints are your primary diagnostic signal. Empty endpoints usually mean a selector mismatch or no Ready Pods."
  - text: "What is the key behavior of a headless Service with clusterIP: None?"
    options:
      - "It exposes the app publicly without a load balancer"
      - "It disables DNS for the Service"
      - "It returns individual Pod IPs instead of a virtual IP"
      - "It forces kube-proxy to use IPVS mode"
    correctAnswer: 2
    explanation: "The lesson explains that headless Services skip the virtual ClusterIP. DNS resolves directly to the backing Pod IPs, which is useful for StatefulSets."
  - text: "From a Pod in the same namespace, which DNS name is enough to reach the Service api-svc?"
    options:
      - "api-svc"
      - "api-svc.svc"
      - "production.api-svc"
      - "api-svc.cluster.local"
    correctAnswer: 0
    explanation: "The lesson says same-namespace lookups can use just the Service name. Cross-namespace access needs at least api-svc.production."
  - text: "In iptables mode, how does kube-proxy implement a Service ClusterIP?"
    options:
      - "By assigning the ClusterIP directly to a Pod network interface"
      - "By inserting NAT rules that DNAT traffic to healthy Pod IPs"
      - "By creating a NodePort on every worker automatically"
      - "By rewriting the Service into an Ingress rule"
    correctAnswer: 1
    explanation: "The lesson says kube-proxy watches Services and Endpoints, then installs NAT rules. Packets sent to the ClusterIP are DNATed to a healthy backend Pod."
---

Kubernetes networking is built on a contract: every Pod gets a unique IP address, and every Pod can reach every other Pod IP directly without NAT. Services sit on top of this model to provide stable, discoverable endpoints. Understanding how Services work at the kube-proxy level makes debugging connection problems fast and certain.

Why Pod IPs alone are not enough:
Pods are ephemeral. When a Deployment rolls an update, old Pods are replaced with new ones that have different IP addresses. Any service that hardcodes a Pod IP breaks on every update. Services solve this by tracking healthy endpoints through a label selector and providing a stable virtual IP called a ClusterIP that never changes.

How kube-proxy implements Services:
On each node, kube-proxy watches the Kubernetes API for Service and Endpoints objects. In iptables mode (default), it inserts NAT rules that DNAT packets destined for the ClusterIP to a randomly chosen healthy Pod IP. In IPVS mode, it uses the Linux kernel's IPVS load balancer which handles tens of thousands of rules more efficiently — important for clusters with many services.

All four Service types:

ClusterIP (internal only):
  apiVersion: v1
  kind: Service
  metadata:
    name: api-svc
    namespace: production
  spec:
    selector:
      app: api
    ports:
      - name: http
        port: 80
        targetPort: 3000
      - name: metrics
        port: 9090
        targetPort: 9090

NodePort (exposes on every node):
  spec:
    type: NodePort
    selector:
      app: api
    ports:
      - port: 80
        targetPort: 3000
        nodePort: 30080   # 30000-32767 range

LoadBalancer (cloud only):
  spec:
    type: LoadBalancer
    selector:
      app: api
    ports:
      - port: 443
        targetPort: 3000
  Provisions an external load balancer (NLB on AWS, TCP LB on GCP).
  Use Ingress instead when routing multiple services through one LB.

ExternalName (DNS alias):
  spec:
    type: ExternalName
    externalName: my-database.us-east-1.rds.amazonaws.com
  Resolves to a CNAME, useful for migrating on-prem services or referencing managed cloud resources by a stable in-cluster DNS name.

Headless Services (no ClusterIP):
  spec:
    clusterIP: None
    selector:
      app: postgres
  DNS returns the individual Pod IPs instead of a virtual IP. Used by StatefulSets so each replica (postgres-0, postgres-1) is reachable by name. Required by some databases for peer discovery.

DNS resolution mechanics:
Kubernetes runs CoreDNS as the cluster DNS server. Service DNS follows the pattern:
  <service>.<namespace>.svc.cluster.local
  api-svc.production.svc.cluster.local
From within the same namespace you can use just api-svc. Cross-namespace requires at minimum api-svc.production.

Endpoint debugging workflow:
  kubectl get endpoints api-svc -n production
  # Shows the list of Pod IPs backing the service. Empty = no matching Pods.
  kubectl get pods -l app=api -n production
  # Verify Pods exist and are Ready.
  kubectl describe service api-svc -n production
  # Shows selector, port mappings, and endpoint list in one view.

Session affinity:
  spec:
    sessionAffinity: ClientIP
    sessionAffinityConfig:
      clientIP:
        timeoutSeconds: 10800
  Routes requests from the same client IP to the same Pod. Useful for WebSocket connections or session-heavy apps that have not been refactored for stateless operation.

Production tips:
- Always name your ports (http, grpc, metrics) — Istio and Prometheus rely on port names.
- Set targetPort to the named containerPort on the Pod, not a number, to survive port changes.
- Use LoadBalancer with AWS annotations for NLB instead of classic ELB: service.beta.kubernetes.io/aws-load-balancer-type: nlb.
- Avoid NodePort in production; it bypasses the Ingress layer and complicates firewall rules.