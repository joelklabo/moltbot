import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createConfigIO } from "./io.js";

async function withTempHome(run: (home: string) => Promise<void>): Promise<void> {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-config-"));
  try {
    await run(home);
  } finally {
    await fs.rm(home, { recursive: true, force: true });
  }
}

async function writeConfig(
  home: string,
  dirname: ".openclaw",
  port: number,
  filename: string = "openclaw.json",
) {
  const dir = path.join(home, dirname);
  await fs.mkdir(dir, { recursive: true });
  const configPath = path.join(dir, filename);
  await fs.writeFile(configPath, JSON.stringify({ gateway: { port } }, null, 2));
  return configPath;
}

async function writeConfigWithMeta(
  home: string,
  dirname: ".openclaw",
  meta: { lastTouchedVersion: string },
  filename: string = "openclaw.json",
) {
  const dir = path.join(home, dirname);
  await fs.mkdir(dir, { recursive: true });
  const configPath = path.join(dir, filename);
  await fs.writeFile(configPath, JSON.stringify({ meta }, null, 2));
  return configPath;
}

describe("config io paths", () => {
  it("uses ~/.openclaw/openclaw.json when config exists", async () => {
    await withTempHome(async (home) => {
      const configPath = await writeConfig(home, ".openclaw", 19001);
      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
      });
      expect(io.configPath).toBe(configPath);
      expect(io.loadConfig().gateway?.port).toBe(19001);
    });
  });

  it("defaults to ~/.openclaw/openclaw.json when config is missing", async () => {
    await withTempHome(async (home) => {
      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
      });
      expect(io.configPath).toBe(path.join(home, ".openclaw", "openclaw.json"));
    });
  });

  it("honors explicit OPENCLAW_CONFIG_PATH override", async () => {
    await withTempHome(async (home) => {
      const customPath = await writeConfig(home, ".openclaw", 20002, "custom.json");
      const io = createConfigIO({
        env: { OPENCLAW_CONFIG_PATH: customPath } as NodeJS.ProcessEnv,
        homedir: () => home,
      });
      expect(io.configPath).toBe(customPath);
      expect(io.loadConfig().gateway?.port).toBe(20002);
    });
  });

  it("does not warn when config was touched by a newer minor version", async () => {
    await withTempHome(async (home) => {
      await writeConfigWithMeta(home, ".openclaw", { lastTouchedVersion: "2026.2.1" });
      const warn = vi.fn();
      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
        logger: { warn },
      });
      io.loadConfig();
      expect(warn).not.toHaveBeenCalled();
    });
  });

  it("warns when config was touched by a newer major version", async () => {
    await withTempHome(async (home) => {
      await writeConfigWithMeta(home, ".openclaw", { lastTouchedVersion: "2027.0.0" });
      const warn = vi.fn();
      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
        logger: { warn },
      });
      io.loadConfig();
      expect(warn).toHaveBeenCalled();
    });
  });
});
