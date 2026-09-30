# Kate API

Kate is a proactive customer-service assistant. You send her an **event** (something that happened to a customer), and she decides which **tools** to use (change address, send a notification, open a ticket, check an order) and does it. The API returns her summary and the updated customer state.

- Format: JSON over HTTP
- Auth: none (local demo)
- CORS: enabled for all origins, so a browser front end on another port can call it
- Interactive docs (Swagger UI): `{BASE_URL}/docs`

## Base URL

| Situation | Base URL |
|---|---|
| Running on the same machine | `http://127.0.0.1:8000` |
| Teammate on the same Wi-Fi/network | `http://<host-laptop-ip>:8000` (host must start the server with `uvicorn server:app --host 0.0.0.0 --reload` and allow it through the Windows firewall) |

## Data shapes

### Context

The shared customer state, returned by every endpoint.

```json
{
  "person": {
    "name": "Sam",
    "address": "Oude Markt 1, Leuven",
    "email": "sam@example.com"
  },
  "wants": [
    "keep my address up to date everywhere",
    "tell me when something changes"
  ],
  "events": ["Customer is moving to Naamsestraat 20, Leuven next week."],
  "actions_log": [
    "address changed: Oude Markt 1, Leuven -> Naamsestraat 20, Leuven",
    "notified sam@example.com: Your address has been updated."
  ]
}
```

| Field | Type | Meaning |
|---|---|---|
| `person` | object | Who the customer is (`name`, `address`, `email`) |
| `wants` | string[] | Standing preferences Kate should respect |
| `events` | string[] | Every event sent so far |
| `actions_log` | string[] | Human-readable list of what Kate actually did. Good for an activity feed. |

### Tools

Kate can use these tools. Use the names in the `enabled` field of `POST /api/event`.

| Tool name | What it does |
|---|---|
| `change_address` | Updates the customer's address |
| `send_notification` | Sends the customer a short message |
| `create_ticket` | Opens a support ticket for human follow-up |
| `check_order_status` | Looks up an order (mocked data) |

The list of names is also returned by `GET /api/state`, so the front end doesn't need to hard-code it.

---

## Endpoints

### 1. `GET /api/state`

Returns the current customer state and the available tool names. Call this on page load.

**Request:** no body.

**Response `200`:**
```json
{
  "context": { "...": "see Context above" },
  "tools": ["change_address", "send_notification", "create_ticket", "check_order_status"]
}
```

**Example:**
```bash
curl http://127.0.0.1:8000/api/state
```

```js
const { context, tools } = await (await fetch(`${BASE_URL}/api/state`)).json();
```

---

### 2. `POST /api/event`

Sends Kate an event. She decides which tools to use, runs them, and replies with a summary.

**Request body (JSON):**

| Field | Type | Required | Meaning |
|---|---|---|---|
| `event` | string | yes | What happened, in plain language |
| `enabled` | string[] | no | Tool names Kate may use. Omit to allow all. An empty list means no tools. |

```json
{
  "event": "Customer is moving to Naamsestraat 20, Leuven next week.",
  "enabled": ["change_address", "send_notification"]
}
```

**Response `200`:**
```json
{
  "reply": "I updated your address to Naamsestraat 20, Leuven and sent you a confirmation.",
  "error": null,
  "context": { "...": "updated Context" }
}
```

| Field | Type | Meaning |
|---|---|---|
| `reply` | string or null | Kate's summary of what she did. `null` if there was an error. |
| `error` | string or null | Error text if the model call failed (bad key, rate limit, wrong model). `null` on success. |
| `context` | object | The updated customer state |

**Important:** model failures come back as `200` with `error` filled in, not as an HTTP error. Always check `error`.

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/event \
  -H "Content-Type: application/json" \
  -d '{"event": "Customer is moving to Naamsestraat 20, Leuven next week."}'
```

```js
const res = await fetch(`${BASE_URL}/api/event`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    event: "Customer is moving to Naamsestraat 20, Leuven next week.",
    enabled: ["change_address", "send_notification"], // optional
  }),
});
const { reply, error, context } = await res.json();
if (error) {
  // show the error message in the UI
} else {
  // show `reply` as Kate's message; render context.actions_log as the activity feed
}
```

**Other status codes:** `422` if the body is malformed (for example `event` is missing or isn't a string).

---

### 3. `POST /api/reset`

Puts the customer state back to its starting values. Use it between demo runs.

**Request:** no body.

**Response `200`:**
```json
{ "context": { "...": "starting Context" } }
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/reset
```

---

## Behavior to know about

- **It can be slow.** One event may trigger several model and tool calls, so expect a few seconds. Show a loading state and disable the submit button while waiting.
- **State is shared.** The customer state lives in the server's memory. All users see the same customer, and restarting the server resets it. Call `/api/reset` to reset without restarting.
- **Rate limits.** The server uses a free-tier model, so rapid repeated requests can return an `error` mentioning rate limits. The server retries automatically a few times; if it still fails, wait a minute.
- **Tools are mocked.** `check_order_status` returns fake data, and nothing is actually emailed or changed outside the server's memory.
- **Suggested UI mapping:**
  - Customer card: `context.person`
  - Kate's message: `reply`
  - Activity feed: `context.actions_log`
  - Tool toggles (checkboxes): `tools` from `GET /api/state`, sent back as `enabled`
  - Reset button: `POST /api/reset`