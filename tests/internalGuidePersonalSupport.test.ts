import test from "node:test";
import assert from "node:assert/strict";
import { interpretInternalGuideText } from "../src/agent/internalGuideAI";

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

test("client accepts the closed personal_support process reason", async () => {
  const fetchImpl = (async () =>
    response({
      status: "process_guidance",
      reason: "personal_support",
      message: "Puedo acompañarte hacia el recorrido adecuado.",
    })) as typeof fetch;

  const result = await interpretInternalGuideText("me encuentro solo y deprimido", { fetchImpl });
  assert.deepEqual(result, {
    status: "process_guidance",
    reason: "personal_support",
    message: "Puedo acompañarte hacia el recorrido adecuado.",
  });
});

test("client rejects an invented process reason", async () => {
  const fetchImpl = (async () =>
    response({
      status: "process_guidance",
      reason: "therapy_chat",
      message: "Continúa aquí.",
    })) as typeof fetch;

  const result = await interpretInternalGuideText("texto válido", { fetchImpl });
  assert.equal(result.status, "temporarily_unavailable");
});
