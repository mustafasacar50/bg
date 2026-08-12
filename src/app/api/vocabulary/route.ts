import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    // Map moduleId to vocabulary file
    const vocabDir = path.join(process.cwd(), "src/data/vocabulary");
    
    // Try to find vocab file for this module
    const moduleMap: Record<string, string> = {
      "balgoc___Bulgarca_A1_Ders_1_2": "vocab_ders_1_2.json",
      "balgoc___Bulgarca_A1_Ders_3": "vocab_ders_3.json",
      "balgoc___Bulgarca_A1_Ders_4": "vocab_ders_4.json",
      "balgoc___Bulgarca_A1_Ders_5": "vocab_ders_5.json",
      "balgoc___Bulgarca_A1_Ders_6": "vocab_ders_6.json",
      "balgoc___Bulgarca_A1_Ders_7": "vocab_ders_7.json",
      "balgoc___Bulgarca_A1_Ders_8": "vocab_ders_8.json",
      "balgoc___Bulgarca_A1_Ders_9": "vocab_ders_9.json",
      "balgoc___Bulgarca_A1_Ders_10": "vocab_ders_10.json",
      "balgoc___Bulgarca_A1_Ders_11": "vocab_ders_11.json",
    };

    const vocabFile = moduleMap[moduleId];
    if (!vocabFile) {
      return NextResponse.json({ vocabulary: null, message: "No vocabulary data for this module yet" });
    }

    const filePath = path.join(vocabDir, vocabFile);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ vocabulary: null, message: "Vocabulary file not found" });
    }

    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Optional: filter by word or topic
    const word = searchParams.get("word")?.toLowerCase();
    const topic = searchParams.get("topic");

    if (word) {
      // Search for a specific word (fuzzy match on bg field)
      const matches = content.words.filter((w: any) => 
        w.bg.toLowerCase().includes(word) || 
        w.tr.toLowerCase().includes(word)
      );
      return NextResponse.json({ matches, topics: content.topics });
    }

    if (topic) {
      const filtered = content.words.filter((w: any) => w.topic === topic);
      return NextResponse.json({ words: filtered, topic: content.topics.find((t: any) => t.id === topic) });
    }

    return NextResponse.json({ vocabulary: content });
  } catch (error: any) {
    console.error("Error fetching vocabulary:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
