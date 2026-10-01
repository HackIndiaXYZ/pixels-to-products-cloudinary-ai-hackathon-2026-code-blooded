import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { env } from "@/lib/env";
import { log } from "@/lib/log";

// Tried in order. Verified Oct 1: the newest Flash models were returning 503 "high demand", so a single
// model would make Ask fail exactly when traffic peaks (e.g. during judging). Override with GEMINI_MODELS.
export const DEFAULT_MODELS = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];

export class AiUnconfigured extends Error {}

let client: GoogleGenAI | undefined;

function models(): string[] {
  const configured = env().GEMINI_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return configured?.length ? configured : DEFAULT_MODELS;
}

// Zod is the single source of truth: the same schema constrains Gemini's JSON output and validates it.
function jsonSchemaFor(schema: z.ZodType): unknown {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema; // Gemini rejects the meta-schema key
  return json;
}

// One structured call with a model fallback chain: the first model that answers with schema-valid JSON wins.
export async function generateJson<T extends z.ZodType>(
  schema: T,
  { system, prompt, timeoutMs = 12_000, task }: { system: string; prompt: string; timeoutMs?: number; task: string },
): Promise<{ data: z.infer<T>; model: string }> {
  const apiKey = env().GEMINI_API_KEY;
  if (!apiKey) throw new AiUnconfigured("GEMINI_API_KEY is not set");
  client ??= new GoogleGenAI({ apiKey });
  const responseJsonSchema = jsonSchemaFor(schema);

  let lastError: unknown;
  for (const model of models()) {
    const started = Date.now();
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema,
          abortSignal: AbortSignal.timeout(timeoutMs),
        },
      });
      const data = schema.parse(JSON.parse(response.text ?? ""));
      log("ai.done", { task, model, ms: Date.now() - started });
      return { data, model };
    } catch (error) {
      lastError = error;
      log("ai.model_failed", {
        task,
        model,
        ms: Date.now() - started,
        error: error instanceof Error ? error.message.slice(0, 160) : String(error),
      });
    }
  }
  throw lastError ?? new Error("no model answered");
}
