import { rules } from "./rules";

interface Env {
  AI: any;
}

type Hit = {
  code: string;
  text: string;
  score: number;
};

/* =========================================================
   إعدادات البحث
========================================================= */

const STOP = new Set(
  "شو ما هو هي هل كيف ايش في من على الى عن مع هذا هذه ذلك اذا او و يا انا انت انه ان القانون قانون المادة عقوبة كم".split(
    " "
  )
);

const ALIASES: Record<string, string[]> = {
  قتل: [
    "قتل",
    "يقتل",
    "موت",
    "ميت",
    "مقتول",
    "اطلاق النار",
    "اطلق النار",
    "رصاص",
    "shoot",
    "kill",
  ],

  اسعاف: [
    "مسعف",
    "مسعفين",
    "اسعاف",
    "إسعاف",
    "طبيب",
    "طبية",
    "طبي",
    "طوارئ",
    "احياء",
    "إحياء",
    "انعاش",
    "إنعاش",
    "مصاب",
    "علاج",
  ],

  دهس: [
    "دهس",
    "دعس",
    "دهس بالسيارة",
    "دهس بالمركبة",
    "سيارة",
    "مركبة",
  ],

  صدم: [
    "صدم",
    "تصادم",
    "اصطدم",
  ],

  صاعق: [
    "صاعق",
    "تيزر",
    "taser",
    "tazer",
  ],

  سب: [
    "سب",
    "شتم",
    "اهانة",
    "إهانة",
    "شتيمة",
    "شتائم",
    "اساءة",
    "إساءة",
  ],

  اقارب: [
    "قريب",
    "اقارب",
    "أقارب",
    "اهل",
    "أهل",
    "عائلة",
    "عائله",
  ],

  دين: [
    "ديني",
    "دينية",
    "دينيه",
    "دين",
    "وطنية",
    "وطنيه",
    "عنصري",
    "عنصرية",
    "عرق",
  ],

  اداري: [
    "اداري",
    "إداري",
    "ادمن",
    "admin",
    "إدارة",
    "ادارة",
    "مسؤول",
  ],

  جيش: [
    "جيش",
    "عسكري",
    "قاعدة عسكرية",
    "القاعدة العسكرية",
    "قاعدة الجيش",
  ],

  شرطة: [
    "شرطة",
    "شرطي",
    "ضابط",
    "بوليس",
  ],

  عصابة: [
    "عصابة",
    "عصابات",
    "gang",
    "مقر العصابة",
    "بيت العصابة",
  ],

  خضراء: [
    "منطقة خضراء",
    "المنطقة الخضراء",
    "جرين زون",
    "green zone",
    "خضراء",
  ],

  دردشة: [
    "دردشة",
    "شات",
    "chat",
    "رسائل",
    "كتم",
    "صوت",
    "مايك",
    "ميكروفون",
  ],

  تجارة: [
    "تجارة",
    "trade",
    "تجارية",
    "سوق",
  ],

  ثغرة: [
    "ثغرة",
    "glitch",
    "استغلال",
    "جليتش",
    "bug",
    "bug abuse",
  ],

  afk: [
    "afk",
    "خامل",
    "عدم نشاط",
    "واقف",
    "خارج اللعبة",
  ],

  تحذير: [
    "تحذير",
    "انذار",
    "إنذار",
    "بدون تحذير",
    "ما حذر",
    "لم يحذر",
  ],

  فصيل: [
    "فصيل",
    "فصائل",
    "عضو فصيل",
    "رتبة",
    "فصيله",
  ],

  قدرات: [
    "قدرات",
    "بدنية",
    "جسدية",
    "مستحيل",
    "غير واقعي جسديا",
    "قفز",
  ],

  منطق: [
    "منطق",
    "غير منطقي",
    "غير واقعي",
    "واقعي",
    "تصرف كشخصية",
    "تصرف كشخصيه",
  ],

  معلومات: [
    "معلومات من الواقع",
    "معلومات حقيقية",
    "معلومات العالم الحقيقي",
    "معلومات خارج rp",
    "metagaming",
    "mg",
  ],

  رفض: [
    "رفض rp",
    "رفض التمثيل",
    "رفض",
    "يرفض rp",
  ],

  اوامر: [
    "do",
    "me",
    "try",
    "اوامر rp",
    "أوامر rp",
  ],

  خطف: [
    "خطف",
    "اختطاف",
  ],

  رجوع: [
    "رجع بعد الموت",
    "عاد بعد الموت",
    "مكان موته",
    "قتل بعد موته",
    "rk",
  ],

  اعلان: [
    "اعلان",
    "إعلان",
    "دعاية",
    "ترويج",
  ],

  تسريب: [
    "تسريب",
    "افشاء",
    "إفشاء",
    "سرية",
    "معلومات سرية",
  ],

  معدات: [
    "معدات",
    "معدات طبية",
    "معدات الإسعاف",
    "موارد الفصيل",
  ],
};

/* =========================================================
   تطبيع النص العربي
========================================================= */

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   استخراج أرقام المواد
========================================================= */

function extractCodes(s: string): string[] {
  const out = new Set<string>();

  const n = norm(s);

  const patterns = [
    /\b(?:rp|chat|tchat|abuse|alert|media|clan|md|name|ac)\s*\d+(?:\.\d+)?(?:-[a-z]+\d+(?:\.\d+)?)?\b/gi,

    /\b(?:rp|chat|tchat|abuse|alert|media|clan|md|name|ac)\d+(?:\.\d+)?(?:-[a-z]+\d+(?:\.\d+)?)?\b/gi,
  ];

  for (const re of patterns) {
    for (const m of n.matchAll(re)) {
      const code = m[0]
        .replace(/\s+/g, "")
        .toUpperCase();

      out.add(code);
    }
  }

  return [...out];
}

/* =========================================================
   معرفة بداية مادة جديدة
========================================================= */

function isRuleStart(line: string) {
  const s = line.trim();

  return (
    /\b(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\s*\d+(?:\.\d+)?(?:-[A-Z]+\d+(?:\.\d+)?)?\b/i.test(
      s
    ) ||
    /^\d+(?:\.\d+)*\s*[—-].*\b(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\s*\d+/i.test(
      s
    )
  );
}

/* =========================================================
   تحويل بلوك قانون إلى Hit
========================================================= */

function makeHit(text: string): Hit {
  const m =
    text.match(
      /\b((?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\s*\d+(?:\.\d+)?(?:-[A-Z]+\d+(?:\.\d+)?)?)\b/i
    ) ||
    text.match(/^\s*(\d+(?:\.\d+)+)\b/);

  const code = m
    ? m[1].replace(/\s+/g, "").toUpperCase()
    : "";

  return {
    code,
    text: text.trim(),
    score: 0,
  };
}

/* =========================================================
   تقسيم ملف القوانين
========================================================= */

function blocks(raw: string): Hit[] {
  const lines = raw
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  const hits: Hit[] = [];

  let current = "";

  for (const line of lines) {
    if (
      line.startsWith("==============================") ||
      /^القسم\s+\d+/.test(line) ||
      /^قوانين OneState كاملة/.test(line)
    ) {
      continue;
    }

    if (isRuleStart(line)) {
      if (current) {
        hits.push(makeHit(current));
      }

      current = line;
    } else if (current) {
      current += "\n" + line;
    }
  }

  if (current) {
    hits.push(makeHit(current));
  }

  return hits.filter((x) => x.text.length > 0);
}

/* =========================================================
   تحميل القوانين
========================================================= */

const B = blocks(rules);

/* =========================================================
   تنظيف كود المادة
========================================================= */

function cleanCode(code: string) {
  return code
    .replace(/\s+/g, "")
    .toUpperCase();
}

/* =========================================================
   البحث المباشر عن مادة
========================================================= */

function exactCodeHit(code: string): Hit | null {
  const target = cleanCode(code);

  // أولاً: تطابق كامل مع الكود المستخرج
  const exact = B.find(
    (x) => cleanCode(x.code) === target
  );

  if (exact) {
    return exact;
  }

  // احتياط: البحث داخل النص نفسه
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const re = new RegExp(
    `\\b${escaped}\\b`,
    "i"
  );

  const fallback = B.find((x) => re.test(x.text));

  return fallback ?? null;
}

/* =========================================================
   استخراج الكلمات المهمة
========================================================= */

function terms(q: string): string[] {
  const n = norm(q);

  const base = n
    .split(" ")
    .filter(
      (x) =>
        x &&
        !STOP.has(x) &&
        x.length >= 2
    );

  const expanded = new Set(base);

  for (const [key, vals] of Object.entries(ALIASES)) {
    if (
      vals.some(
        (v) => n.includes(norm(v))
      )
    ) {
      expanded.add(key);

      for (const v of vals) {
        expanded.add(norm(v));
      }
    }
  }

  return [...expanded];
}

/* =========================================================
   تحليل الأولوية للموقف
========================================================= */

function scenarioPriority(
  q: string,
  hit: Hit
): number {
  const n = norm(q);
  const t = norm(hit.text);

  let bonus = 0;

  /* -------------------------------------------------------
     مسعف + قتل/اعتداء
  ------------------------------------------------------- */

  const medical =
    n.includes("مسعف") ||
    n.includes("مسعفين") ||
    n.includes("اسعاف") ||
    n.includes("طبيب") ||
    n.includes("طوارئ") ||
    n.includes("انعاش") ||
    n.includes("احياء");

  const violent =
    n.includes("قتل") ||
    n.includes("اطلاق") ||
    n.includes("رصاص") ||
    n.includes("ضرب") ||
    n.includes("اعتداء") ||
    n.includes("اذى");

  if (medical && violent) {
    if (
      t.includes("طوارئ") ||
      t.includes("طبيه") ||
      t.includes("مسعف")
    ) {
      bonus += 250;
    }
  }

  /* -------------------------------------------------------
     دهس
  ------------------------------------------------------- */

  if (
    (n.includes("دهس") ||
      n.includes("دعس") ||
      n.includes("دهس بالسياره") ||
      n.includes("دهس بالمركبه")) &&
    (
      t.includes("مركبه") ||
      t.includes("دهر") ||
      t.includes("دهس") ||
      t.includes("دعس") ||
      t.includes("db")
    )
  ) {
    bonus += 180;
  }

  /* -------------------------------------------------------
     RP9.1 — حالة إطلاق النار الجماعي من مركبة
  ------------------------------------------------------- */

  if (
    (
      n.includes("3") ||
      n.includes("ثلاث")
    ) &&
    (
      n.includes("لاعب") ||
      n.includes("اشخاص") ||
      n.includes("شخص")
    ) &&
    (
      n.includes("دهس") ||
      n.includes("دعس") ||
      n.includes("اطلاق") ||
      n.includes("قتل")
    )
  ) {
    if (
      t.includes("rp9.1") ||
      t.includes("اطلاق نار جماعي")
    ) {
      bonus += 100;
    }
  }

  /* -------------------------------------------------------
     المنطقة الخضراء
  ------------------------------------------------------- */

  if (
    n.includes("منطقه خضراء") ||
    n.includes("المنطقه الخضراء") ||
    n.includes("جرين زون") ||
    n.includes("green zone")
  ) {
    if (t.includes("خضراء")) {
      bonus += 120;
    }
  }

  /* -------------------------------------------------------
     قتل بدون سبب
  ------------------------------------------------------- */

  if (
    (
      n.includes("بدون سبب") ||
      n.includes("دون سبب") ||
      n.includes("بدون مبرر")
    ) &&
    (
      n.includes("قتل") ||
      n.includes("اطلاق") ||
      n.includes("رصاص") ||
      n.includes("ضرب")
    )
  ) {
    if (
      t.includes("دون سبب") ||
      t.includes("بدون سبب")
    ) {
      bonus += 100;
    }
  }

  /* -------------------------------------------------------
     RP3 — تجاوز القدرات البدنية
  ------------------------------------------------------- */

  if (
    (
      n.includes("قدرات") ||
      n.includes("مستحيل") ||
      n.includes("جسديه") ||
      n.includes("بدنيه") ||
      n.includes("قفز")
    ) &&
    (
      t.includes("قدرات بدنيه") ||
      t.includes("rp3") ||
      t.includes("تجاوز القدرات")
    )
  ) {
    bonus += 220;
  }

  /* -------------------------------------------------------
     RP4 — NRP
  ------------------------------------------------------- */

  if (
    (
      n.includes("غير واقعي") ||
      n.includes("منطقي") ||
      n.includes("تصرف كشخصيه")
    ) &&
    (
      t.includes("منطق شخصيه") ||
      t.includes("nrp")
    )
  ) {
    bonus += 150;
  }

  /* -------------------------------------------------------
     RP5 — MG
  ------------------------------------------------------- */

  if (
    (
      n.includes("معلومات من الواقع") ||
      n.includes("معلومات حقيقيه") ||
      n.includes("معلومات خارج rp") ||
      n.includes("metagaming") ||
      n.includes("mg")
    ) &&
    (
      t.includes("العالم الحقيقي") ||
      t.includes("mg")
    )
  ) {
    bonus += 200;
  }

  /* -------------------------------------------------------
     RP6 — رفض RP
  ------------------------------------------------------- */

  if (
    (
      n.includes("رفض rp") ||
      n.includes("رفض التمثيل") ||
      n.includes("يرفض rp")
    ) &&
    (
      t.includes("رفض rp") ||
      t.includes("رفض")
    )
  ) {
    bonus += 180;
  }

  /* -------------------------------------------------------
     RP7 — do / me / try
  ------------------------------------------------------- */

  if (
    (
      n.includes("do") ||
      n.includes("me") ||
      n.includes("try")
    ) &&
    (
      t.includes("/do") ||
      t.includes("/me") ||
      t.includes("/try")
    )
  ) {
    bonus += 180;
  }

  /* -------------------------------------------------------
     RP10 — RK
  ------------------------------------------------------- */

  if (
    (
      n.includes("بعد الموت") ||
      n.includes("مكان موته") ||
      n.includes("رجع بعد الموت") ||
      n.includes("rk")
    ) &&
    (
      t.includes("rk") ||
      t.includes("بعد موته")
    )
  ) {
    bonus += 220;
  }

  /* -------------------------------------------------------
     RP12 — خطف
  ------------------------------------------------------- */

  if (
    (
      n.includes("خطف") ||
      n.includes("اختطاف")
    ) &&
    (
      t.includes("خطف") ||
      t.includes("اختطاف")
    )
  ) {
    bonus += 180;
  }

  /* -------------------------------------------------------
     CHAT — الإهانات
  ------------------------------------------------------- */

  if (
    (
      n.includes("سب") ||
      n.includes("شتم") ||
      n.includes("اهانه") ||
      n.includes("شتيمه")
    ) &&
    (
      t.includes("اهانه") ||
      t.includes("إهانة") ||
      t.includes("شتم")
    )
  ) {
    bonus += 120;
  }

  /* -------------------------------------------------------
     ABUSE — الثغرات
  ------------------------------------------------------- */

  if (
    (
      n.includes("ثغره") ||
      n.includes("glitch") ||
      n.includes("جليتش") ||
      n.includes("استغلال")
    ) &&
    (
      t.includes("ثغرات") ||
      t.includes("اخطاء") ||
      t.includes("استغلال")
    )
  ) {
    bonus += 180;
  }

  return bonus;
}

/* =========================================================
   البحث الذكي في القوانين
========================================================= */

function retrieve(q: string): Hit[] {
  const codeMatches = extractCodes(q);

  /* -------------------------------------------------------
     إذا المستخدم طلب مادة محددة
     مثال:
     RP3
     RP16
     MD3
     CHAT1
  ------------------------------------------------------- */

  if (codeMatches.length > 0) {
    const directHits: Hit[] = [];

    for (const requested of codeMatches) {
      const exact = exactCodeHit(requested);

      if (exact) {
        directHits.push({
          ...exact,
          score: 10000,
        });

        continue;
      }

      /*
       * مثال:
       * طلب RP9
       * يمكن إرجاع RP9.1 أيضًا كقاعدة فرعية
       */

      for (const rule of B) {
        const ruleCode = cleanCode(rule.code);
        const target = cleanCode(requested);

        if (
          ruleCode.startsWith(
            target + "."
          ) ||
          ruleCode.startsWith(
            target + "-"
          )
        ) {
          directHits.push({
            ...rule,
            score: 5000,
          });
        }
      }
    }

    if (directHits.length > 0) {
      return directHits
        .sort(
          (a, b) =>
            b.score - a.score
        )
        .slice(0, 14);
    }
  }

  /* -------------------------------------------------------
     سؤال موقف بدون رقم مادة
  ------------------------------------------------------- */

  const ts = terms(q);

  const scored = B.map((b) => {
    let score = 0;

    const bn = norm(b.text);

    /* تطابق الكلمات */
    for (const term of ts) {
      if (!term) continue;

      if (
        bn.includes(norm(term))
      ) {
        score += 8;
      }
    }

    /* أولوية تحليل الموقف */
    score += scenarioPriority(
      q,
      b
    );

    /* -----------------------------------------------------
       قواعد خاصة جدًا
    ----------------------------------------------------- */

    // RP16 — مسعفين
    if (
      b.code === "RP16" &&
      /مسعف|مسعفين|اسعاف|طبيب|طبيه|طوارئ|انعاش|احياء/.test(
        norm(q)
      )
    ) {
      score += 300;
    }

    // RP9 — دهس
    if (
      b.code === "RP9" &&
      /دهس|دعس|مركبه|سياره/.test(
        norm(q)
      )
    ) {
      score += 220;
    }

    // RP3 — القدرات
    if (
      b.code === "RP3" &&
      /قدرات|بدنيه|جسديه|مستحيل|قفز/.test(
        norm(q)
      )
    ) {
      score += 250;
    }

    // RP4 — NRP
    if (
      b.code === "RP4" &&
      /غير واقعي|غير منطقي|nrp|منطقي/.test(
        norm(q)
      )
    ) {
      score += 170;
    }

    // RP5 — MG
    if (
      b.code === "RP5" &&
      /معلومات.*واقع|معلومات.*حقيقي|metagaming|mg/.test(
        norm(q)
      )
    ) {
      score += 200;
    }

    // RP1 — قتل بدون سبب
    if (
      b.code === "RP1" &&
      /قتل|اطلاق|رصاص/.test(
        norm(q)
      )
    ) {
      score += 30;
    }

    return {
      ...b,
      score,
    };
  })
    .filter(
      (x) => x.score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );

  return scored.slice(0, 14);
}

/* =========================================================
   تجهيز القوانين للـAI
========================================================= */

function formatHits(
  hits: Hit[]
) {
  return hits
    .map(
      (h, i) =>
        `القانون ${i + 1}:
المادة: ${h.code || "غير محددة"}
النص:
${h.text}`
    )
    .join(
      "\n\n---\n\n"
    );
}

/* =========================================================
   تعليمات الـAI
========================================================= */

const SYS = `أنت Hossam AI، مساعد قوانين OneState RP.

مهمتك الأساسية تحليل مواقف اللاعبين وتحديد القانون والعقوبة التي تنطبق عليها.

التزم بالقوانين المرفقة فقط.

لا تخترع مادة.
لا تخترع عقوبة.
لا تستخدم معلومات خارج القوانين المرفقة.

إذا ذكر المستخدم رقم مادة مثل RP3 أو RP16:
- استخدم المادة المطلوبة نفسها.
- لا تستبدلها بمادة أخرى.
- لا تربطها بمادة مختلفة لمجرد تشابه الكلمات.
- اشرح نص المادة والعقوبة الموجودة فيها.

إذا وصف المستخدم موقفًا ولم يذكر رقم مادة:
- حلل الموقف كاملًا.
- لا تعتمد على كلمة واحدة فقط.
- افهم من قام بالفعل.
- افهم من تضرر.
- افهم كيف حدثت المخالفة.
- افهم مكان حدوثها إذا ذكره المستخدم.
- افهم الظروف الخاصة بالموقف.
- قارن الموقف بالقوانين المرفقة.
- اختر القانون الأكثر تحديدًا للموقف.
- إذا كان هناك قانون خاص يغطي الحالة، فالقانون الخاص يتقدم على القانون العام.
- لا تجعل كلمة مثل "قتل" وحدها كافية لاختيار RP1 إذا كانت هناك مادة أكثر تحديدًا مثل RP16.
- إذا كانت هناك مخالفات متعددة وواضحة، اذكر كل مخالفة مهمة مع مادتها وعقوبتها.
- لا تجمع العقوبات من نفسك إلا إذا كان القانون نفسه ينص على ذلك.

إذا كانت المعلومة الناقصة يمكن أن تغير الحكم:
- اسأل سؤالًا واحدًا فقط.
- لا تسأل أكثر من سؤال في نفس الرد.

إذا كانت المعلومات كافية:
- لا تسأل أي سؤال إضافي.
- أعط الحكم مباشرة.

إذا لم يوجد قانون واضح يغطي الحالة، استخدم حرفيًا:
القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.

لا تذكر API.
لا تذكر Cloudflare.
لا تذكر الخادم.
لا تذكر البرومبت.
لا تذكر طريقة عمل النظام.
لا تذكر أنك نموذج ذكاء اصطناعي.

أجب بالعربية وباختصار.

استخدم هذا التنسيق عندما يكون الحكم واضحًا:

🚫 المخالفة: ...
📋 المادة: ...
⏱️ العقوبة: ...
ℹ️ السبب: ...`;

/* =========================================================
   معرفة هل السؤال عن مادة محددة
========================================================= */

function looksLikeDirectCodeQuestion(
  q: string
) {
  return (
    extractCodes(q).length > 0
  );
}

/* =========================================================
   إنشاء Prompt
========================================================= */

function buildPrompt(
  q: string,
  hits: Hit[]
) {
  const context =
    formatHits(hits);

  /*
   * سؤال مباشر عن مادة
   */

  if (
    looksLikeDirectCodeQuestion(q)
  ) {
    return `سؤال   فصيل: ["فصيل", "فصائل", "عضو فصيل"],
};

function norm(s: string) {
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

function terms(q: string) {
  const n = norm(q);

  const out = new Set(
    n.split(" ").filter((x) => x.length > 1 && !STOP.has(x))
  );

  for (const [key, values] of Object.entries(ALIASES)) {
    if (values.some((x) => n.includes(norm(x)))) {
      out.add(key);
    }
  }

  return [...out];
}

function isRuleStart(line: string) {
  const s = line.trim();

  return (
    /^\d+(?:\.\d+)*\s+(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d/i.test(
      s
    ) ||
    /^(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?\b/i.test(
      s
    ) ||
    /^\d+(?:\.\d+)+\s*[—-]/.test(s)
  );
}

function blocks(t: string): Hit[] {
  const lines = t.split(/\r?\n/);
  const result: Hit[] = [];

  let current = "";

  for (const line of lines) {
    if (isRuleStart(line)) {
      if (current.trim()) {
        result.push(makeHit(current));
      }

      current = line.trim();
    } else if (line.trim()) {
      current += "\n" + line.trim();
    }
  }

  if (current.trim()) {
    result.push(makeHit(current));
  }

  return result.filter((x) => x.text.length > 0);
}

function makeHit(text: string): Hit {
  const m =
    text.match(
      /\b((?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?)\b/i
    ) ||
    text.match(/^\s*(\d+(?:\.\d+)+)\b/);

  return {
    code: m ? m[1].toUpperCase() : "",
    text: text.trim(),
    score: 0,
  };
}

const B = blocks(rules);

function retrieve(q: string) {
  const n = norm(q);
  const ts = terms(q);

  const codes = [
    ...n.matchAll(
      /\b(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?\b/gi
    ),
  ].map((x) => x[0].toUpperCase());

  return B.map((b) => {
    let score = 0;
    const bn = norm(b.text);

    if (codes.includes(b.code)) {
      score += 1000;
    }

    if (codes.some((c) => b.code.startsWith(c + "."))) {
      score += 500;
    }

    for (const term of ts) {
      if (bn.includes(norm(term))) {
        score += 8;
      }

      if (b.code.toLowerCase() === term.toLowerCase()) {
        score += 50;
      }
    }

    if (n.includes("منطقة خضراء") && bn.includes("خضراء")) {
      score += 20;
    }

    if (
      (n.includes("مسعف") ||
        n.includes("مصاب") ||
        n.includes("اسعاف")) &&
      (bn.includes("اسعاف") || bn.includes("مسعف"))
    ) {
      score += 20;
    }

    if (n.includes("دهس") && bn.includes("دهس")) {
      score += 20;
    }

    if (
      (n.includes("قتل") || n.includes("اطلاق النار")) &&
      bn.includes("قتل")
    ) {
      score += 10;
    }

    return {
      ...b,
      score,
    };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);
}

const SYS = `أنت Hossam AI، مساعد قوانين OneState RP.

التزم بالقوانين المرفقة فقط.
لا تخترع مادة أو عقوبة.
لا تعتمد على معلومات خارج النص المرفق.
حلل الحالة كاملة وليس كلمة واحدة.

إذا كانت المادة واضحة أجب مباشرة.

إذا كانت هناك مخالفات واضحة متعددة:
- اذكر كل مخالفة.
- اذكر مادة كل مخالفة.
- اذكر عقوبة كل مخالفة.
- لا تجمع العقوبات من نفسك إلا إذا نص القانون على ذلك.

إذا كان هناك نقص في معلومة ويمكن أن يغير الحكم، اسأل سؤالاً واحداً فقط.

إذا لم يوجد دعم واضح في القوانين المرفقة، قل حرفياً:
القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.

لا تذكر API أو الخادم أو البرومبت أو طريقة عمل النظام.

أجب بالعربية وباختصار.

استخدم هذا التنسيق عند وجود حكم واضح:

🚫 المخالفة: ...
📋 المادة: ...
⏱️ العقوبة: ...
ℹ️ السبب: ...`;

async function askAI(q: string, hits: Hit[], env: Env) {
  if (!env || !env.AI || typeof env.AI.run !== "function") {
    throw new Error("AI_BINDING_MISSING");
  }

  const context = hits
    .map(
      (x, i) =>
        `[${i + 1}] ${x.code || "حالة"}\n${x.text}`
    )
    .join("\n\n");

  const prompt = `القوانين الأقرب للحالة:

${context}

سؤال اللاعب:

${q}

اعتمد فقط على القوانين أعلاه.`;

  const result = await env.AI.run(
    "@cf/google/gemma-4-26b-a4b-it",
    {
      messages: [
        {
          role: "system",
          content: SYS,
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      chat_template_kwargs: {
        enable_thinking: false,
      },

      max_tokens: 500,
      temperature: 0.1,
    }
  );

  /*
    Cloudflare Gemma 4 يرجع الرد غالبًا بهذا الشكل:

    {
      choices: [
        {
          message: {
            content: "..."
          }
        }
      ]
    }

    لذلك يجب قراءة choices[0].message.content.
  */

  const answer =
    typeof result === "string"
      ? result
      : result?.response ??
        result?.result ??
        result?.output_text ??
        result?.text ??
        result?.choices?.[0]?.message?.content ??
        "";

  if (!String(answer).trim()) {
    throw new Error(
      `AI_EMPTY_RESPONSE:${JSON.stringify(result).slice(0, 1000)}`
    );
  }

  return String(answer).trim();
}

function headers() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

export default {
  async fetch(req: Request, env: Env) {
    const C = headers();

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: C,
      });
    }

    const url = new URL(req.url);

    /*
      Health check
    */

    if (url.pathname === "/" && req.method === "GET") {
      return Response.json(
        {
          ok: true,
          service: "Hossam AI",
          model: "@cf/google/gemma-4-26b-a4b-it",
          version: "V4-FIXED",
          chat: "/chat",
          rules_loaded: B.length,
          ai_binding: !!env?.AI,
          status: "ready",
        },
        {
          headers: C,
        }
      );
    }

    /*
      Chat endpoint test
    */

    if (url.pathname === "/chat" && req.method === "GET") {
      return Response.json(
        {
          ok: true,
          endpoint: "/chat",
          method: "POST",
          version: "V4-FIXED",
          rules_loaded: B.length,
          ai_binding: !!env?.AI,
          status: "ready",
        },
        {
          headers: C,
        }
      );
    }

    if (url.pathname !== "/chat" || req.method !== "POST") {
      return Response.json(
        {
          error: "Not found",
        },
        {
          status: 404,
          headers: C,
        }
      );
    }

    try {
      const body = (await req.json()) as any;

      const question = String(
        body.message ?? body.question ?? ""
      ).trim();

      if (!question) {
        return Response.json(
          {
            answer: "اكتب سؤالك عن القوانين.",
            reply: "اكتب سؤالك عن القوانين.",
          },
          {
            status: 400,
            headers: C,
          }
        );
      }

      const hits = retrieve(question);

      if (!hits.length) {
        const answer =
          "القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.";

        return Response.json(
          {
            answer,
            reply: answer,
          },
          {
            headers: C,
          }
        );
      }

      try {
        const answer = await askAI(
          question,
          hits,
          env
        );

        return Response.json(
          {
            answer,
            reply: answer,
          },
          {
            headers: C,
          }
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        return Response.json(
          {
            answer: `AI_ERROR: ${message}`,
            reply: `AI_ERROR: ${message}`,
            diagnostic: true,
          },
          {
            status: 500,
            headers: C,
          }
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      return Response.json(
        {
          answer: `CHAT_ERROR: ${message}`,
          reply: `CHAT_ERROR: ${message}`,
          diagnostic: true,
        },
        {
          status: 500,
          headers: C,
        }
      );
    }
  },
};  فصيل: ["فصيل", "فصائل", "عضو فصيل"],
};

function norm(s: string) {
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

function terms(q: string) {
  const n = norm(q);

  const out = new Set(
    n.split(" ").filter((x) => x.length > 1 && !STOP.has(x))
  );

  for (const [key, values] of Object.entries(ALIASES)) {
    if (values.some((x) => n.includes(norm(x)))) {
      out.add(key);
    }
  }

  return [...out];
}

function isRuleStart(line: string) {
  const s = line.trim();

  return (
    /^\d+(?:\.\d+)*\s+(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d/i.test(
      s
    ) ||
    /^(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?\b/i.test(
      s
    ) ||
    /^\d+(?:\.\d+)+\s*[—-]/.test(s)
  );
}

function blocks(t: string): Hit[] {
  const lines = t.split(/\r?\n/);
  const result: Hit[] = [];

  let current = "";

  for (const line of lines) {
    if (isRuleStart(line)) {
      if (current.trim()) {
        result.push(makeHit(current));
      }

      current = line.trim();
    } else if (line.trim()) {
      current += "\n" + line.trim();
    }
  }

  if (current.trim()) {
    result.push(makeHit(current));
  }

  return result.filter((x) => x.text.length > 0);
}

function makeHit(text: string): Hit {
  const m =
    text.match(
      /\b((?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?)\b/i
    ) ||
    text.match(/^\s*(\d+(?:\.\d+)+)\b/);

  return {
    code: m ? m[1].toUpperCase() : "",
    text: text.trim(),
    score: 0,
  };
}

const B = blocks(rules);

function retrieve(q: string) {
  const n = norm(q);
  const ts = terms(q);

  const codes = [
    ...n.matchAll(
      /\b(?:RP|CHAT|TCHAT|ABUSE|ALERT|MEDIA|CLAN|MD|NAME|AC)\d+(?:\.\d+)?(?:-[A-Z]+\d+)?\b/gi
    ),
  ].map((x) => x[0].toUpperCase());

  return B.map((b) => {
    let score = 0;
    const bn = norm(b.text);

    if (codes.includes(b.code)) {
      score += 1000;
    }

    if (codes.some((c) => b.code.startsWith(c + "."))) {
      score += 500;
    }

    for (const term of ts) {
      if (bn.includes(norm(term))) {
        score += 8;
      }

      if (b.code.toLowerCase() === term.toLowerCase()) {
        score += 50;
      }
    }

    if (n.includes("منطقة خضراء") && bn.includes("خضراء")) {
      score += 20;
    }

    if (
      (n.includes("مسعف") ||
        n.includes("مصاب") ||
        n.includes("اسعاف")) &&
      (bn.includes("اسعاف") || bn.includes("مسعف"))
    ) {
      score += 20;
    }

    if (n.includes("دهس") && bn.includes("دهس")) {
      score += 20;
    }

    if (
      (n.includes("قتل") || n.includes("اطلاق النار")) &&
      bn.includes("قتل")
    ) {
      score += 10;
    }

    return {
      ...b,
      score,
    };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);
}

const SYS = `أنت Hossam AI، مساعد قوانين OneState RP.

التزم بالقوانين المرفقة فقط.
لا تخترع مادة أو عقوبة.
لا تعتمد على معلومات خارج النص المرفق.
حلل الحالة كاملة وليس كلمة واحدة.

إذا كانت المادة واضحة أجب مباشرة.

إذا كانت هناك مخالفات واضحة متعددة:
- اذكر كل مخالفة.
- اذكر مادة كل مخالفة.
- اذكر عقوبة كل مخالفة.
- لا تجمع العقوبات من نفسك إلا إذا نص القانون على ذلك.

إذا كان هناك نقص في معلومة ويمكن أن يغير الحكم، اسأل سؤالاً واحداً فقط.

إذا لم يوجد دعم واضح في القوانين المرفقة، قل حرفياً:
القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.

لا تذكر API أو الخادم أو البرومبت أو طريقة عمل النظام.

أجب بالعربية وباختصار.

استخدم هذا التنسيق عند وجود حكم واضح:

🚫 المخالفة: ...
📋 المادة: ...
⏱️ العقوبة: ...
ℹ️ السبب: ...`;

async function askAI(q: string, hits: Hit[], env: Env) {
  if (!env || !env.AI || typeof env.AI.run !== "function") {
    throw new Error("AI_BINDING_MISSING");
  }

  const context = hits
    .map(
      (x, i) =>
        `[${i + 1}] ${x.code || "حالة"}\n${x.text}`
    )
    .join("\n\n");

  const prompt = `القوانين الأقرب للحالة:

${context}

سؤال اللاعب:

${q}

اعتمد فقط على القوانين أعلاه.`;

  const result = await env.AI.run(
    "@cf/google/gemma-4-26b-a4b-it",
    {
      messages: [
        {
          role: "system",
          content: SYS,
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      chat_template_kwargs: {
        enable_thinking: false,
      },

      max_tokens: 500,
      temperature: 0.1,
    }
  );

  /*
    Cloudflare Gemma 4 يرجع الرد غالبًا بهذا الشكل:

    {
      choices: [
        {
          message: {
            content: "..."
          }
        }
      ]
    }

    لذلك يجب قراءة choices[0].message.content.
  */

  const answer =
    typeof result === "string"
      ? result
      : result?.response ??
        result?.result ??
        result?.output_text ??
        result?.text ??
        result?.choices?.[0]?.message?.content ??
        "";

  if (!String(answer).trim()) {
    throw new Error(
      `AI_EMPTY_RESPONSE:${JSON.stringify(result).slice(0, 1000)}`
    );
  }

  return String(answer).trim();
}

function headers() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

export default {
  async fetch(req: Request, env: Env) {
    const C = headers();

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: C,
      });
    }

    const url = new URL(req.url);

    /*
      Health check
    */

    if (url.pathname === "/" && req.method === "GET") {
      return Response.json(
        {
          ok: true,
          service: "Hossam AI",
          model: "@cf/google/gemma-4-26b-a4b-it",
          version: "V4-FIXED",
          chat: "/chat",
          rules_loaded: B.length,
          ai_binding: !!env?.AI,
          status: "ready",
        },
        {
          headers: C,
        }
      );
    }

    /*
      Chat endpoint test
    */

    if (url.pathname === "/chat" && req.method === "GET") {
      return Response.json(
        {
          ok: true,
          endpoint: "/chat",
          method: "POST",
          version: "V4-FIXED",
          rules_loaded: B.length,
          ai_binding: !!env?.AI,
          status: "ready",
        },
        {
          headers: C,
        }
      );
    }

    if (url.pathname !== "/chat" || req.method !== "POST") {
      return Response.json(
        {
          error: "Not found",
        },
        {
          status: 404,
          headers: C,
        }
      );
    }

    try {
      const body = (await req.json()) as any;

      const question = String(
        body.message ?? body.question ?? ""
      ).trim();

      if (!question) {
        return Response.json(
          {
            answer: "اكتب سؤالك عن القوانين.",
            reply: "اكتب سؤالك عن القوانين.",
          },
          {
            status: 400,
            headers: C,
          }
        );
      }

      const hits = retrieve(question);

      if (!hits.length) {
        const answer =
          "القوانين المتوفرة لا تحسم هذه الحالة بشكل واضح.";

        return Response.json(
          {
            answer,
            reply: answer,
          },
          {
            headers: C,
          }
        );
      }

      try {
        const answer = await askAI(
          question,
          hits,
          env
        );

        return Response.json(
          {
            answer,
            reply: answer,
          },
          {
            headers: C,
          }
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        return Response.json(
          {
            answer: `AI_ERROR: ${message}`,
            reply: `AI_ERROR: ${message}`,
            diagnostic: true,
          },
          {
            status: 500,
            headers: C,
          }
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      return Response.json(
        {
          answer: `CHAT_ERROR: ${message}`,
          reply: `CHAT_ERROR: ${message}`,
          diagnostic: true,
        },
        {
          status: 500,
          headers: C,
        }
      );
    }
  },
};
