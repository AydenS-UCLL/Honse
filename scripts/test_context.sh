#!/usr/bin/env bash
# Quick smoke test for the context module. Usage:
#   bash scripts/test_context.sh [BASE_URL]
set -euo pipefail
BASE="${1:-http://localhost:8080}"
API="$BASE/api/public/profiles"

echo "== 1. GET /profiles"
curl -s "$API" | head -40

echo; echo "== 2. GET /profiles/moving-alex"
curl -s "$API/moving-alex" | head -40

echo; echo "== 3. GET /profiles/moving-alex/suggestions"
curl -s "$API/moving-alex/suggestions"

echo; echo "== 3b. Overview + engine (should say \"llm\" when GEMINI_API_KEY is set)"
curl -s "$API/moving-alex/suggestions" | grep -E '"(engine|llm_error|headline|summary)"'

echo; echo "== 4. GET /profiles/overspending-jordan/suggestions"
curl -s "$API/overspending-jordan/suggestions"

echo; echo "== 5. POST /profiles/overspending-jordan/events"
curl -s -X POST "$API/overspending-jordan/events" \
  -H 'content-type: application/json' \
  -d '{"type":"bill_increased","payload":{"provider":"ComEd","amount":45}}'

echo; echo "== 6. 404 check"
curl -s -o /dev/null -w '%{http_code}\n' "$API/nope"
echo "done"
