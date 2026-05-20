---
title: "TLS Termination with cert-manager"
order: 2
objectives:
  - "Install cert-manager and register a Let's Encrypt ClusterIssuer."
  - "Issue and auto-renew certificates for Ingress hosts."
  - "Use HTTP-01 vs DNS-01 challenges and know when each is required."
  - "Mount certificates as Kubernetes Secrets consumed by Ingress."
  - "Troubleshoot stuck `Order` and `Challenge` resources."
tryIt: "Add `cert-manager.io/cluster-issuer: letsencrypt-prod` and a `tls:` block to your Ingress. Watch `kubectl get certificate,order,challenge` — within ~60s you have a real cert. Visit the URL — green padlock."
takeaways:
  - "**HTTP-01** is simpler but requires the cluster to be reachable from the internet."
  - "**DNS-01** works for internal/wildcard certs but needs DNS provider API credentials."
  - "Use `letsencrypt-staging` first — the prod issuer has aggressive rate limits."
  - "cert-manager stores the cert as a Secret; Ingress references it by name. Don't manage TLS Secrets by hand."
  - "Stuck Challenges = DNS not propagated or port 80 not reachable. 90% of failures."
quiz:
  - text: "Why does the lesson recommend starting with `letsencrypt-staging` before using the production issuer?"
    options:
      - "The staging issuer uses stronger encryption keys."
      - "The production issuer has aggressive rate limits, so staging is safer for testing."
      - "Staging certificates automatically become production certificates after validation."
      - "The staging issuer is required for DNS-01 challenges."
    correctAnswer: 1
    explanation: "The lesson warns that Let's Encrypt production has aggressive rate limits. Testing with staging helps you validate the flow without burning through production issuance attempts."
  - text: "Which challenge type must you use for wildcard certificates according to the lesson?"
    options:
      - "HTTP-01"
      - "TLS-ALPN-01"
      - "DNS-01"
      - "Ingress-01"
    correctAnswer: 2
    explanation: "The lesson explicitly says wildcard certs require DNS-01. HTTP-01 is presented as simpler, but it cannot validate wildcard names."
  - text: "What does cert-manager store in Kubernetes after it successfully completes ACME validation?"
    options:
      - "A ConfigMap referenced directly by the Ingress"
      - "A Secret containing the certificate and key"
      - "An Order resource that Ingress serves forever"
      - "A Deployment that terminates TLS for the app"
    correctAnswer: 1
    explanation: "cert-manager stores the issued certificate and private key in a Kubernetes Secret. The Ingress then references that Secret by name in its `tls` block."
  - text: "A certificate request is stuck in the Challenge phase. What does the lesson say is the most likely cause?"
    options:
      - "The ServiceAccount token has expired."
      - "The Ingress controller is missing a readiness probe."
      - "DNS has not propagated or port 80 is not reachable."
      - "The certificate duration is set to 90 days."
    correctAnswer: 2
    explanation: "The takeaways say most stuck Challenges come down to DNS propagation or port 80 reachability. The troubleshooting section also points you to inspect the Challenge for the ACME error."
---

TLS is non-negotiable in production. Without HTTPS, credentials transit in plaintext, browsers warn users, and SEO rankings drop. Manually managing TLS certificates — generating CSRs, completing ACME challenges, renewing every 90 days, updating Kubernetes Secrets — is error-prone and time-consuming. cert-manager automates every step of this lifecycle, watching for expiry and renewing certificates transparently.

How cert-manager works:
cert-manager runs as a controller set in your cluster. It watches Certificate and Ingress resources. When you annotate an Ingress or create a Certificate resource, cert-manager creates a temporary resource (Order, Challenge) to complete the ACME validation, stores the resulting certificate and key in a Kubernetes Secret, and monitors the expiry date to renew 30 days before expiration.

Install cert-manager via Helm:
  helm repo add jetstack https://charts.jetstack.io
  helm install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --set installCRDs=true \
    --set replicaCount=2

Verify installation:
  kubectl get pods -n cert-manager
  kubectl get crds | grep cert-manager

ClusterIssuer for Let's Encrypt production:
  apiVersion: cert-manager.io/v1
  kind: ClusterIssuer
  metadata:
    name: letsencrypt-prod
  spec:
    acme:
      server: https://acme-v02.api.letsencrypt.org/directory
      email: admin@example.com
      privateKeySecretRef:
        name: letsencrypt-prod-account-key
      solvers:
        - http01:
            ingress:
              ingressClassName: nginx

HTTP-01 challenge explained:
cert-manager temporarily adds a path like /.well-known/acme-challenge/TOKEN to your Ingress. Let's Encrypt hits that URL to verify you control the domain. This requires your domain to resolve to the cluster's Ingress IP. For wildcard certs, you must use the DNS-01 challenge instead.

ClusterIssuer using DNS-01 with Route53 (for wildcard certs):
  spec:
    acme:
      solvers:
        - dns01:
            route53:
              region: us-east-1
              hostedZoneID: Z123456ABCDEF
              accessKeyIDSecretRef:
                name: route53-credentials
                key: access-key-id
              secretAccessKeySecretRef:
                name: route53-credentials
                key: secret-access-key

Ingress with automated TLS:
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: app-ingress
    namespace: production
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
  spec:
    ingressClassName: nginx
    tls:
      - hosts:
          - api.example.com
          - www.example.com
        secretName: app-tls-secret
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

Explicit Certificate resource (more control):
  apiVersion: cert-manager.io/v1
  kind: Certificate
  metadata:
    name: api-cert
    namespace: production
  spec:
    secretName: api-tls-secret
    issuerRef:
      name: letsencrypt-prod
      kind: ClusterIssuer
    commonName: api.example.com
    dnsNames:
      - api.example.com
      - www.example.com
    duration: 2160h    # 90 days
    renewBefore: 720h  # Renew 30 days before expiry

Monitoring certificate health:
  kubectl get certificate -n production
  kubectl describe certificate api-cert -n production
  # Status.Conditions shows Ready=True when the cert is valid.
  kubectl get certificaterequest -n production
  kubectl get order -n production
  kubectl get challenge -n production
  # If a cert is stuck: kubectl describe challenge -n production to see the ACME error.

Force renewal:
  kubectl delete secret app-tls-secret -n production
  # cert-manager detects the missing secret and immediately re-issues the certificate.