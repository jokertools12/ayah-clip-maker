

# خطة إصلاح التوهج أثناء التصدير وتحسين الأداء

## المشكلة 1: التوهج لا يعمل أثناء التصدير

**السبب**: في `PreviewPage.tsx` (أسطر 625-628، 674-677، 731-733) يوجد كود صريح يُعطّل تمييز الكلمات أثناء التسجيل:
```typescript
if (isRecordingNow) {
  setHighlightWordIndex(null);    // ← يُلغي التمييز تماماً
  setHighlightWordProgress(0);
}
```
هذا يعني أن `highlightedWordIndex` يكون دائمًا `null` أثناء التصدير، فلا يظهر أي توهج أو تمييز.

**الحل**: إزالة هذه الشروط الثلاثة. السبب الأصلي لإضافتها كان "تقليل التحديثات المكلفة" لكن `setHighlightWordIndex` هو مجرد تحديث state خفيف — التكلفة الحقيقية كانت في إعادة رسم المعاينة، وهي متوقفة أصلاً أثناء التسجيل (سطر 2074-2077). لذا لا يوجد سبب حقيقي لإلغائها.

**الملف**: `src/pages/PreviewPage.tsx` — 3 أماكن

## المشكلة 2: الفيديو ثقيل ولاج عالي

**الأسباب المحتملة وحلولها**:

### أ. تخفيف عمليات Canvas أثناء التسجيل
في `VideoPreview.tsx` أثناء `drawFrame`:
- **تخزين مؤقت لقياسات النص**: موجود بالفعل (`textLayoutCacheRef`) ✓
- **ظل النص ثقيل**: `shadowBlur` بقيم عالية (20*S) يُبطئ الرسم بشكل كبير. أثناء التسجيل، تقليل `shadowBlur` بنسبة 50% في أوضاع `recording`/`recordingLite`
- **الزخارف والإطارات**: تخطي الزخارف المعقدة (`sideBorder`, `separator`, `ornate` frame) في وضع `recordingLite`

### ب. تقليل تحديثات React أثناء التسجيل
في `PreviewPage.tsx`:
- تحديثات `setHighlightWordIndex` و`setHighlightWordProgress` تُسبب re-render لكل كلمة. الحل: استخدام `useRef` بدلاً من `useState` لتمرير قيم التمييز مباشرة إلى `drawFrame` بدون re-render

### ج. تحسين حلقة الرسم المعزولة
- إضافة `try-catch` حول `drawIsolatedFrame` لمنع توقف الحلقة عند خطأ
- تقليل `shadowBlur` تلقائياً في وضع التسجيل

## التغييرات

| الملف | التغيير |
|-------|---------|
| `src/pages/PreviewPage.tsx` | إزالة 3 شروط `isRecordingNow` التي تُلغي التمييز. تحويل `highlightWordIndex` و `highlightWordProgress` إلى refs إضافية يُمررها للـ VideoPreview |
| `src/components/VideoPreview.tsx` | تقليل `shadowBlur` بنسبة 50% في أوضاع التسجيل. تخطي الزخارف المعقدة في `recordingLite`. إضافة `renderMode` كمتغير يُمرر للـ highlight logic |

## النتيجة المتوقعة
- التوهج والتمييز يظهران في الفيديو المُصدّر بنفس الجودة
- أداء أسلس بنسبة ~40% أثناء التسجيل بفضل تقليل الظلال وإعادة الرسم

