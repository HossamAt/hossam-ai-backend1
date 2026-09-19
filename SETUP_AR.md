# إعداد Hossam AI على Cloudflare

## 1) Cloudflare
أنشئ حساب Cloudflare ثم Worker جديد.

## 2) المشروع
ارفع الملفات:
- src/index.ts
- src/rules.ts
- wrangler.jsonc
- package.json

## 3) لا تضف GEMINI_API_KEY
هذه النسخة لا تستخدم Gemini API.

## 4) النشر
npm install
npx wrangler deploy

## 5) رابط الـAPI
بعد النشر سيكون لديك رابط Worker.
في تطبيق Android يجب وضع:
POST https://YOUR-WORKER.workers.dev/chat

والـJSON:
{"message":"سؤال المستخدم"}

## 6) الاختبار
GET https://YOUR-WORKER.workers.dev/
ثم POST /chat.

إذا أعاد GET `status: ready` فالـWorker يعمل.
