import os
from typing import Dict
from jinja2 import Environment, FileSystemLoader, select_autoescape

from ..models.project import ProjectConfig

# Set up Jinja2 loader for templates directory
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(default=False),
)


def get_generated_files(config: ProjectConfig) -> Dict[str, str]:
    """Generate all infrastructure files from the project configuration."""
    config_dict = config.dict()

    files = {
        "dockerfile": env.get_template("Dockerfile.j2").render(**config_dict),
        "compose": env.get_template("compose.yaml.j2").render(**config_dict),
        "k8s_deployment": env.get_template("k8s_deployment.yaml.j2").render(**config_dict),
        "k8s_service": env.get_template("k8s_service.yaml.j2").render(**config_dict),
        "k8s_pvc": "",
        "helm_chart": env.get_template("helm_chart.yaml.j2").render(**config_dict),
        "helm_values": env.get_template("helm_values.yaml.j2").render(**config_dict),
        "helm_deployment": env.get_template("helm_deployment.yaml.j2").render(**config_dict),
    }

    if config.persistent_volume_claim:
        files["k8s_pvc"] = env.get_template("k8s_pvc.yaml.j2").render(**config_dict)

    return files

