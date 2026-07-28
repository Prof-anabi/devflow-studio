from fastapi import APIRouter

from ..models.pipeline import GithubPushRequest
from ..services.github import push_to_github

router = APIRouter()


@router.post("/push-to-github")
async def push_to_github_endpoint(request: GithubPushRequest):
    repo_url = await push_to_github(request)
    return {"repo_url": repo_url}

