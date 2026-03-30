import { NextRequest, NextResponse } from "next/server";

type SpellcheckResponse = {
  correctedText: string;
  originalText: string;
  hasChanges: boolean;
  originalDataFromAPI: unknown;
};

const getCorrectedText = (
  originalDataFromAPI: unknown,
  fallback: string,
): string => {
  if (!originalDataFromAPI || typeof originalDataFromAPI !== "object")
    return fallback;

  const data = originalDataFromAPI as Record<string, unknown>;
  const candidates = [
    data.correctedText,
    data.corrected_text,
    data.text,
    data.result,
  ];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) {
      return item;
    }

    if (item && typeof item === "object") {
      const nested = item as Record<string, unknown>;
      if (typeof nested.text === "string" && nested.text.trim()) {
        return nested.text;
      }
      if (
        typeof nested.correctedText === "string" &&
        nested.correctedText.trim()
      ) {
        return nested.correctedText;
      }
    }
  }

  return fallback;
};

const trySpellcheck = async (text: string) => {
  const token =
    process.env.CHIMEGE_API_SPELL_CHECK?.trim() ||
    process.env.CHIMEGE_API_KEY?.trim();

  if (!token) {
    return {
      ok: false,
      status: 500,
      error: "Missing CHIMEGE_API_SPELL_CHECK",
    } as const;
  }

  const configuredUrl = process.env.CHIMEGE_SPELLCHECK_URL?.trim();

  const endpoints = [
    configuredUrl,
    "https://api.chimege.com/v1.2/spell-check",
    "https://api.chimege.com/v1.2/spellcheck",
    "https://api.chimege.com/v1.2/check-spell",
  ].filter(Boolean) as string[];

  const errors: Array<{ endpoint: string; status: number; detail: string }> =
    [];

  for (const endpoint of endpoints) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    const bodyText = await res.text();

    if (!res.ok) {
      errors.push({
        endpoint,
        status: res.status,
        detail: bodyText,
      });
      continue;
    }

    let originalDataFromAPI: unknown = bodyText;
    try {
      originalDataFromAPI = JSON.parse(bodyText);
    } catch {
      originalDataFromAPI = bodyText;
    }

    const correctedText = getCorrectedText(originalDataFromAPI, text);
    return {
      ok: true,
      payload: {
        correctedText,
        originalText: text,
        hasChanges: correctedText !== text,
        originalDataFromAPI,
      } satisfies SpellcheckResponse,
    } as const;
  }

  return {
    ok: false,
    status: 502,
    error: "Chimege spellcheck failed on all known endpoints",
    detail: errors,
  } as const;
};

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const result = await trySpellcheck(text);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          detail: "detail" in result ? result.detail : undefined,
        },
        { status: "status" in result ? result.status : 500 },
      );
    }

    return NextResponse.json(result.payload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
