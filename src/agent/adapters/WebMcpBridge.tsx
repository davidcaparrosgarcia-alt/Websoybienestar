import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDocumentModelContext,
  registerSoyBienestarWebMcpTools,
} from "./webmcp";

function readBuildEnvironment(): Readonly<Record<string, unknown>> | undefined {
  return (import.meta as ImportMeta & { readonly env?: Readonly<Record<string, unknown>> }).env;
}

export function isSoyBienestarWebMcpBridgeEnabled(
  env: Readonly<Record<string, unknown>> | undefined = readBuildEnvironment(),
): boolean {
  return (
    env?.VITE_WEBMCP_ENABLED === "true" &&
    env?.VITE_WEBMCP_DIRECT_NAVIGATION_ENABLED === "true"
  );
}

export default function WebMcpBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    // WebMCP tools currently navigate when the external agent executes them.
    // Require an explicit double opt-in until a human-confirmation contract is guaranteed.
    if (!isSoyBienestarWebMcpBridgeEnabled()) return;

    const registration = registerSoyBienestarWebMcpTools({
      modelContext: getDocumentModelContext(),
      navigate: (path) => navigate(path),
    });
    void registration.ready.catch(() => undefined);

    return registration.cleanup;
  }, [navigate]);

  return null;
}
