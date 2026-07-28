from pydantic import BaseModel
from typing import Dict, List, Optional


class PersistentVolumeClaimConfig(BaseModel):
    name: str = "my-app-data"
    storage_size: str = "1Gi"
    storage_class_name: str = "standard"
    access_modes: List[str] = ["ReadWriteOnce"]


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
    persistent_volume_claim: Optional[PersistentVolumeClaimConfig] = None
    deployment_strategy: str = "RollingUpdate"

