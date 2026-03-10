

# خطة: إصلاح ظهور خلفية سوداء في الفيديو المُصدّر + تحسين نظام الطبقات

## السبب الجذري

بعد فحص شامل للكود، المشكلة الرئيسية هي **تلوث Canvas (Canvas Taint)** أثناء التسجيل:

1. **فيديو Pexels يُحمّل بـ `crossOrigin='anonymous'` مع Direct CORS** — اختبار التلوث (`toDataURL`) ينجح عند التحميل الأول
2. **لكن `captureStream()` له سلوك أمني مختلف** في بعض المتصفحات — عندما يُرسم الفيديو على canvas وسيط (`videoScaleCanvasRef`) ثم يُنسخ إلى `recordingCanvas`، تتراكم التلوثات وتُنتج إطارات سوداء
3. **المشكلة الثانية**: عند `isRecording=true`، حلقة الرسم في المعاينة **تتوقف تمامًا** (سطر 2130-2132) — تُرسم إطار واحد ثم لا شيء. الفيديو يبدو يعمل في المعاينة لأن المتصفح يعرض آخر إطار مرسوم

## الحل: نظام طبقات معزول + Blob-First Loading

### التغيير 1: `VideoPreview.tsx` — تحميل Pexels كـ Blob دائمًا

بدلاً من الاعتماد على Direct CORS (الذي قد يفشل مع `captureStream`)، نحمّل الفيديو كـ Blob أولاً عبر الـ proxy، مما يجعله same-origin ويمنع أي تلوث:

```text
┌─────────────────────┐
│ Pexels Video URL    │
└────────┬────────────┘
         ▼
┌─────────────────────┐     ┌────────────────┐
│ Try fetch() + blob  │────▶│ Blob URL       │ ← same-origin = لا تلوث أبداً
│ (direct download)   │     │ (video.src)    │
└────────┬────────────┘     └────────────────┘
         │ fail
         ▼
┌─────────────────────┐     ┌────────────────┐
│ Proxy Edge Function │────▶│ Blob URL       │
└────────┬────────────┘     └────────────────┘
         │ fail
         ▼
┌─────────────────────┐
│ Direct CORS (legacy)│
└─────────────────────┘
```

- في `loadDirectVideo()`: بدلاً من `video.crossOrigin = 'anonymous'; video.src = bgUrl`, نستخدم `fetch(bgUrl)` → `blob()` → `URL.createObjectURL()` → `video.src = blobUrl`
- هذا يضمن أن الفيديو same-origin ولن يُلوّث أي canvas

### التغيير 2: `VideoPreview.tsx` — إزالة Scale Canvas الوسيط أثناء التسجيل

Canvas الوسيط (`videoScaleCanvasRef`) يضيف طبقة تلوث إضافية. أثناء التسجيل، نرسم الفيديو مباشرة على recording canvas:

```
// أثناء التسجيل: رسم مباشر بدون canvas وسيط
if (!isPreviewRender) {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
} else {
  // أثناء المعاينة: استخدام scale canvas للأداء
  sCtx.drawImage(video, 0, 0, scaleW, scaleH);
  ctx.drawImage(sc, 0, 0, canvas.width, canvas.height);
}
```

### التغيير 3: `VideoPreview.tsx` — ضمان استمرار تشغيل الفيديو أثناء التسجيل

إضافة فحص `video.paused` في كل إطار تسجيل + إعادة تشغيل تلقائي:

```
if (video.paused) {
  video.play().catch(() => {});
}
```

### التغيير 4: `useVideoRecorder.ts` — Fallback عند فشل requestFrame

إذا فشل `requestFrame()` أو لم يكن متاحاً، نضيف fallback يرسم الإطارات عبر `setTimeout` مع FPS-based `captureStream`:

- تحسين الفحص ليشمل `requestFrame` type check
- عند الـ fallback، استمرار استدعاء `frameRenderer` حتى بدون `requestFrame`

### التغيير 5: `PreviewPage.tsx` — تبسيط منطق التسجيل

- إزالة `resolutionScale` المعقد — استخدام أبعاد الجودة مباشرة
- تقليل المتغيرات المشروطة الكثيرة (isPexels, isLong, isVeryLong)
- إضافة console.log تشخيصي عند بدء/انتهاء كل إطار للتصحيح

## النتيجة المتوقعة

- خلفية Pexels تظهر في الفيديو المُصدّر (لا خلفية سوداء)
- أداء أخف لأن الـ Blob يُحمّل مرة واحدة
- نظام الطبقات يعمل بدون تلوث canvas

