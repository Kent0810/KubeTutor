---
title: "Ingress Controllers and Rules"
order: 1
objectives:
  - "Install an Ingress controller (NGINX, Traefik, or cloud-native)."
  - "Write Ingress rules with hosts, paths, and `pathType`."
  - "Route to multiple services through a single LoadBalancer."
  - "Use annotations for rewrite, rate limiting, and timeouts."
  - "Migrate from Ingress to the newer **Gateway API**."
tryIt: "Install ingress-nginx with `helm install ingress-nginx ingress-nginx/ingress-nginx`. Create two Ingress rules for `app.local` and `api.local` pointing at different Services. Add both to `/etc/hosts` and curl them — one LoadBalancer, two apps."
takeaways:
  - "An Ingress **resource** is a request; an Ingress **controller** is what fulfils it. You need both."
  - "Always set `pathType: Prefix` or `Exact` explicitly — the default behaviour varies."
  - "Per-controller annotations diverge wildly. Pin to one controller per cluster."
  - "**Gateway API** is the long-term successor and handles multi-tenancy and protocols cleanly."
  - "Don't route raw `LoadBalancer` services per app; the Ingress LB is your money saver."
quiz:
  - text: "What distinction does the lesson make between an Ingress resource and an Ingress controller?"
    options:
      - "The resource serves traffic directly, while the controller stores Secrets"
      - "The resource is the request, and the controller is what fulfills it"
      - "The resource handles TCP only, while the controller handles HTTP"
      - "They are the same thing in different API versions"
    correctAnswer: 1
    explanation: "The lesson says an Ingress resource only declares routing intent. You still need a controller watching those objects and turning them into working proxy configuration."
  - text: "Why does the lesson tell you to set pathType explicitly on every Ingress rule?"
    options:
      - "Because Prefix is required by the Kubernetes API server"
      - "Because the default matching behavior can vary by controller"
      - "Because Exact is the only mode that supports TLS"
      - "Because it is needed only for AWS ALB, not NGINX"
    correctAnswer: 1
    explanation: "The lesson warns that relying on implicit behavior is risky because controllers differ. Setting Prefix or Exact makes routing intent unambiguous."
  - text: "What cost and operations benefit does the lesson emphasize about using Ingress?"
    options:
      - "It lets every service keep its own dedicated load balancer"
      - "It removes the need for Services entirely"
      - "It routes multiple services through one external load balancer"
      - "It replaces CoreDNS as the cluster entry point"
    correctAnswer: 2
    explanation: "The lesson says Ingress collapses many apps behind a single LB. That reduces cloud cost and centralizes routing, TLS, and policy management."
  - text: "If an Ingress rule uses path: /api with pathType: Prefix, which request path should match it?"
    options:
      - "/admin"
      - "/exactly-api-only"
      - "/api/users"
      - "/"
    correctAnswer: 2
    explanation: "The lesson explains that Prefix matches any path beginning with the prefix. For /api, that includes nested paths like /api/users and /api/v2."
---

Every production Kubernetes cluster runs dozens of services. Running one cloud load balancer per service costs hundreds of dollars a month and creates a management nightmare. Ingress collapses all external HTTP/HTTPS traffic into a single entry point with intelligent routing. An Ingress Controller watches Ingress resources and translates them into proxy configuration, giving you path-based routing, host-based routing, TLS termination, rate limiting, and auth — all managed as Kubernetes YAML.

Ingress Controller options:
  NGINX Ingress      Most widely used. Battle-tested, rich annotation library.
  Traefik            Native Kubernetes discovery, automatic TLS, dashboard.
  AWS ALB Controller Provisions Application Load Balancers natively. Best for AWS.
  GKE Ingress        GCP's managed Ingress, backed by Google Cloud HTTP(S) LB.
  Istio Gateway      Full service mesh gateway, most powerful but most complex.

Installing NGINX Ingress Controller:
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
  helm install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace \
    --set controller.replicaCount=2 \
    --set controller.resources.requests.cpu=100m \
    --set controller.resources.requests.memory=128Mi

Verify the external IP is assigned:
  kubectl get svc -n ingress-nginx ingress-nginx-controller
  # Wait for EXTERNAL-IP to show a public IP or hostname.

Basic host-based Ingress:
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: app-ingress
    namespace: production
    annotations:
      nginx.ingress.kubernetes.io/proxy-body-size: "50m"
      nginx.ingress.kubernetes.io/proxy-read-timeout: "120"
  spec:
    ingressClassName: nginx
    rules:
      - host: api.example.com
        http:
          paths:
            - path: /
              pathType: Prefix
              backend:
                service:
                  name: api-svc
                  port:
                    number: 80

Path-based routing — multiple services on one host:
  rules:
    - host: example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port:
                  number: 80
          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin-svc
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-svc
                port:
                  number: 80

Path types:
  Prefix      Matches any path starting with the prefix. /api matches /api, /api/users, /api/v2.
  Exact       Matches only the exact path.
  ImplementationSpecific  Controller-defined matching (Traefik regex, etc.).

Useful NGINX annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /    Strip path prefix before forwarding.
  nginx.ingress.kubernetes.io/rate-limit: "100"    Requests per second per IP.
  nginx.ingress.kubernetes.io/auth-url             External authentication service.
  nginx.ingress.kubernetes.io/ssl-redirect: "true" Force HTTPS.
  nginx.ingress.kubernetes.io/cors-allow-origin    CORS header injection.
  nginx.ingress.kubernetes.io/upstream-hash-by     Consistent hashing for sticky routing.

AWS ALB Ingress (using AWS Load Balancer Controller):
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'

Debugging Ingress:
  kubectl describe ingress app-ingress -n production
  kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=100
  # Look for 502 errors (Pod not ready), 404 (no matching rule), or config reload failures.