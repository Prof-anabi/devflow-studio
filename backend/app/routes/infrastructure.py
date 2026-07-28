import io
import zipfile

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from ..models.project import ProjectConfig
from ..services.generator import get_generated_files

router = APIRouter()


@router.get("/")
def read_root():
    return {"status": "ok", "message": "DevFlow Studio API is running"}


@router.post("/export")
def export_zip(config: ProjectConfig):
    files = get_generated_files(config)

    # Create zip file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        zip_file.writestr("Dockerfile", files["dockerfile"])
        zip_file.writestr("compose.yaml", files["compose"])
        zip_file.writestr("k8s/deployment.yaml", files["k8s_deployment"])
        zip_file.writestr("k8s/service.yaml", files["k8s_service"])
        if files["k8s_pvc"]:
            zip_file.writestr("k8s/persistent-volume-claim.yaml", files["k8s_pvc"])
        zip_file.writestr("helm/Chart.yaml", files["helm_chart"])
        zip_file.writestr("helm/values.yaml", files["helm_values"])
        zip_file.writestr("helm/templates/deployment.yaml", files["helm_deployment"])
        zip_file.writestr(
            "README.md",
            "# DevFlow Studio Generated Infrastructure\n\nGenerated files for " + config.framework,
        )

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=devflow-infrastructure.zip"},
    )


@router.post("/generate")
def generate_infrastructure(config: ProjectConfig):
    return get_generated_files(config)

