"use client";

import { useState } from "react";

export default function Home() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateTopicSentences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: 3,
          level: "easy",
          wordCount: 8,
          sentenceCount: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        return;
      }

      setSentences(data.sentences ?? []);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    const res = await fetch("/api/audio-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  };

  return (
    <div>
      <button onClick={generateTopicSentences} disabled={loading}>
        {loading ? "Generating..." : "Generate Topic Sentences"}
      </button>

      {sentences.map((s, i) => (
        <div key={i} style={{ marginTop: 12 }}>
          <p>{s}</p>
          <button onClick={() => playTTS(s)}>Play</button>
        </div>
      ))}
    </div>
  );
}
