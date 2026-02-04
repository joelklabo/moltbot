type LoggingState = {
  cachedLogger: unknown;
  cachedSettings: unknown;
  cachedConsoleSettings: unknown;
  overrideSettings: unknown;
  consolePatched: boolean;
  forceConsoleToStderr: boolean;
  consoleTimestampPrefix: boolean;
  consoleSubsystemFilter: string[] | null;
  resolvingConsoleSettings: boolean;
  rawConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
  } | null;
};

const LOGGING_STATE = Symbol.for("openclaw.logging.state");

export const loggingState: LoggingState = (() => {
  const scope = globalThis as typeof globalThis & {
    [LOGGING_STATE]?: LoggingState;
  };
  if (!scope[LOGGING_STATE]) {
    scope[LOGGING_STATE] = {
      cachedLogger: null,
      cachedSettings: null,
      cachedConsoleSettings: null,
      overrideSettings: null,
      consolePatched: false,
      forceConsoleToStderr: false,
      consoleTimestampPrefix: false,
      consoleSubsystemFilter: null,
      resolvingConsoleSettings: false,
      rawConsole: null,
    };
  }
  return scope[LOGGING_STATE];
})();
