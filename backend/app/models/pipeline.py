from pydantic import BaseModel
from typing import List, Optional
from .project import ProjectConfig


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

