from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx

app = FastAPI(title="PR Review System API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# we can say this work as a serializer
class AnalyzePRRequest(BaseModel):
    repo_url:str
    pr_number:int
    github_token: Optional[str]=None

@app.post("/start_task")
async def start_task_endpoint(task_request:AnalyzePRRequest):
    data={
        "repo_url": task_request.repo_url,
        "pr_number": task_request.pr_number,
        "github_token": task_request.github_token

    }

    async with httpx.AsyncClient() as client:
        response=await client.post(
            "http://127.0.0.1:8080/start_task/",
            data=data

        )
        if response.status_code!=200:
            return {"error":"failed to start task","details":response.text}
    print(data)
    task_id=response.json().get('task_id')
    return{"task_id":task_id,"status":"task started"}


@app.get("/task_status/{task_id}/")
async def task_status_endpoint(task_id:str):
    async with httpx.AsyncClient() as client:
        response=await client.get(
            f"http://127.0.0.1:8080/task_status_view/{task_id}/",
        )
        return response.json()
    return {"message":"something went wrong"}
