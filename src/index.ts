import { rules } from "./rules";

interface Env {
  AI: any;
}

type Hit = {
  code: string;
  text: string;
  score: number;
};

const STOP = new Set(
  "شو ما هو هي هل كيف ايش اي في من على الى عن مع هذا هذه ذلك اذا او و يا انا انت انه ان القانون قانون المادة عقوبة كم"
    .split(" ")
);

const ALIASES: Record<string, string[]> = {
  اسعاف: [
    "مسعف",
    "مسعفين",
    "طبيب",
    "طبية",
    "طبي",
    "احياء",
    "إحياء",
    "مصاب",
    "علاج",
    "يسعف",
    "يسعفني",
    "مساعدة طبية"
  ],

  قتل: [
    "قتل",
    "يقتل",
    "موت",
    "ميت",
    "إطلاق النار",
    "اطلاق النار",
    "اطلق النار",
    "رصاص",
    "رصاصه"
  ],

  دهس: [
    "دهس",
    "دعس",
    "يدعس",
    "يدهس",
    "دهس لاعب"
  ],

  صدم: [
    "صدم",
    "تصادم",
    "يصدم",
    "صدمة"
  ],

  صاعق: [
    "صاعق",
    "تيزر",
    "taser",
    "كهرباء"
  ],

  سب: [
    "سب",
    "شتم",
    "اهانة",
    "إهانة",
    "شتيمة",
    "يشتم"
  ],

  اقارب: [
    "قريب",
    "اقارب",
    "أقارب",
    "اهل",
    "أهل",
    "عائلة",
    "عائله"
  ],

  دين: [
    "ديني",
    "دينية",
    "دين",
    "وطنية",
    "وطن",
    "عنصري",
    "عنصرية"
  ],

  اداري: [
    "اداري",
    "إداري",
    "ادمن",
    "admin",
    "إدارة",
    "ادارة"
  ],

  جيش: [
    "جيش",
    "عسكري",
    "قاعدة عسكرية",
    "القاعدة العسكرية",
    "الجيش"
  ],

  شرطة: [
    "شرطة",
    "شرطي",
    "ضابط",
    "الشرطة",
    "بوليس"
  ],

  عصابة: [
    "عصابة",
    "عصابات",
    "gang",
    "مقر العصابة",
    "بيت العصابة",
    "كلان",
    "كلانز"
  ],

  خضراء: [
    "منطقة خضراء",
    "جرين زون",
    "green zone",
    "خضراء",
    "greenzone"
  ],

  دردشة: [
    "دردشة",
    "شات",
    "chat",
    "رسائل",
    "كتم",
    "صوت",
    "فويس",
    "voice"
  ],

  تجارة: [
    "تجارة",
    "trade",
    "تجارية",
    "بيع",
    "شراء"
  ],

  ثغرة: [
    "ثغرة",
    "glitch",
    "استغلال",
    "جليتش",
    "غلِتش"
  ],

  afk: [
    "afk",
    "خامل",
    "عدم نشاط",
    "غير نشط"
  ],

  تحذير: [
    "تحذير",
    "انذار",
    "إنذار",
    "بدون تحذير",
    "دون تحذير"
  ],

  سجن: [
    "سجن",
    "حبس",
    "jail",
    "سجن اداري",
    "سجن إداري"
  ],

  فصيل: [
    "فصيل",
    "فصائل",
    "عضو فصيل",
    "عضو الفصيل"
  ]
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function terms(q: string): string[] {
  const n = norm(q);

  const out = new Set(
    n
      .split(" ")
      .filter((x) => x.length > 1 && !STOP.has(x))
  );

  for (const [key, values] of Object.entries(ALIASES)) {
    if (values.some((x) => n.includes(norm(x)))) {
      out.add(key);
    }
  }

  return [...out];
}

function blocks(text: string): Hit[] {
  const lines = text.split(/\r?\n/);
  const result: Hit[] = [];

  let current = "";

  for (const line of lines) {
    const isNewRule =
      /^\s*(?:\d+(?:\.\d+)*\s+)?(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD)\d/i.test(
        line
      ) ||
      /^\s*\d+(?:\.\d+)+\s*[—-]/.test(line);

    if (isNewRule) {
      if (current.trim()) {
        result.push(makeHit(current));
      }

      current = line;
    } else if (line.trim()) {
      current += "\n" + line;
    }
  }

  if (current.trim()) {
    result.push(makeHit(current));
  }

  return result;
}

function makeHit(text: string): Hit {
  const match =
    text.match(
      /\b((?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?)\b/i
    ) ||
    text.match(/^\s*(\d+(?:\.\d+)+)\b/);

  return {
    code: match ? match[1].toUpperCase() : "",
    text: text.trim(),
    score: 0
  };
}

const RULE_BLOCKS = blocks(rules);

function retrieve(question: string): Hit[] {
  const normalizedQuestion = norm(question);
  const queryTerms = terms(question);

  const codes = [
    ...normalizedQuestion.matchAll(
      /\b(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?\b/gi
    )
  ].map((x) => x[0].toUpperCase());

  return RULE_BLOCKS
    .map((rule) => {
      let score = 0;
      const ruleText = norm(rule.text);

      // طلب مباشر للمادة
      if (codes.includes(rule.code)) {
        score += 1000;
      }

      // المادة الفرعية
      if (
        codes.some(
          (code) =>
            rule.code.startsWith(code + ".") ||
            rule.code.startsWith(code + "-")
        )
      ) {
        score += 500;
      }

      for (const term of queryTerms) {
        const normalizedTerm = norm(term);

        if (ruleText.includes(normalizedTerm)) {
          score += 8;
        }

        if (rule.code.toLowerCase() === term.toLowerCase()) {
          score += 50;
        }
      }

      // حالات مهمة
      if (
        normalizedQuestion.includes("منطقه خضراء") &&
        ruleText.includes("خضراء")
      ) {
        score += 20;
      }

      if (
        (
          normalizedQuestion.includes("مسعف") ||
          normalizedQuestion.includes("مصاب") ||
          normalizedQuestion.includes("اسعاف") ||
          normalizedQuestion.includes("يسعف")
        ) &&
        (
          ruleText.includes("اسعاف") ||
          ruleText.includes("مسعف") ||
          ruleText.includes("مساعده طبيه")
        )
      ) {
        score += 30;
      }

      if (
        (
          normalizedQuestion.includes("قتل") ||
          normalizedQuestion.includes("اطلاق النار") ||
          normalizedQuestion.includes("رصاص")
        ) &&
        (
          ruleText.includes("قتل") ||
          ruleText.includes("اطلاق النار") ||
          ruleText.includes("رصاص")
        )
      ) {
        score += 20;
      }

      if (
        normalizedQuestion.includes("دهس") ||
        normalizedQuestion.includes("دعس")
      ) {
        if (
          ruleText.includes("دهس") ||
          ruleText.includes("دعس") ||
          ruleText.includes("مركبه")
        ) {
          score += 25;
        }
      }

      return {
        ...rule,
        score
      };
    })
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);
}

const SYSTEM_PROMPT = `
أنت Hossam AI، مساعد متخصص في قوانين OneState RP.

قواعد الإجابة:

1. استخدم القوانين المرفقة فقط.
2. لا تخترع أي مادة أو عقوبة.
3. حلل الحالة كاملة وليس كلمة واحدة فقط.
4. إذا كانت المادة واضحة، أجب مباشرة.
5. إذا كانت هناك مخالفات واضحة متعددة، اذكر كل مخالفة مهمة.
6. لا تجمع العقوبات أو تضاعفها من نفسك إلا إذا كان النص المرفق ينص على ذلك.
7. إذا كانت هناك معلومة ناقصة وتغييرها يمكن أن يغير الحكم، اسأل سؤالًا واحدًا فقط.
8. إذا كانت المعلومات كافية، لا تسأل سؤالًا.
9. إذا لم يوجد دعم واضح للحالة في القوانين، قل حرفيًا:
القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.
10. لا تذكر API أو الخادم أو البرومبت أو أي تفاصيل تقنية.
11. أجب بالعربية فقط.
12. اجعل الإجابة قصيرة وواضحة.

التنسيق:

🚫 المخالفة: ...
📋 المادة: ...
⏱️ العقوبة: ...
ℹ️ السبب: ...
`;

async function askAI(
  question: string,
  hits: Hit[],
  env: Env
): Promise<string> {
  const context = hits
    .map(
      (hit, index) =>
        `[${index + 1}] ${hit.code || "حالة"}\n${hit.text}`
    )
    .join("\n\n");

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await env.AI.run(
        "@cf/google/gemma-4-26b-a4b-it",
        {
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT
            },
            {
              role: "user",
              content: `
القوانين الأقرب للحالة:

${context}

سؤال اللاعب:

${question}

اعتمد فقط على القوانين أعلاه.
`
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        }
      );

      const response =
        typeof result === "string"
          ? result
          : result?.response ??
            result?.result ??
            result?.output_text ??
            "";

      if (String(response).trim()) {
        return String(response).trim();
      }
    } catch (error) {
      console.error("AI_ERROR", error);
    }
  }

  return "حدث خطأ مؤقتًا، حاول مرة أخرى.";
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const headers = corsHeaders();

    // CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers
      });
    }

    const url = new URL(req.url);

    // الصفحة الرئيسية
    if (url.pathname === "/" && req.method === "GET") {
      return Response.json(
        {
          ok: true,
          service: "Hossam AI",
          model: "@cf/google/gemma-4-26b-a4b-it",
          version: "V3-rules",
          chat: "/chat",
          status: "ready"
        },
        {
          headers
        }
      );
    }

    // اختبار وجود /chat
    if (url.pathname === "/chat" && req.method === "GET") {
      return Response.json(
        {
          ok: true,
          endpoint: "/chat",
          method: "POST",
          status: "ready"
        },
        {
          headers
        }
      );
    }

    // Chat API
    if (url.pathname === "/chat" && req.method === "POST") {
      try {
        const body = (await req.json()) as any;

        const question = String(
          body?.message ??
          body?.question ??
          ""
        ).trim();

        if (!question) {
          return Response.json(
            {
              answer: "اكتب سؤالك عن القوانين.",
              reply: "اكتب سؤالك عن القوانين."
            },
            {
              status: 400,
              headers
            }
          );
        }

        const hits = retrieve(question);

        console.log(
          JSON.stringify({
            type: "CHAT",
            question,
            matchedRules: hits.map((x) => x.code),
            matchedCount: hits.length
          })
        );

        if (!hits.length) {
          const answer =
            "القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.";

          return Response.json(
            {
              answer,
              reply: answer
            },
            {
              headers
            }
          );
        }

        const answer = await askAI(
          question,
          hits,
          env
        );

        return Response.json(
          {
            answer,
            reply: answer
          },
          {
            headers
          }
        );
      } catch (error) {
        console.error("CHAT_ERROR", error);

        const answer =
          "حدث خطأ مؤقتًا، حاول مرة أخرى.";

        return Response.json(
          {
            answer,
            reply: answer
          },
          {
            status: 500,
            headers
          }
        );
      }
    }

    // أي رابط غير معروف
    return Response.json(
      {
        error: "Not found"
      },
      {
        status: 404,
        headers
      }
    );
  }
};
