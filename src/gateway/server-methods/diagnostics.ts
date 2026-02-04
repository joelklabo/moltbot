import type { GatewayRequestHandlers } from "./types.js";
import { emitDiagnosticEvent } from "../../infra/diagnostic-events.js";
import { createSubsystemLogger } from "../../logging/subsystem.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateDiagnosticsOtelTestParams,
} from "../protocol/index.js";

const diagLogger = createSubsystemLogger("diagnostic");

function normalizeLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, 120);
}

export const diagnosticsHandlers: GatewayRequestHandlers = {
  "diagnostics.otel-test": ({ params, respond }) => {
    if (!validateDiagnosticsOtelTestParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid diagnostics.otel-test params: ${formatValidationErrors(
            validateDiagnosticsOtelTestParams.errors,
          )}`,
        ),
      );
      return;
    }

    const p = params as { label?: string };
    const label = normalizeLabel(p.label);
    const now = Date.now();
    const messageId = `otel-test-${now}`;
    const sessionKey = label ? `otel-test:${label}` : "otel-test";

    emitDiagnosticEvent({
      type: "message.step",
      step: "otel-test",
      channel: "gateway",
      messageId,
      sessionKey,
      durationMs: 0,
    });

    diagLogger.info(`diagnostics otel self-test${label ? ` (${label})` : ""}`);

    const payload: Record<string, string | boolean> = {
      ok: true,
      messageId,
      sessionKey,
      timestamp: new Date(now).toISOString(),
    };
    if (label) {
      payload.label = label;
    }
    respond(true, payload);
  },
};
