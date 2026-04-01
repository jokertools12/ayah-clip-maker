

# خطة: إصلاح رفع الخلفية في الابتهالات + خطوط وألوان + تحسين توقيت الكلمات بالذكاء الاصطناعي

## المشكلة 1: تبويب رفع صورة/فيديو في الابتهالات لا يعمل

**السبب**: في `IbtahalatPage.tsx` سطر 419، `BackgroundSelector` لا يُمرر له `customBackground` أو `onCustomBackgroundChange`، فالرفع لا يُخزّن ولا يُمرر لصفحة المعاينة.

**الحل**:
- إضافة state `customBg` و `customBgType` في `IbtahalatPage`
- تمرير `customBackground` و `onCustomBackgroundChange` لـ `BackgroundSelector`
- في `handleCreateVideo`، إضافة `customBgUrl` و `customBgType` للـ URL params
- في `BackgroundSelector.tsx` سطر 141: تمرير `currentBackgroundType` أيضاً للـ `CustomBackgroundUploader`

## المشكلة 2: خطوط وألوان وميزات احترافية للابتهالات

**الحل**: إضافة تبويب "النص" في صفحة المعاينة للابتهالات يحتوي على:
- خطوط إضافية احترافية (الثلث، ديواني، كوفي)
- ألوان إضافية للنص (ذهبي متدرج، فضي، كهرماني، أزرق سماوي)
- حجم خط الكلمات (Slider)
- تباعد الأسطر

**الملفات**: `TextSettingsPanel.tsx` — إضافة 4 خطوط جديدة و5 ألوان جديدة

## المشكلة 3: تحسين توقيت الكلمات بالذكاء الاصطناعي

**السبب**: النسخ الحالي عبر `chunkedTranscribe.ts` يُنتج أسطر بتوقيتات تقريبية. كل شيخ سرعته مختلفة.

**الحل**: إنشاء edge function `refine-timing` تستخدم Lovable AI (Gemini) لتحسين التوقيتات:
1. إرسال النص المنسوخ مع التوقيتات الحالية + مدة الصوت
2. طلب من Gemini تحسين التوقيتات بناءً على طول الكلمات وسرعة النطق المتوقعة
3. إضافة زر "تحسين بالذكاء الاصطناعي" في المعاينة بجانب زر "إعادة النسخ"

**ملاحظة**: سنستخدم `LOVABLE_API_KEY` الموجود مسبقاً عبر Lovable AI Gateway بدلاً من مفتاح Gemini المباشر — لأنه يدعم نفس النماذج ومُعد تلقائياً.

### Edge Function: `supabase/functions/refine-timing/index.ts`
- يستقبل: `{ lines: TranscribedLine[], totalDuration: number }`
- يرسل لـ Gemini: prompt يطلب تحسين start/end لكل سطر ليتناسب مع النطق الطبيعي
- يُعيد: أسطر بتوقيتات محسّنة

### تغييرات `PreviewPage.tsx`:
- إضافة زر "تحسين التوقيت بالذكاء الاصطناعي" في قسم الابتهالات
- عند الضغط: إرسال الأسطر للـ edge function ← تحديث `transcribedLines` بالنتيجة

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `IbtahalatPage.tsx` | إضافة customBg state + تمريره لـ BackgroundSelector + URL params |
| `BackgroundSelector.tsx` | تمرير `currentBackgroundType` للـ CustomBackgroundUploader |
| `TextSettingsPanel.tsx` | إضافة خطوط وألوان جديدة |
| `PreviewPage.tsx` | زر تحسين التوقيت بالذكاء الاصطناعي + استقبال customBg من URL |
| `supabase/functions/refine-timing/index.ts` | edge function جديدة لتحسين التوقيتات |

~150 سطر تغييرات إجمالي.

