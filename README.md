# DevFlow Studio

> **Build, Validate, and Export DevOps Infrastructure Visually.**


```
```{=html}
<p align="center">
```
![Status](https://img.shields.io/badge/status-MVP-blue)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Supported-326CE5)
![License](https://img.shields.io/badge/License-MIT-green)

```{=html}
</p>
```

## Problem Statement

Modern DevOps requires engineers to manually author numerous
configuration files across Docker, Kubernetes, CI/CD, and cloud tooling.
This is repetitive, error-prone, and difficult for newcomers while also
increasing the risk of insecure deployments.

## Solution

A visual builder that lets users configure infrastructure using forms
and diagrams while automatically generating validated
infrastructure-as-code artifacts and recommending best practices.

## AI Approach & Architecture

AI was used as a software development assistant throughout the project. IBM Bob assisted with generating boilerplate code, suggesting implementations for specific features, explaining unfamiliar APIs, identifying potential bugs, recommending code improvements, generating unit tests, and producing documentation. All AI-generated code and recommendations were reviewed, modified where necessary, and validated through testing before being incorporated into the final application. The project design, architecture, business logic, and final implementation decisions remained the responsibility of the development team.

## Selected Challenge Theme

**Wildcard Challenge**

## Overview
DevFlow Studio is a visual DevOps workflow automation platform that enables users to build infrastructure and deployment configurations through an intuitive graphical interface. Instead of manually writing YAML or Dockerfiles, users configure their applications using guided forms and visual builders, while the platform automatically generates production-ready artifacts such as Dockerfiles, Docker Compose, Kubernetes manifests, GitHub Actions workflows, and GitOps resources from an intuitive UI.

## How IBM Bob was used in this project

-   Assisted in generating boilerplate code based on natural-language instructions.
-   Suggested implementations for APIs and database queries.
-   Helped debug runtime and syntax errors.
-   Generated unit test templates.
-   Created documentation and code comments.
-   Recommended refactoring to improve readability and maintainability.
-   Explained unfamiliar libraries and programming concepts.
-   Suggested optimizations and best practices.

---

## ✨ Features

### 🏗️ Infrastructure Builder
- **Project Wizard** — Select project type, language, and framework
- **Container Config** — Configure ports, environment variables, and entrypoints
- **Docker Compose Builder** — Add PostgreSQL, MySQL, Redis, MongoDB services visually
- **Kubernetes Builder** — Configure replicas, resource limits, and service types
- **Helm Chart Generator** — Generate Helm charts with parameterized values

### 🔄 CI/CD Pipeline Builder
- **Drag-and-Drop Canvas** — Build pipelines visually using React Flow
- **8 Stage Types** — Checkout, Install, Test, Lint, SAST, Build, Push Image, Deploy
- **Multi-Target Export** — Generate pipelines for:
  - GitHub Actions (`.github/workflows/ci.yml`)
  - GitLab CI (`.gitlab-ci.yml`)
  - Azure DevOps (`azure-pipelines.yml`)

### 🚀 Export & Integration
- **Export ZIP** — Download all generated artifacts as a ZIP file
- **Push to GitHub** — Create a repository and push files directly via API
- **Live Preview** — See generated code update in real-time as you configure

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (3.10+) and **pip**

### Setup

#### 1. Clone the repo
```bash
git clone https://github.com/Prof-anabi/devflow-studio
```

#### 2. Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 4. Open in Browser
Navigate to `http://localhost:5173/`

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend       │
│  React + TS     │◄────►│   FastAPI        │
│  Vite           │ REST │   Jinja2         │
│  React Flow     │      │   httpx          │
│  Monaco Editor  │      │   PyYAML         │
└─────────────────┘      └─────────────────┘
```

### Tech Stack

| Layer        | Technology                                      |
|-------------|-------------------------------------------------|
| **Frontend** | React 19, TypeScript, Vite, React Flow, Monaco Editor |
| **Backend**  | Python 3, FastAPI, Jinja2, httpx, PyYAML        |
| **UI Icons** | Lucide React                                    |

---

## 🧪 Verification

### Infrastructure Builder
- Select project settings → See live Dockerfile, Compose, K8s, and Helm manifests
- Change service type → See updated Kubernetes YAML
- Export ZIP → Verify all files are included

### Pipeline Builder
- Switch to "Pipeline Builder" view
- Click stages from the palette to add them
- Drag to reorder, connect edges
- Switch between GitHub Actions / GitLab CI / Azure DevOps
- Export ZIP → Downloads the pipeline YAML

### GitHub Integration
- Click "Push to GitHub"
- Enter your PAT, repo name, and visibility
- Verify the repo is created with all infrastructure files

---

## 🗺️ Future Roadmap

DevFlow Studio is built as a four-phase project. Phases 1 and 2 are complete. Here's what's planned next:

### Phase 3 — DevSecOps (Security & Validation)
- **🔒 Security Scanner** — Analyze generated artifacts for:
  - Root user containers
  - `:latest` image tag usage
  - Missing resource limits
  - Privileged containers
  - Exposed secrets in environment variables
- **✅ Best Practice Engine** — Intelligent suggestions like:
  - Add Gunicorn for Flask apps
  - Enable liveness and readiness probes
  - Multi-stage Docker builds
  - Non-root container execution
  - Image digest pinning
- **📊 Quality Score** — Each project gets a score out of 100 with breakdowns for:
  - Security rating
  - Maintainability rating
  - Performance rating
  - Production readiness check

### Phase 4 — Platform Engineering & AI
- **🌐 Multi-Cloud Export** — Generate infrastructure for:
  - AWS (CloudFormation / CDK)
  - Azure (ARM / Bicep)
  - GCP (Deployment Manager)
- **🔄 GitOps Integration** — Auto-generate:
  - Argo CD `Application` manifests
  - Kustomize `kustomization.yaml`
  - Flux CD configurations
- **🤖 AI Configuration Assistant** — Natural language to infrastructure:
  - Describe your app in plain English
  - AI generates the full configuration stack
  - Explain mode: click any field to learn what it does
- **📈 Cost Estimator** — Estimate monthly cloud costs based on:
  - Replicas, CPU, and memory settings
  - Selected cloud provider
  - Optional: spot instance pricing

---

## 🤝 Call for Collaboration

DevFlow Studio is an open-source project aiming to make DevOps accessible to everyone. We welcome contributions of all kinds!

### How You Can Help

| Contribution Area | Ideas |
|------------------|-------|
| **🐛 Bug Reports** | Found an issue? Open a GitHub issue with reproduction steps |
| **💡 Feature Requests** | Have an idea for a new builder or integration? We'd love to hear it |
| **🔧 Code Contributions** | Pick a feature from the roadmap and submit a PR |
| **📖 Documentation** | Improve guides, add examples, or write tutorials |
| **🧪 Testing** | Help us add unit tests, integration tests, and E2E tests |
| **🎨 UI/UX** | Propose design improvements or new visual components |
| **🌍 Translations** | Help translate the UI and documentation |
| **📦 Templates** | Contribute Jinja2 templates for new tools and platforms |

### Get Involved

- ⭐ **Star the repo** to show your support
- 🐛 **Report issues** when you find bugs
- 🛠️ **Submit pull requests** for features or fixes
- 💬 **Start discussions** to share ideas and feedback
- 📣 **Spread the word** — tell your team, friends, and community

---

## 📂 Project Structure

```
devflow-studio/
├── backend/
│   └── main.py              # FastAPI server with all endpoints
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main app with infrastructure builder
│   │   ├── index.css        # Dark mode glassmorphism design system
│   │   └── components/
│   │       ├── PipelineBuilder.tsx  # React Flow pipeline canvas
│   │       └── PipelineNode.tsx     # Custom pipeline stage node
│   └── ...
├── README.md
└── .gitignore
```

---

## 📄 License

MIT
