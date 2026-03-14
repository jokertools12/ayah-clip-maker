

# خطة: استبدال Pexels بـ Pixabay + إصلاح جذري لسلاسة التسجيل

## التشخيص الحقيقي

المشكلة ليست فقط في مصدر الفيديو — بل في طريقة رسم الفيديو على Canvas أثناء التسجيل. حتى مع التطبيع، `drawImage(video, ...)` في كل إطار عبر `requestAnimationFrame` يتنافس مع `MediaRecorder` على الـ Main Thread. لكن تغيير المصدر إلى Pixabay سيساعد أيضاً لأن Pixabay يوفر فيديوهات بأحجام محددة مسبقاً (tiny/small/medium/large) مما يقلل الضغط.

## ما سيتم تنفيذه

### 1. استبدال Pexels API بـ Pixabay API

**ملف جديد: `src/lib/pixabayApi.ts`**
- Pixabay Video API: `https://pixabay.com/api/videos/?key=API_KEY&q=...`
- مفتاح API مجاني (publishable key — آمن للتخزين في الكود)
- يوفر فيديوهات بأحجام: `tiny` (100p), `small` (270p), `medium` (640p), `large` (1280p)
- نستخدم `medium` للمعاينة و `large` للتسجيل (أو `medium` مباشرة لتقليل الضغط)
- نفس التصنيفات الحالية (طبيعة، سماء، جبال، محيط...)

**تعديل: `src/components/PexelsVideoSelector.tsx` → إعادة تسميته لـ `VideoBackgroundSelector.tsx`**
- تغيير الاستيراد من `pexelsApi` إلى `pixabayApi`
- نفس الواجهة تماماً (بحث + تصنيفات + شبكة مصغرات)
- تغيير الائتمان في الأسفل إلى "Pixabay"

### 2. إصلاح سلاسة التسجيل — استخدام `requestVideoFrameCallback`

**تعديل: `src/pages/PreviewPage.tsx`**
- استبدال `requestAnimationFrame` بـ `requestVideoFrameCallback` لرسم إطارات الفيديو
- هذا الـ API يُطلق callback **فقط عند وجود إطار فيديو جديد فعلي** — لا تكرار لإطارات قديمة ولا فقدان لإطارات جديدة
- Fallback إلى `requestAnimationFrame` للمتصفحات التي لا تدعمه

```text
الحالي (يسبب تهنيج):
  rAF → drawImage(video) كل ~16ms حتى لو الفيديو لم يُنتج إطار جديد
  
الجديد (سلس):
  requestVideoFrameCallback → يُطلق فقط مع كل إطار فيديو حقيقي
  + rAF منفصل لرسم الـ overlay فقط
```

### 3. تبسيط pipeline التطبيع

**تعديل: `src/components/VideoPreview.tsx`**
- بما أن Pixabay يوفر فيديوهات بأحجام محددة ومعيارية، نقلل الاعتماد على FFmpeg normalization
- نستخدم حجم `medium` (640p) من Pixabay مباشرة — أخف بكثير من فيديوهات Pexels 4K
- نُبقي التطبيع كـ fallback اختياري فقط

### 4. تحديث الملفات المرتبطة

| الملف | التغيير |
|-------|---------|
| `src/lib/pixabayApi.ts` | **جديد** — API wrapper لـ Pixabay Videos |
| `src/lib/pexelsApi.ts` | يُبقى كـ fallback (لا يُحذف) |
| `src/components/PexelsVideoSelector.tsx` | يستخدم Pixabay بدلاً من Pexels |
| `src/components/BackgroundSelector.tsx` | تحديث التسمية والائتمان |
| `src/pages/PreviewPage.tsx` | `requestVideoFrameCallback` + تبسيط pipeline |
| `src/components/VideoPreview.tsx` | تقليل التطبيع لفيديوهات Pixabay (أحجام معيارية) |

### 5. لماذا Pixabay أفضل لهذا الاستخدام

- فيديوهات بأحجام **محددة مسبقاً** (لا حاجة لتطبيع الدقة)
- معظم الفيديوهات **CFR** (معدل فريمات ثابت)
- API مجاني مع 100 طلب/دقيقة
- مكتبة ضخمة من فيديوهات الطبيعة عالية الجودة
- لا تحتاج attribution (مثل Pexels)

