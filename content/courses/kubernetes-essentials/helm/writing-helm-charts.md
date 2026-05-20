---
title: "Writing Your Own Helm Chart"
order: 2
objectives:
  - "Scaffold a chart with `helm create` and understand the file layout."
  - "Use template helpers in `_helpers.tpl` to avoid repetition."
  - "Validate values with a `values.schema.json`."
  - "Write `helm test` hooks and Helmfile/Helm Diff plugins."
  - "Avoid template anti-patterns (overuse of `tpl`, hard-coded namespaces)."
tryIt: "`helm create demo`. Inspect `templates/deployment.yaml` — every value comes from `.Values.*`. Run `helm template demo --debug` to see the rendered output. Then add a value to `values.schema.json` and break it deliberately — Helm fails fast."
takeaways:
  - "Charts are just **templated YAML** + a values schema. No magic."
  - "Use `_helpers.tpl` for fully-qualified names, common labels, and the chart's selector labels."
  - "`values.schema.json` catches typos at install time — much better than runtime failures."
  - "Always include a NOTES.txt with post-install instructions. Operators thank you."
  - "Use **library charts** for shared logic across multiple applications."
quiz:
  - text: "What command does the lesson use to scaffold a brand-new chart?"
    options:
      - "`helm package my-app`"
      - "`helm install my-app`"
      - "`helm create my-app`"
      - "`helm repo index my-app`"
    correctAnswer: 2
    explanation: "The chart-writing workflow starts with `helm create my-app`. The lesson says this scaffolds files like `Chart.yaml`, `values.yaml`, and templates for common Kubernetes resources."
  - text: "Why does the lesson recommend putting names and common labels in `_helpers.tpl`?"
    options:
      - "So Helm can compile the chart faster."
      - "To avoid repetition by reusing named templates."
      - "Because `_helpers.tpl` is the only file allowed to contain Go templates."
      - "So values from `values.schema.json` become optional."
    correctAnswer: 1
    explanation: "The lesson describes `_helpers.tpl` as the place for named templates like full names and labels. This keeps repeated logic centralized and consistent."
  - text: "What problem does `values.schema.json` solve for chart authors and operators?"
    options:
      - "It generates release notes after `helm upgrade`."
      - "It prevents Kubernetes from needing readiness probes."
      - "It catches invalid or misspelled values at install time."
      - "It automatically publishes the chart to GitHub Pages."
    correctAnswer: 2
    explanation: "A key takeaway is that `values.schema.json` catches typos early. The lesson explicitly contrasts that with discovering the problem later as a runtime failure."
  - text: "What operator-friendly file does the lesson say every chart should include with post-install instructions?"
    options:
      - "`README.lock`"
      - "`NOTES.txt`"
      - "`.helmignore`"
      - "`Chart.lock`"
    correctAnswer: 1
    explanation: "The takeaways call out `NOTES.txt` as something operators appreciate. It is the place Helm charts typically use to print helpful post-install guidance."
---

Writing your own Helm chart is how you turn a pile of kubectl apply files into a professional, shareable, configurable deployment artifact. A well-written chart is self-documenting through its values.yaml, handles edge cases with conditionals, works across environments with no manifest changes, and is tested before it ships.

Scaffold a new chart:
  helm create my-app
  # Creates: Chart.yaml, values.yaml, templates/ with Deployment, Service, Ingress, HPA, ServiceAccount

Chart.yaml:
  apiVersion: v2
  name: my-app
  description: Production API service
  type: application
  version: 0.1.0          Chart version — bump on every chart change.
  appVersion: "2.1.0"     App version — informational, used in labels.

values.yaml (the chart's public API):
  replicaCount: 2
  image:
    repository: myrepo/my-app
    tag: ""
    pullPolicy: IfNotPresent
  imagePullSecrets: []
  service:
    type: ClusterIP
    port: 80
    targetPort: 3000
  ingress:
    enabled: false
    className: nginx
    host: my-app.example.com
    tls: []
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: "1"
      memory: 512Mi
  autoscaling:
    enabled: false
    minReplicas: 2
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
  nodeSelector: {}
  tolerations: []
  affinity: {}
  podAnnotations: {}
  env: []
  envFrom: []

_helpers.tpl — named templates to avoid repetition:
  {{- define "my-app.fullname" -}}
  {{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
  {{- end }}

  {{- define "my-app.labels" -}}
  helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
  app.kubernetes.io/name: {{ .Chart.Name }}
  app.kubernetes.io/instance: {{ .Release.Name }}
  app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
  app.kubernetes.io/managed-by: {{ .Release.Service }}
  {{- end }}

templates/deployment.yaml — full production template:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: {{ include "my-app.fullname" . }}
    labels:
      {{- include "my-app.labels" . | nindent 4 }}
  spec:
    {{- if not .Values.autoscaling.enabled }}
    replicas: {{ .Values.replicaCount }}
    {{- end }}
    selector:
      matchLabels:
        app.kubernetes.io/name: {{ .Chart.Name }}
        app.kubernetes.io/instance: {{ .Release.Name }}
    template:
      metadata:
        labels:
          {{- include "my-app.labels" . | nindent 8 }}
        {{- with .Values.podAnnotations }}
        annotations:
          {{- toYaml . | nindent 8 }}
        {{- end }}
      spec:
        {{- with .Values.imagePullSecrets }}
        imagePullSecrets:
          {{- toYaml . | nindent 8 }}
        {{- end }}
        containers:
          - name: {{ .Chart.Name }}
            image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
            imagePullPolicy: {{ .Values.image.pullPolicy }}
            ports:
              - name: http
                containerPort: {{ .Values.service.targetPort }}
            {{- with .Values.env }}
            env:
              {{- toYaml . | nindent 12 }}
            {{- end }}
            {{- with .Values.envFrom }}
            envFrom:
              {{- toYaml . | nindent 12 }}
            {{- end }}
            resources:
              {{- toYaml .Values.resources | nindent 12 }}

Testing and linting:
  helm lint ./my-app
  helm template my-release ./my-app | kubectl apply --dry-run=client -f -
  helm install --dry-run --debug my-release ./my-app -f prod-values.yaml
  helm test my-release -n production   Runs test Pods defined in templates/tests/

Packaging and distributing:
  helm package ./my-app
  # Creates my-app-0.1.0.tgz
  helm repo index . --url https://charts.example.com
  # Upload tgz and index.yaml to S3 or GitHub Pages.