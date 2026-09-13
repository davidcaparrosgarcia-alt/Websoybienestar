import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDocumentModelContext,
  registerSoyBienestarWebMcpTools,
} from "./webmcp";

export default function WebMcpBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    // WebMCP is the public adapter for compatible browser agents. The adapter itself
    // keeps the emergency VITE_WEBMCP_ENABLED="false" kill switch and becomes a no-op
    // automatically when document.modelContext is not supported.
    const registration = registerSoyBienestarWebMcpTools({
      modelContext: getDocumentModelContext(),
      navigate: (path) => navigate(path),
    });
    void registration.ready.catch(() => undefined);

    return registration.cleanup;
  }, [navigate]);

  return null;
}
