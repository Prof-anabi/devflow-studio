from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from typing import Dict, List, Optional
import io
import zipfile
import httpx
from jinja2 import Template

app = FastAPI(title="DevFlow Studio API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectConfig(BaseModel):
    project_type: str
    language: str
    framework: str
    port: int = 8000
    env_vars: Dict[str, str] = {}
    services: list = []
    replicas: int = 1
    cpu_limit: str = "500m"
    memory_limit: str = "512Mi"
    service_type: str = "ClusterIP"
    app_name: str = "my-app"
    container_image: str = "my-app:latest"

class PipelineConfig(BaseModel):
    stages: List[str]
    target: str  # "github-actions" | "gitlab-ci" | "azure-devops"
    language: str = "Python"
    registry: str = "docker.io/myuser"
    app_name: str = "my-app"

class GithubPushRequest(BaseModel):
    token: str
    repo_name: str
    private: bool = True
    config: ProjectConfig

def get_generated_files(config: ProjectConfig) -> Dict[str, str]:
    dockerfile_template = """# Auto-generated Dockerfile for {{ framework }}
{% if language == 'Go' %}
FROM golang:latest
{% elif language == 'Node.js' %}
FROM node:latest
{% else %}
FROM {{ language | lower }}:latest
{% endif %}
WORKDIR /app
COPY . .
{% if language == 'Python' %}
RUN pip install -r requirements.txt
{% elif language == 'Node.js' %}
RUN npm install
{% elif language == 'Go' %}
RUN go mod download
RUN go build -o main .
{% elif language == 'Java' %}
RUN mvn clean package
{% endif %}
{% for key, value in env_vars.items() %}
ENV {{ key }}="{{ value }}"
{% endfor %}
EXPOSE {{ port }}
{% if language == 'Python' %}
CMD ["python", "app.py"]
{% elif language == 'Node.js' %}
CMD ["npm", "start"]
{% elif language == 'Go' %}
CMD ["./main"]
{% elif language == 'Java' %}
CMD ["java", "-jar", "target/app.jar"]
{% endif %}
"""
    
    compose_template = """version: '3.8'
services:
  app:
    build: .
    ports:
      - '{{ port }}:{{ port }}'
{% if env_vars %}
    environment:
{% for key, value in env_vars.items() %}      - {{ key }}={{ value }}
{% endfor %}
{% endif %}
{% if 'PostgreSQL' in services %}
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: dbname
    ports:
      - '5432:5432'
{% endif %}
{% if 'MySQL' in services %}
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: dbname
    ports:
      - '3306:3306'
{% endif %}
{% if 'Redis' in services %}
  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
{% endif %}
{% if 'MongoDB' in services %}
  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - '27017:27017'
{% endif %}
"""

    k8s_deployment_template = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ app_name }}-deployment
  labels:
    app: {{ app_name }}
spec:
  replicas: {{ replicas }}
  selector:
    matchLabels:
      app: {{ app_name }}
  template:
    metadata:
      labels:
        app: {{ app_name }}
    spec:
      containers:
      - name: {{ app_name }}-container
        image: {{ container_image }}
        ports:
        - containerPort: {{ port }}
{% if env_vars %}
        env:
{% for key, value in env_vars.items() %}        - name: {{ key }}
          value: "{{ value }}"
{% endfor %}
{% endif %}
        resources:
          limits:
            memory: "{{ memory_limit }}"
            cpu: "{{ cpu_limit }}"
          requests:
            memory: "256Mi"
            cpu: "250m"
"""

    k8s_service_template = """apiVersion: v1
kind: Service
metadata:
  name: {{ app_name }}-service
spec:
  type: {{ service_type }}
  selector:
    app: {{ app_name }}
  ports:
    - protocol: TCP
      port: 80
      targetPort: {{ port }}
"""
    
    helm_chart_template = """apiVersion: v2
name: {{ app_name }}
description: A Helm chart for {{ app_name }} ({{ framework }})
type: application
version: 0.1.0
appVersion: "1.0.0"
"""

    helm_values_template = """replicaCount: {{ replicas }}

image:
  repository: {{ container_image.split(':')[0] }}
  tag: "{{ container_image.split(':')[1] if ':' in container_image else 'latest' }}"
  pullPolicy: IfNotPresent

service:
  type: {{ service_type }}
  port: 80
  targetPort: {{ port }}

resources:
  limits:
    cpu: {{ cpu_limit }}
    memory: {{ memory_limit }}
  requests:
    cpu: 250m
    memory: 256Mi
{% if env_vars %}
env:
{% for key, value in env_vars.items() %}  {{ key }}: "{{ value }}"
{% endfor %}{% endif %}
"""

    helm_deployment_template = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ "{{" }} .Release.Name {{ "}}" }}-{{ app_name }}
  labels:
    app: {{ "{{" }} .Release.Name {{ "}}" }}
spec:
  replicas: {{ "{{" }} .Values.replicaCount {{ "}}" }}
  selector:
    matchLabels:
      app: {{ "{{" }} .Release.Name {{ "}}" }}
  template:
    metadata:
      labels:
        app: {{ "{{" }} .Release.Name {{ "}}" }}
    spec:
      containers:
      - name: {{ app_name }}
        image: "{{ "{{" }} .Values.image.repository {{ "}}" }}:{{ "{{" }} .Values.image.tag {{ "}}" }}"
        ports:
        - containerPort: {{ "{{" }} .Values.service.targetPort {{ "}}" }}
        resources:
          {{"{{-"}} toYaml .Values.resources | nindent 10 {{ "}}"}}
"""

    d_content = Template(dockerfile_template).render(**config.dict())
    c_content = Template(compose_template).render(**config.dict())
    k8s_dep_content = Template(k8s_deployment_template).render(**config.dict())
    k8s_svc_content = Template(k8s_service_template).render(**config.dict())
    helm_chart_content = Template(helm_chart_template).render(**config.dict())
    helm_values_content = Template(helm_values_template).render(**config.dict())
    helm_deployment_content = Template(helm_deployment_template).render(**config.dict())
    
    return {
        "dockerfile": d_content,
        "compose": c_content,
        "k8s_deployment": k8s_dep_content,
        "k8s_service": k8s_svc_content,
        "helm_chart": helm_chart_content,
        "helm_values": helm_values_content,
        "helm_deployment": helm_deployment_content,
    }

@app.get("/")
def read_root():
    return {"status": "ok", "message": "DevFlow Studio API is running"}

@app.post("/generate")
def generate_infrastructure(config: ProjectConfig):
    return get_generated_files(config)

@app.post("/export")
def export_zip(config: ProjectConfig):
    files = get_generated_files(config)
    
    # Create zip file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        zip_file.writestr("Dockerfile", files["dockerfile"])
        zip_file.writestr("compose.yaml", files["compose"])
        zip_file.writestr("k8s/deployment.yaml", files["k8s_deployment"])
        zip_file.writestr("k8s/service.yaml", files["k8s_service"])
        zip_file.writestr("helm/Chart.yaml", files["helm_chart"])
        zip_file.writestr("helm/values.yaml", files["helm_values"])
        zip_file.writestr("helm/templates/deployment.yaml", files["helm_deployment"])
        zip_file.writestr("README.md", "# DevFlow Studio Generated Infrastructure\n\nGenerated files for " + config.framework)
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=devflow-infrastructure.zip"}
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


def generate_pipeline_content(config: PipelineConfig) -> str:
    github_actions_template = """name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
{% if 'Checkout' in stages %}      - name: Checkout code
        uses: actions/checkout@v4
{% endif %}{% if 'Install' in stages %}
      - name: Set up environment
{% if language == 'Python' %}        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
{% elif language == 'Node.js' %}        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
{% elif language == 'Go' %}        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - run: go mod download
{% elif language == 'Java' %}        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
{% endif %}{% endif %}{% if 'Test' in stages %}
      - name: Run tests
{% if language == 'Python' %}        run: pytest
{% elif language == 'Node.js' %}        run: npm test
{% elif language == 'Go' %}        run: go test ./...
{% elif language == 'Java' %}        run: mvn test
{% endif %}{% endif %}{% if 'Lint' in stages %}
      - name: Lint
{% if language == 'Python' %}        run: pip install flake8 && flake8 .
{% elif language == 'Node.js' %}        run: npm run lint
{% endif %}{% endif %}{% if 'SAST' in stages %}
      - name: SAST Security Scan
        uses: github/codeql-action/analyze@v3
{% endif %}{% if 'Build' in stages %}
      - name: Build Docker image
        run: docker build -t {{ registry }}/{{ app_name }}:${{ '{{' }} github.sha {{ '}}' }} .
{% endif %}{% if 'Push Image' in stages %}
      - name: Push Docker image
        run: |
          echo ${{ '{{' }} secrets.DOCKER_PASSWORD {{ '}}' }} | docker login -u ${{ '{{' }} secrets.DOCKER_USERNAME {{ '}}' }} --password-stdin
          docker push {{ registry }}/{{ app_name }}:${{ '{{' }} github.sha {{ '}}' }}
{% endif %}{% if 'Deploy' in stages %}
      - name: Deploy
        run: kubectl apply -f k8s/
{% endif %}
"""

    gitlab_ci_template = """stages:
{% for stage in stages %}  - {{ stage | lower | replace(' ', '_') }}
{% endfor %}
{% if 'Checkout' in stages %}checkout:
  stage: checkout
  script:
    - echo "Checking out code..."
{% endif %}{% if 'Install' in stages %}
install:
  stage: install
  script:
{% if language == 'Python' %}    - pip install -r requirements.txt
{% elif language == 'Node.js' %}    - npm install
{% elif language == 'Go' %}    - go mod download
{% endif %}{% endif %}{% if 'Test' in stages %}
test:
  stage: test
  script:
{% if language == 'Python' %}    - pytest
{% elif language == 'Node.js' %}    - npm test
{% elif language == 'Go' %}    - go test ./...
{% endif %}{% endif %}{% if 'Build' in stages %}
build:
  stage: build
  script:
    - docker build -t {{ registry }}/{{ app_name }}:$CI_COMMIT_SHA .
{% endif %}{% if 'Push Image' in stages %}
push_image:
  stage: push_image
  script:
    - docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
    - docker push {{ registry }}/{{ app_name }}:$CI_COMMIT_SHA
{% endif %}{% if 'Deploy' in stages %}
deploy:
  stage: deploy
  script:
    - kubectl apply -f k8s/
{% endif %}
"""

    azure_devops_template = """trigger:
  - main

pool:
  vmImage: ubuntu-latest

steps:
{% if 'Checkout' in stages %}  - checkout: self
{% endif %}{% if 'Install' in stages %}
{% if language == 'Python' %}  - task: UsePythonVersion@0
    inputs:
      versionSpec: '3.12'
  - script: pip install -r requirements.txt
    displayName: Install dependencies
{% elif language == 'Node.js' %}  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
  - script: npm install
    displayName: Install dependencies
{% endif %}{% endif %}{% if 'Test' in stages %}
{% if language == 'Python' %}  - script: pytest
    displayName: Run tests
{% elif language == 'Node.js' %}  - script: npm test
    displayName: Run tests
{% endif %}{% endif %}{% if 'Build' in stages %}
  - task: Docker@2
    displayName: Build Docker image
    inputs:
      command: build
      repository: {{ registry }}/{{ app_name }}
      tags: $(Build.BuildId)
{% endif %}{% if 'Push Image' in stages %}
  - task: Docker@2
    displayName: Push Docker image
    inputs:
      command: push
      repository: {{ registry }}/{{ app_name }}
      tags: $(Build.BuildId)
{% endif %}{% if 'Deploy' in stages %}
  - task: Kubernetes@1
    displayName: Deploy to Kubernetes
    inputs:
      command: apply
      arguments: -f k8s/
{% endif %}
"""

    if config.target == "github-actions":
        return Template(github_actions_template).render(**config.dict())
    elif config.target == "gitlab-ci":
        return Template(gitlab_ci_template).render(**config.dict())
    elif config.target == "azure-devops":
        return Template(azure_devops_template).render(**config.dict())
    return ""

@app.post("/generate/pipeline")
def generate_pipeline(config: PipelineConfig):
    return {"pipeline": generate_pipeline_content(config)}

@app.post("/export/pipeline")
def export_pipeline_zip(config: PipelineConfig):
    content = generate_pipeline_content(config)
    
    # Determine file name based on target
    file_names = {
        "github-actions": ".github/workflows/ci.yml",
        "gitlab-ci": ".gitlab-ci.yml",
        "azure-devops": "azure-pipelines.yml",
    }
    file_name = file_names.get(config.target, "pipeline.yml")
    readme_content = f"# {config.app_name} - CI/CD Pipeline\n\nGenerated by DevFlow Studio.\n\nTarget: {config.target}\nStages: {', '.join(config.stages)}"
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        zip_file.writestr(file_name, content)
        zip_file.writestr("README.md", readme_content)
    
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={config.app_name}-pipeline.zip"}
    )

@app.post("/push-to-github")
async def push_to_github(request: GithubPushRequest):
    files = get_generated_files(request.config)
    token = request.token
    repo_name = request.repo_name
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient() as client:
        # Get authenticated user
        user_resp = await client.get("https://api.github.com/user", headers=headers)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid GitHub token")
        username = user_resp.json()["login"]

        # Create repository
        create_resp = await client.post(
            "https://api.github.com/user/repos",
            headers=headers,
            json={"name": repo_name, "private": request.private, "auto_init": False}
        )
        if create_resp.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail=create_resp.json().get("message", "Failed to create repo"))

        # Push all files
        import base64
        files_to_push = {
            "Dockerfile": files["dockerfile"],
            "compose.yaml": files["compose"],
            "k8s/deployment.yaml": files["k8s_deployment"],
            "k8s/service.yaml": files["k8s_service"],
            "helm/Chart.yaml": files["helm_chart"],
            "helm/values.yaml": files["helm_values"],
            "helm/templates/deployment.yaml": files["helm_deployment"],
            "README.md": f"# {repo_name}\n\nGenerated by DevFlow Studio for {request.config.framework}.",
        }
        for path, content in files_to_push.items():
            encoded = base64.b64encode(content.encode()).decode()
            await client.put(
                f"https://api.github.com/repos/{username}/{repo_name}/contents/{path}",
                headers=headers,
                json={"message": f"feat: add {path}", "content": encoded}
            )

    return {"repo_url": f"https://github.com/{username}/{repo_name}"}
