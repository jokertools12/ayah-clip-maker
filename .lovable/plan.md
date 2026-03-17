

# خطة: إضافة تبويب Pexels + إصلاح الخلفية السوداء في التسجيل

## المشاكل المحددة

1. **لا يوجد تبويب Pexels منفصل** — حالياً التبويب الوحيد للفيديو يستخدم Pixabay. المطلوب إضافة تبويب ثانٍ لـ Pexels مع استخدام المفتاح الموجود بالفعل في `src/lib/pexelsApi.ts`.

2. **الخلفية السوداء في التسجيل** — المشكلة الرئيسية: الصور الثابتة والصور المتحركة (slideshow) لا تظهر في الفيديو المسجل النهائي. السبب المحتمل:
   - `drawVideoFrame` يعمل بشكل صحيح (يتعامل مع video + slideshow + image مع Ken Burns) — تم إصلاحه في الرسالة السابقة
   - لكن `slideshowReady` و `imageLoaded` قد يكونان `false` أثناء التسجيل إذا لم يكتمل التحميل قبل بدء الرسم
   - المشكلة الأخرى: `performance.now()` في `drawVideoFrame` يُستخدم للحركة لكن التوقيت قد لا يتزامن مع حلقة التسجيل

3. **تبويبات 5 بدلاً من 4** — نحتاج `grid-cols-5` في TabsList لاستيعاب: رفع، صور، متغيرة، Pixabay، Pexels.

---

## التعديلات المطلوبة

### A) `src/components/BackgroundSelector.tsx`
- إضافة تبويب خامس `pexelsOriginal` لفيديوهات Pexels
- إنشاء مكون `PexelsOriginalVideoSelector` جديد (أو إعادة استخدام كود مشابه لـ PexelsVideoSelector الحالي لكن يستدعي `pexelsApi`)
- تغيير `grid-cols-4` إلى `grid-cols-5`
- تغيير تسمية تبويب الفيديو الحالي من "فيديو" إلى "Pixabay"
- إضافة تبويب "Pexels" الجديد

### B) إنشاء `src/components/PexelsOriginalVideoSelector.tsx`
- مكون جديد يستخدم `searchPexelsVideos` و `getBestVideoUrl` من `src/lib/pexelsApi.ts`
- نفس واجهة PexelsVideoSelector (بحث + تصنيفات + شبكة مصغرات)
- استخدام `video.image` كـ thumbnail (Pexels يوفر صورة مصغرة مباشرة)
- `onSelect(videoUrl, thumbnailUrl)` بنفس الـ interface

### C) `src/components/VideoPreview.tsx` — إصلاح الخلفية السوداء
- في `drawVideoFrame`: التأكد من أن الدالة تعمل حتى لو `slideshowReady` أو `imageLoaded` لم يتم تحديثهم بعد render الأخير (بسبب closure)
- استخدام `ref` بدلاً من `state` للتحقق من جاهزية الخلفية في `drawVideoFrame` — `slideshowReadyRef` و `imageLoadedRef` — لأن `useCallback` قد يحتفظ بقيم قديمة
- إضافة fallback: إذا لم يتوفر أي مصدر خلفية، رسم لون أسود مع تحذير في console بدلاً من ترك الكانفاس فارغاً

### D) `src/pages/PreviewPage.tsx` — تحسينات طفيفة
- إضافة دعم لفيديوهات Pexels في فحص `isPexelsBackground`
- التأكد من أن `handlePexelsVideoSelect` يعمل لكلا المصدرين (Pixabay و Pexels)

---

## النتيجة المتوقعة
- تبويبان منفصلان: Pixabay و Pexels للفيديوهات
- جميع أنواع الخلفيات (صور، متغيرة، Pixabay، Pexels) تظهر في الفيديو المسجل النهائي
- لا خلفية سوداء في أي نوع من الخلفيات

