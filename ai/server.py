"""API for Kate: any front end can call these endpoints.

    pip install fastapi uvicorn python-dotenv google-genai
    uvicorn server:app --reload          # http://127.0.0.1:8000  (docs at /docs)
"""
import copy

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from assistant import FUNCTIONS, context, run_kate

app = FastAPI(title="Kate API")

# Allow a front end on another port (Next.js, Vite, etc.) to call this API.
# "*" is fine for a local hackathon demo; restrict it for anything real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

INITIAL_CONTEXT = copy.deepcopy(context)


class EventIn(BaseModel):
    event: str
    enabled: list[str] | None = None  # tool names Kate may use; omit for all


@app.get("/api/state")
def get_state():
    """Current customer context plus the list of available tool names."""
    return {"context": context, "tools": list(FUNCTIONS)}


@app.post("/api/event")
def post_event(body: EventIn):
    """Trigger Kate with an event. Returns her summary and the updated context."""
    try:
        reply = run_kate(body.event, body.enabled)
    except Exception as e:  # surface errors to the front end instead of a bare 500
        return {"reply": None, "error": str(e), "context": context}
    return {"reply": reply, "error": None, "context": context}


@app.post("/api/reset")
def reset():
    """Put the context back to its starting state (handy between demo runs)."""
    context.clear()
    context.update(copy.deepcopy(INITIAL_CONTEXT))
    return {"context": context}