import type { NextConfig } from "next";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const rootEnvPath = resolve(__dirname, "../.env");

if (existsSync(rootEnvPath)) {
  const lines = readFileSync(rootEnvPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    if (key && process.env[key] === undefined) {
      process.env[key] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
