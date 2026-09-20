import { rules } from "./rules";

interface Env {
  AI: any;
}

type RuleBlock = {
  code: string;
  text: string;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildRuleBlocks(source: string): RuleBlock[] {
  const lines = source
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  const blocks: RuleBlock[] = [];

  for (const line of lines) {
    const match = line.match(
      /^(?:\d+(?:\.\d+)*\s+)?((?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-\w+)?)/i
    );

    if (match) {
      blocks.push({
        code: match[1].toUpperCase(),
        text: line,
      });
    }
  }

  return blocks;
}

const BLOCKS = buildRuleBlocks(rules);

const RULE_ALIASES: Record<string, string> = {
  rp1: "RP1",
  rp2: "RP2",
  rp3: "RP3",
  rp4: "RP4",
  rp5: "RP5",
  rp6: "RP6",
  rp7: "RP7",
  rp8: "RP8",
  rp9: "RP9",
  "rp9.1": "RP9.1",
  rp10: "RP10",
  rp11: "RP11",
  rp12: "RP12",
  rp13: "RP13",
  rp14: "RP14",
  rp15: "RP15",
  rp16: "RP16",

  chat1: "CHAT1",
  chat2: "CHAT2",
  chat3: "CHAT3",
  chat4: "CHAT4",
  chat5: "CHAT5",
  chat6: "CHAT6",
  chat7: "CHAT7",
  chat8: "CHAT8",
  chat9: "CHAT9",
  chat10: "CHAT10",
  chat11: "CHAT11",
  chat12: "CHAT12",
  chat13: "CHAT13",
  chat14: "CHAT14",
  chat15: "CHAT15",
  chat16: "CHAT16",
  chat17: "CHAT17",

  tchat1: "TCHAT1",
  tchat2: "TCHAT2",
  tchat3: "TCHAT3",

  abuse1: "ABUSE1",
  abuse2: "ABUSE2",
  abuse3: "ABUSE3",
  abuse4: "ABUSE4",
  abuse5: "ABUSE5",

  alert1: "ALERT1",
  alert2: "ALERT2",
  alert3: "ALERT3",
  alert4: "ALERT4",
  alert5: "ALERT5",
  alert6: "ALERT6",

  media1: "MEDIA1",

  clan1: "CLAN1",
  clan2: "CLAN2",
  "clan2.2": "CLAN2.2",
  clan3: "CLAN3",
  clan4: "CLAN4",
  clan5: "CLAN5",
  "clan5.1": "CLAN5.1",
  clan6: "CLAN6",
  clan7: "CLAN7",
  clan8: "CLAN8",
  clan9: "CLAN9",
  clan10: "CLAN10",

  md1: "MD1",
  md2: "MD2",
  md3: "MD3",
  md4: "MD4",
  "md4.1": "MD4.1",
  "md4.2": "MD4.2",
  "md4.3": "MD4.3",
  md5: "MD5",
  md6: "MD6",
  md7: "MD7",
  "md7.1": "MD7.1",
  md8: "MD8",

  name1: "NAME1",
  name2: "NAME2",

  ac1: "AC1",
  ac2: "AC2",
  ac3: "AC3",
  ac4: "AC4",
  ac5: "AC5",
};

function extractRuleCodes(question: string): string[] {
  const normalized = normalize(question);
  const found = new Set<string>();

  const matches = normalized.match(
    /\b(?:rp|chat|tchat|abuse|alert|media|clan|md|name|ac)\s*\d+(?:\.\d+)?(?:-\w+)?\b/gi
  );

  if (matches) {
    for (const item of matches) {
      const cleaned = item.replace(/\s+/g, "").toLowerCase();
      found.add(
        RULE_ALIASES[cleaned] ?? cleaned.toUpperCase()
      );
    }
  }

  return [...found];
}

function searchRules(question: string): RuleBlock[] {
  const codes = extractRuleCodes(question);

  if (codes.length > 0) {
    const exact = BLOCKS.filter((block) =>
      codes.includes(block.code)
    );

    if (exact.length > 0) {
      return exact;
    }
  }

  const normalizedQuestion = normalize(question);

  const words = normalizedQuestion
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  if (words.length === 0) {
    return [];
  }

  return BLOCKS.map((block) => {
    const text = normalize(block.text);

    let score = 0;

    for (const word of words) {
      if (text.includes(word)) {
        score += word.length >= 5 ? 3 : 1;
      }
    }

    return {
      block,
      score,
    };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.block);
}

const SYSTEM_PROMPT = `
أنت Hossam AI، مساعد متخصص في قوانين OneState.

مهمتك الإجابة عن أسئلة اللاعبين المتعلقة بقوانين السيرفر فقط.

القواعد:

1. اعتمد على القوانين الموجودة في CONTEXT فقط.
2. إذا ذكر المستخدم رقم قانون مثل RP16 أو RP9 أو CHAT4، ابحث عن القانون المطابق بدقة.
3. لا تخترع أي قانون أو عقوبة.
4. إذا وجدت حالة تطبيق إضافية أكثر تحديدًا، استخدمها.
5. لا تغيّر أرقام العقوبات.
6. دخول القاعدة العسكرية خارج وقت الحدث = 45 دقيقة سجن.
7. إذا لم تكن الحالة محسومة، قل:
"القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح."
8. أجب بالعربية وباختصار.
9. اذكر رقم القانون والعقوبة عندما تكون واضحة.
10. لا تستخدم معلومات من الإنترنت أو معلومات خارج القوانين.
`;

function buildContext(question: string): string {
  const relevant = searchRules(question);

  if (relevant.length === 0) {
    return `
القوانين الكاملة:

${rules}
`;
  }

  return `
القوانين ذات الصلة:

${relevant.map((r) => r.text).join("\n")}

القوانين الكاملة:

${rules}
`;
}

function extractAnswer(result: any): string {
  if (typeof result === "string") {
    return result.trim();
  }

  return String(
    result?.response ??
    result?.result ??
    result?.output_text ??
    result?.text ??
    result?.choices?.[0]?.message?.content ??
    result?.choices?.[0]?.text ??
    result?.output?.[0]?.content?.[0]?.text ??
    ""
  ).trim();
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {

    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (
      request.method === "GET" &&
      url.pathname === "/"
    ) {
      return Response.json(
        {
          ok: true,
          service: "Hossam AI",
          model: "@cf/google/gemma-4-26b-a4b-it",
          version: "V7-CLEAN",
          chat: "/chat",
          rules_loaded: BLOCKS.length,
          ai_binding: !!env.AI,
          status: "ready",
        },
        {
          headers: corsHeaders,
        }
      );
    }

    if (
      request.method === "GET" &&
      url.pathname === "/chat"
    ) {
      return Response.json(
        {
          ok: true,
          endpoint: "/chat",
          method: "POST",
          version: "V7-CLEAN",
          rules_loaded: BLOCKS.length,
          ai_binding: !!env.AI,
          status: "ready",
        },
        {
          headers: corsHeaders,
        }
      );
    }

    if (
      request.method !== "POST" ||
      url.pathname !== "/chat"
    ) {
      return Response.json(
        {
          ok: false,
          error: "NOT_FOUND",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    try {

      if (!env.AI) {
        throw new Error("AI_BINDING_MISSING");
      }

      const body: any = await request.json();

      const question =
        body?.message ??
        body?.question ??
        body?.prompt ??
        body?.text ??
        "";

      if (
        typeof question !== "string" ||
        question.trim().length === 0
      ) {
        return Response.json(
          {
            ok: false,
            answer:
              "يرجى كتابة سؤالك عن قوانين OneState.",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const context = buildContext(question);

      const prompt = `${SYSTEM_PROMPT}

CONTEXT:
${context}

USER QUESTION:
${question}

أجب الآن باللغة العربية وباختصار.
اذكر رقم القانون والعقوبة إذا كانت واضحة.
`;

      const result = await env.AI.run(
        "@cf/google/gemma-4-26b-a4b-it",
        {
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          chat_template_kwargs: {
            enable_thinking: false,
          },
        }
      );

      const answer = extractAnswer(result);

      if (!answer) {
        throw new Error("AI_EMPTY_RESPONSE");
      }

      return Response.json(
        {
          ok: true,
          answer: answer,
          reply: answer,
          version: "V7-CLEAN",
        },
        {
          headers: corsHeaders,
        }
      );

    } catch (error: any) {

      const message =
        error?.message ??
        String(error);

      return Response.json(
        {
          ok: false,
          answer: `AI_ERROR: ${message}`,
          reply: `AI_ERROR: ${message}`,
          diagnostic: true,
          version: "V7-CLEAN",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
};
