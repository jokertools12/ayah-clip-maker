

# خطة: إصلاح شامل للتسجيل + Pixabay thumbnails + requestVideoFrameCallback

## المشاكل المحددة

### 1. صور Pixabay المصغرة لا تظهر
الكود يستخدم `https://i.vimeocdn.com/video/${video.picture_id}_295x166.jpg` وهذا رابط Vimeo وليس Pixabay. Pixabay لا يوفر thumbnails بهذا الشكل.

**الحل:** استخدام أول إطار من الفيديو نفسه كـ thumbnail، أو استخدام رابط `small` من الفيديو كمصدر thumbnail عبر عنصر `<video>` بدلاً من `<img>`.

### 2. الصور المتحركة (Slideshow) لا تظهر في التسجيل
`drawVideoFrame()` (المستخدم في حلقة التسجيل Layer 1) لا يتعامل مع `slideshowImagesRef` إطلاقاً — فقط مع `videoRef` و `imageRef`. لذلك خلفيات slideshow تظهر سوداء في الفيديو المسجل.

**الحل:** تعديل حلقة التسجيل في `PreviewPage.tsx` لاستخدام `drawFrame(recordingCanvas, 'recording', timeMs)` الكامل بدلاً من فصل `drawVideoFrame` + `drawFrame(overlayOnly)` عندما تكون الخلفية صوراً أو slideshow. الفصل الطبقي يبقى فقط لخلفيات الفيديو.

### 3. الصور الثابتة لا تظهر بحركة Ken Burns في التسجيل
`drawVideoFrame` يرسم الصورة بدون أي حركة (بدون scale/offset). لذا تظهر الصورة ثابتة بدون التأثير الحركي.

**الحل:** نفس الحل أعلاه — استخدام `drawFrame` الكامل للخلفيات غير-الفيديو.

### 4. لا يوجد `requestVideoFrameCallback`
الحلقة الحالية تستخدم `requestAnimationFrame` مما يعني رسم الفيديو حتى لو لم يُنتج إطار جديد.

**الحل:** في حلقة التسجيل، استخدام `requestVideoFrameCallback` على عنصر الفيديو لرسم الخلفية فقط عند توفر إطار جديد حقيقي. مع fallback لـ rAF.

### 5. جودة Pixabay تلقائية (medium/large)
حالياً يتم استخدام `medium` دائماً. يجب استخدام `large` أثناء التسجيل.

**الحل:** عند بدء التسجيل، تحميل نسخة `large` من الفيديو إذا كان pixabay. أو حفظ بيانات الفيديو الأصلية ليتم اختيار الجودة المناسبة.

---

## التعديلات على الملفات

### A) `src/lib/pixabayApi.ts`
- إصلاح `getVideoThumbnail()`: بدلاً من رابط vimeocdn المعطل، إرجاع رابط `tiny` video URL (كمصدر لعنصر video) أو بناء رابط صحيح من Pixabay CDN.

### B) `src/components/PexelsVideoSelector.tsx`
- إصلاح عرض المصغرات: استخدام عنصر `<video>` صامت مع poster بدلاً من `<img>` مع رابط معطل، أو استخدام `video.videos.tiny.url` كـ poster/preview.

### C) `src/components/VideoPreview.tsx`
- تحديث `drawVideoFrame` ليتعامل مع slideshow backgrounds (رسم الصور المتحركة مع Ken Burns).
- أو الأفضل: إضافة دالة `drawBackgroundFrame(targetCanvas, timeMs)` جديدة تدعم كل أنواع الخلفيات.

### D) `src/pages/PreviewPage.tsx`
- تعديل حلقة التسجيل (`drawLoop`):
  - لخلفيات الفيديو: استخدام `requestVideoFrameCallback` بدلاً من rAF لرسم Layer 1
  - لخلفيات الصور/Slideshow: استخدام `drawFrame(recordingCanvas, 'recording', timeMs)` الكامل (لا فصل طبقي)
  - تحسين التزامن العام
- حفظ بيانات Pixabay الأصلية لاختيار جودة `large` أثناء التسجيل

### E) `src/components/BackgroundSelector.tsx`
- تحديثات طفيفة إذا لزم لعرض Pixabay بشكل صحيح

---

## النتيجة المتوقعة
- مصغرات Pixabay تظهر بشكل صحيح
- خلفيات الصور والصور المتحركة (slideshow) تظهر في الفيديو المسجل مع تأثيرات Ken Burns
- فيديوهات الخلفية تُرسم فقط عند توفر إطار جديد حقيقي (rVFC)
- جودة Pixabay تتبدل تلقائياً حسب السياق

