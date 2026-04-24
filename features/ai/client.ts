import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

export function openai(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured. Add it to .env.local or Vercel env.");
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

export const OPENAI_MODEL = "gpt-4o-mini";
