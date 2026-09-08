import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDocumentModelContext,
  registerSoyBienestarWebMcpTools,
} from "./webmcp";

export default function WebMcpBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const registration = registerSoyBienestarWebMcpTools({
      modelContext: getDocumentModelContext(),
      navigate: (path) => navigate(path),
    });
    void registration.ready.catch(() => undefined);

    return registration.cleanup;
  }, [navigate]);

  return null;
}
