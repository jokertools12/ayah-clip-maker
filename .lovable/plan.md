

# خطة: إصلاح التوهج أثناء التصدير + تحسين الأداء + خيار تأثير التكبير

## المشاكل والحلول

### 1. خيار تأثير التكبير (اختياري)

**الملف**: `DisplaySettingsPanel.tsx` + `VideoPreview.tsx`

إضافة خاصية `wordScaleEffect` (boolean) إلى `DisplaySettings`:
- إضافتها للـ interface في `DisplaySettingsPanel.tsx` (سطر 14-38)
- إضافة Switch تحت قسم "نمط تمييز الكلمات" (بعد سطر 402) بعنوان "تأثير تكبير الكلمة"
- القيمة الافتراضية: `true`

في `VideoPreview.tsx` (سطر 1983-1988): لف كود `scalePulse` بشرط:
```typescript
if (isWordHighlighted && displaySettings.wordScaleEffect !== false) {
  // scale logic...
}
```

### 2. تحسين أداء الفيديو أثناء التصدير

**الملف**: `VideoPreview.tsx`

الأماكن الثقيلة المحددة:
- **إطارات معقدة أثناء التسجيل**: الإطارات `ornate`, `golden`, `geometric` تحتوي على عمليات رسم ثقيلة (bezierCurveTo, arc, shadowBlur). في وضع التسجيل العادي (ليس فقط `recordingLite`)، تقليل shadowBlur للإطارات
- **الـ vignette**: تخطيها أثناء التسجيل (موجود بالفعل ✓)
- **تحسين حلقة الرسم المعزولة**: إضافة `try-catch` حول `drawIsolatedFrame` في `PreviewPage.tsx` لمنع توقف التسجيل عند أي خطأ

**الملف**: `PreviewPage.tsx` (سطر 1047-1058)

إضافة `try-catch` داخل `drawIsolatedFrame`:
```typescript
const drawIsolatedFrame = () => {
  try {
    const livePreviewApi = videoPreviewRef.current;
    const draw = livePreviewApi?.drawFrame ?? previewApi.drawFrame;
    draw(recordingCanvas, attempt.renderMode);
  } catch (e) {
    console.warn('Frame draw error:', e);
  }
};
```

### 3. تحسين إضافي للأداء — تقليل الظلال في وضع التسجيل العادي

في `VideoPreview.tsx`، الظلال في وضع التسجيل العادي (ليس lite فقط) ثقيلة:
- سطر 1177: `shadowBlur = 8 * S` → `isAnyRecording ? 4 * S : 8 * S`
- سطر 1197: `shadowBlur = 6 * S` → `isAnyRecording ? 3 * S : 6 * S`  
- سطر 1244: `shadowBlur = 18 * S` → `isAnyRecording ? 6 * S : 18 * S`
- سطر 1248: `shadowBlur = 8 * S` → `isAnyRecording ? 3 * S : 8 * S`
- سطر 1363: `shadowBlur = 6 * S` → `isAnyRecording ? 3 * S : 6 * S`
- سطر 1993: `(18 + glowPulse * 28)` → `isAnyRecording ? (8 + glowPulse * 14) : (18 + glowPulse * 28)` (داخل scale block)

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `DisplaySettingsPanel.tsx` | إضافة `wordScaleEffect` للـ interface + Switch UI |
| `VideoPreview.tsx` | شرط `wordScaleEffect` على التكبير + تقليل shadowBlur في التسجيل + إضافة default |
| `PreviewPage.tsx` | try-catch في drawIsolatedFrame |

~30 سطر تغييرات إجمالي.

