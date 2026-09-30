"""Kate (Gemini Flash-Lite version): tool-calling agent for the context-engine demo.

Setup:
    pip install -U google-genai
    export GEMINI_API_KEY="your_key"      # Git Bash; keep the key out of git

Optional: pick another model without editing code
    export GEMINI_MODEL="gemini-2.5-flash-lite"
"""
import json
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

load_dotenv()  # reads GEMINI_API_KEY (and optional GEMINI_MODEL) from a .env file

# Check AI Studio's model list if this ID is rejected (names change often).
MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
MAX_CALLS = 5  # cap on automatic tool calls per event

client = genai.Client()  # reads GEMINI_API_KEY from the environment

SYSTEM = (
    "You are Kate, a proactive customer-service assistant. You receive an event "
    "and the customer's context. Decide what needs to happen and do it with your "
    "tools without waiting to be asked. When done, summarise what you did."
)

# ---- Shared state: who they are, what they want, what already happened ----
context = {
    "person": {"name": "Sam", "address": "Oude Markt 1, Leuven", "email": "sam@example.com"},
    "wants": ["keep my address up to date everywhere", "tell me when something changes"],
    "events": [],
    "actions_log": [],
}


# ---- Tools: plain functions. Gemini reads the name, type hints, and docstring. ----
def change_address(new_address: str) -> dict:
    """Update the customer's address on file.

    Args:
        new_address: The full new address, e.g. "Naamsestraat 20, Leuven".
    """
    old = context["person"]["address"]
    context["person"]["address"] = new_address
    context["actions_log"].append(f"address changed: {old} -> {new_address}")
    return {"old_address": old, "new_address": new_address}


def send_notification(message: str) -> dict:
    """Send the customer a short notification about something that happened.

    Args:
        message: The text to send to the customer.
    """
    context["actions_log"].append(f"notified {context['person']['email']}: {message}")
    return {"sent": True, "to": context["person"]["email"], "message": message}


def create_ticket(title: str, details: str) -> dict:
    """Open a support ticket for something that needs human follow-up.

    Args:
        title: Short summary of the issue.
        details: What a human agent needs to know to handle it.
    """
    ticket_id = f"T-{len(context['actions_log']) + 1:03d}"
    context["actions_log"].append(f"ticket {ticket_id}: {title}")
    return {"ticket_id": ticket_id, "title": title, "details": details}


def check_order_status(order_id: str) -> dict:
    """Look up the status of an order by its ID.

    Args:
        order_id: The order identifier, e.g. "A123".
    """
    # Mocked: swap for a real lookup if time allows
    return {"order_id": order_id, "status": "shipped", "eta_days": 2}


# ---- Registry: one place to add, remove, or toggle tools (service-builder idea) ----
FUNCTIONS = {f.__name__: f for f in (change_address, send_notification, create_ticket, check_order_status)}


# ---- Agent ----
def run_kate(event: str, enabled: list[str] | None = None) -> str:
    """Handle one event. `enabled` limits which tools Kate may use (None = all)."""
    context["events"].append(event)
    tools = [fn for name, fn in FUNCTIONS.items() if enabled is None or name in enabled]
    prompt = f"Event: {event}\n\nCustomer context:\n{json.dumps(context, indent=2)}"

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM,
        tools=tools,  # the SDK builds schemas and runs the call loop for you
        automatic_function_calling=types.AutomaticFunctionCallingConfig(
            maximum_remote_calls=MAX_CALLS
        ),
    )

    # Free tier has low rate limits: retry with backoff on 429
    for attempt in range(4):
        try:
            resp = client.models.generate_content(model=MODEL, contents=prompt, config=config)
            return resp.text or "(no text reply; check actions_log)"
        except errors.APIError as e:
            if e.code == 429 and attempt < 3:
                wait = 5 * 2**attempt  # 5s, 10s, 20s
                print(f"Rate limited, retrying in {wait}s...")
                time.sleep(wait)
                continue
            raise


if __name__ == "__main__":
    print(run_kate("Customer is moving to Naamsestraat 20, Leuven next week."))
    print("\nState after run:")
    print(json.dumps(context, indent=2))