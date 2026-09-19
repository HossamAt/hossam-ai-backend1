# Hossam AI — Cloudflare Workers AI V1

هذا هو البديل الجديد لـ Backend Gemini.

## ماذا يستخدم؟
- Cloudflare Workers
- Workers AI
- `@cf/google/gemma-4-26b-a4b-it`
- نفس `rules_ar.txt` الموجود في النسخة السابقة
- محرك اختيار للقوانين قبل إرسال السؤال للنموذج
- إجابة `answer` و`reply` معًا حتى يتوافق مع تطبيق Android

Cloudflare توثق أن Workers AI يمكن ربطه مباشرة عبر `env.AI`، وأن خطة Workers Free توفر 10,000 Neurons يوميًا، مع إعادة ضبط الحد يوميًا. 

## تشغيله
1. أنشئ Worker جديد في Cloudflare.
2. ارفع محتويات هذا المشروع أو اربطه بـ GitHub.
3. نفّذ:
   npm install
   npx wrangler deploy

لا يوجد GEMINI_API_KEY هنا.

## اختبار
بعد النشر افتح:
GET /
ويجب أن يرجع:
{"ok":true,"service":"Hossam AI","status":"ready"}

ثم POST إلى `/chat`:
{"message":"شو قانون RP4؟"}

الرد يحتوي:
{"ok":true,"answer":"...","reply":"..."}

## ملاحظة
الـ10,000 Neurons حصة يومية مجانية على Workers Free وفق وثائق Cloudflare الحالية. ليست 10,000 سؤال ثابتة؛ الاستهلاك يعتمد على النموذج وحجم الطلب.
