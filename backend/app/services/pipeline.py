import os
from jinja2 import Environment, FileSystemLoader, select_autoescape

from ..models.pipeline import PipelineConfig

# Set up Jinja2 loader for templates directory
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(default=False),
)

TEMPLATE_MAP = {
    "github-actions": "pipeline_github.j2",
    "gitlab-ci": "pipeline_gitlab.j2",
    "azure-devops": "pipeline_azure.j2",
}


def generate_pipeline_content(config: PipelineConfig) -> str:
    """Generate CI/CD pipeline content based on config."""
    template_name = TEMPLATE_MAP.get(config.target)
    if not template_name:
        raise ValueError(f"Unknown pipeline target: {config.target}")
    return env.get_template(template_name).render(**config.dict())

