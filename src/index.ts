import { RULES } from "./rules";

export interface Env {
  AI: Ai;
}

const MODEL = "@cf/google/gemma-4-26b-a4b-it";

const SYSTEM = "أنت Hossam AI، مساعد قوانين OneState RP.\nأجب بالعربية فقط وباختصار شديد.\nحلّل الواقعة كاملة، وليس الكلمات المفتاحية فقط.\nإذا كانت المعلومات كافية للحكم، لا تسأل أي سؤال.\nإذا كانت معلومة ناقصة ويمكن أن تغيّر الحكم فقط، اسأل سؤالًا واحدًا فقط.\nإذا كانت هناك عدة مخالفات واضحة، اعرض كل مخالفة منفصلة، ولا تجمع العقوبات إلا إذا كان المصدر ينص على ذلك.\nلا تخترع مادة أو عقوبة.\nالحالات التطبيقية الموجودة في القوانين أولوية عندما تنطبق حرفيًا.\nRed Zone: حسب قاعدة Hossam AI المضافة، القتل داخل Red Zone بلا عقوبة، باستثناء الميديك عندما تنطبق قاعدة RP16 أو الحالة الخاصة.\nإذا لم تحسم القوانين الحالة بوضوح، قل حرفيًا: «القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.»\nلا تذكر API أو backend أو Gemini أو Cloudflare أو system أو prompt أو أي تفاصيل تقنية.\nالصيغة المفضلة:\n🚫 المخالفة: ...\n📋 المادة: ...\n⏱️ العقوبة: ...\nℹ️ السبب: ...\n";

function jsonResponse(data: unknown, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
  });
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function relevantRules(message: string): string {
  const m = normalize(message);
  const lines = RULES.split("\n");
  const selected = new Set<string>();

  // Direct article lookup first.
  const codes = message.match(/\b(?:RP\d+(?:\.\d+)?|CHAT\d+|TCHAT\d+|ABUSE\d+(?:\.\d+)?|ALERT\d+|MEDIA\d+|CLAN\d+(?:\.\d+)?|MD\d+(?:\.\d+)?|NAME\d+|AC\d+|11\.\d+|12\.\d+)\b/gi) || [];
  for (const code of codes) {
    const c = code.toUpperCase();
    for (const line of lines) {
      if (line.toUpperCase().includes(c)) selected.add(line);
    }
  }

  const addSection = (start: string, extra = 35) => {
    const i = lines.findIndex(x => x.toLowerCase().includes(start.toLowerCase()));
    if (i >= 0) for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + extra); j++) selected.add(lines[j]);
  };

  if (/جرين|green|منطقة خضراء|red zone|ريد زون|منطقة حمراء/.test(m)) {
    addSection("Green Zone:", 12);
    addSection("Neutral/green:", 16);
    addSection("Special Hossam AI application rule:", 5);
  }
  if (/ميديك|مسعف|طبيب|md|تحالف طبي/.test(m)) {
    addSection("10 MD — Medical Alliance:", 18);
    addSection("Factions:", 30);
  }
  if (/شرطة|شرطي|police|اعتقال|سجن|تاسر|صاعق/.test(m)) {
    addSection("11 Police:", 25);
    addSection("Factions:", 30);
  }
  if (/جيش|عسكري|army|قاعدة عسكرية|مداهمة|مداهم/.test(m)) {
    addSection("12 Army:", 20);
    addSection("Factions:", 30);
    addSection("Neutral/green:", 16);
  }
  if (/شات|سب|إهان|صوت|فويس|رسائل/.test(m)) addSection("Voice:", 25);
  if (/قلتش|غليتش|جدار|اخرج من rp|afk|غش|استغلال/.test(m)) addSection("Serious:", 20);
  if (/عصابة|كلان|gang|تاسر/.test(m)) addSection("9.1 CLAN1", 25);
  if (/قتل|ضرب|طلق|اطلاق|إطلاق|دعس|دهس|مركبة|سيارة|سلاح/.test(m)) {
    addSection("5.1 RP1", 18);
    addSection("Green Zone:", 12);
    addSection("Neutral/green:", 16);
    addSection("Factions:", 30);
    addSection("Special Hossam AI application rule:", 5);
  }

  // Always include application cases when context analysis is needed.
  if (selected.size === 0 || /حالة|موقف|ماذا|شو بصير|هل|إذا|لو/.test(m)) {
    addSection("## HOSSAM AI APPLICATION CASES", 120);
  }

  // Fallback: give the full rules only when no focused match exists.
  if (selected.size === 0) return RULES.slice(0, 22000);

  return Array.from(selected).join("\n").slice(0, 22000);
}

function extractText(result: any): string {
  if (!result) return "";
  if (typeof result === "string") return result.trim();
  if (typeof result.response === "string") return result.response.trim();
  if (typeof result.text === "string") return result.text.trim();
  if (Array.isArray(result.response)) return result.response.map((x: any) => x?.text ?? "").join("").trim();
  return "";
}

function cleanAnswer(text: string): string {
  let s = (text || "").trim();
  s = s.replace(/```[\s\S]*?```/g, "").trim();
  const technical = /backend|api|gemini|cloudflare|prompt|database|system message|stack trace|exception/i;
  if (!s || technical.test(s)) return "القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.";
  if (s.length > 1800) s = s.slice(0, 1800).trim() + "…";
  return s;
}

async function runAI(env: Env, message: string, context: string) {
  const user = `القوانين ذات الصلة:\n---\n${context}\n---\n\nحالة المستخدم:\n${message}\n\nأجب للمستخدم فقط.`;
  const result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user }
    ],
    max_tokens: 450,
    temperature: 0.1
  });
  return cleanAnswer(extractText(result));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") return jsonResponse({ ok: true }, 200, origin);

    if (request.method === "GET") {
      return jsonResponse({
        ok: true,
        service: "Hossam AI",
        model: MODEL,
        status: "ready"
      }, 200, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, answer: "الطلب غير مدعوم.", reply: "الطلب غير مدعوم." }, 405, origin);
    }

    try {
      const body = await request.json() as any;
      const message = typeof body?.message === "string"
        ? body.message.trim()
        : typeof body?.question === "string"
          ? body.question.trim()
          : "";

      if (!message) {
        const answer = "اكتب الحالة أو المادة التي تريد معرفة حكمها.";
        return jsonResponse({ ok: true, answer, reply: answer }, 200, origin);
      }

      const context = relevantRules(message);
      let answer = "";

      try {
        answer = await runAI(env, message, context);
      } catch (firstError) {
        // One short retry helps with transient capacity/timeouts.
        try {
          answer = await runAI(env, message, context);
        } catch (secondError) {
          answer = "حدث ضغط مؤقت على الخدمة. حاول مرة أخرى بعد قليل.";
        }
      }

      return jsonResponse({
        ok: true,
        answer,
        reply: answer
      }, 200, origin);

    } catch {
      const answer = "تعذر قراءة الطلب. حاول مرة أخرى.";
      return jsonResponse({ ok: false, answer, reply: answer }, 400, origin);
    }
  }
};
