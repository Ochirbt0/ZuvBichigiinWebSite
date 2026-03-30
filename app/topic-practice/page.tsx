"use client";

import { useMemo, useState } from "react";

type SpellcheckResult = {
  correctedText: string;
  originalText: string;
  hasChanges: boolean;
};

export default function TopicPracticePage() {
  const [grade, setGrade] = useState<number>(3);
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("easy");
  const [wordCount, setWordCount] = useState<number>(8);
  const [sentenceCount, setSentenceCount] = useState<number>(2);

  const [sentences, setSentences] = useState<string[]>([]);
  const [typed, setTyped] = useState<string[]>([]);
  const [spellResults, setSpellResults] = useState<(SpellcheckResult | null)[]>(
    [],
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [checkingIndex, setCheckingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(
    () => !isGenerating && wordCount > 0 && sentenceCount > 0,
    [isGenerating, wordCount, sentenceCount],
  );

  const generate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, level, wordCount, sentenceCount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Topic generation failed");
        return;
      }

      const nextSentences = Array.isArray(data?.sentences)
        ? data.sentences
        : [];
      setSentences(nextSentences);
      setTyped(nextSentences.map(() => ""));
      setSpellResults(nextSentences.map(() => null));
    } catch (e) {
      console.error(e);
      setError("Topic generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const playSentence = async (text: string, index: number) => {
    setPlayingIndex(index);
    setError(null);

    try {
      const res = await fetch("/api/audio-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Audio generation failed");
        return;
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (e) {
      console.error(e);
      setError("Audio play failed");
    } finally {
      setPlayingIndex(null);
    }
  };

  const checkSpelling = async (index: number) => {
    const text = typed[index]?.trim();
    if (!text) {
      setError("Эхлээд сонссон өгүүлбэрээ бичээрэй.");
      return;
    }

    setCheckingIndex(index);
    setError(null);

    try {
      const res = await fetch("/api/spellcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.error || "Spellcheck failed");
        return;
      }

      setSpellResults((prev) => {
        const next = [...prev];
        next[index] = data;
        return next;
      });
    } catch (e) {
      console.error(e);
      setError("Spellcheck failed");
    } finally {
      setCheckingIndex(null);
    }
  };

  return (
    <main className="container mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-bold">audio generate shalgah</h1>

      <div className="grid grid-cols-2 gap-3 rounded border p-3 md:grid-cols-4">
        <label className="text-sm">
          Grade
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            type="number"
            min={1}
            max={5}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          Level
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={level}
            onChange={(e) =>
              setLevel(e.target.value as "easy" | "medium" | "hard")
            }
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>

        <label className="text-sm">
          Words / sentence
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            type="number"
            min={1}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          Sentence count
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            type="number"
            min={1}
            value={sentenceCount}
            onChange={(e) => setSentenceCount(Number(e.target.value))}
          />
        </label>
      </div>

      <button
        onClick={generate}
        disabled={!canGenerate}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isGenerating ? "Generating..." : "Generate Sentences"}
      </button>

      {error && <p className="rounded bg-red-50 p-2 text-red-600">{error}</p>}

      <section className="space-y-4">
        {sentences.map((sentence, index) => (
          <div key={index} className="rounded border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-gray-600">Sentence {index + 1}</p>
              <button
                onClick={() => playSentence(sentence, index)}
                className="rounded border px-3 py-1"
              >
                {playingIndex === index ? "Playing..." : "Play"}
              </button>
            </div>

            <textarea
              value={typed[index] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setTyped((prev) => {
                  const next = [...prev];
                  next[index] = value;
                  return next;
                });
              }}
              className="w-full rounded border p-2"
              rows={3}
              placeholder="Сонссон өгүүлбэрээ энд бичнэ үү"
            />

            <button
              onClick={() => checkSpelling(index)}
              className="rounded bg-blue-600 px-3 py-1 text-white"
            >
              {checkingIndex === index ? "Checking..." : "Алдаа шалгах"}
            </button>

            {spellResults[index] && (
              <div className="rounded bg-gray-50 p-2 text-sm">
                <p>
                  <strong>Таны бичсэн:</strong>{" "}
                  {spellResults[index]?.originalText}
                </p>
                <p>
                  <strong>Зассан хувилбар:</strong>{" "}
                  {spellResults[index]?.correctedText}
                </p>
                <p>
                  <strong>Статус:</strong>{" "}
                  {spellResults[index]?.hasChanges
                    ? "Алдаа засагдсан"
                    : "Алдаа олдсонгүй"}
                </p>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
