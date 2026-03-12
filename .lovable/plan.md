

# خطة: إصلاح تقطع الفيديو في التصدير — نظام تسجيل حقيقي الوقت

## المشكلة الجذرية

بعد تحليل الكود المعقد (~2250 سطر في `VideoPreview.tsx`):

1. **`drawFrame()` ثقيلة جداً** — تحسب تخطيط النص، ترسم إطارات إسلامية، Ken Burns، تأثيرات التوهج، كل إطار
2. **المنافسة على الـ Main Thread**: حلقة `requestAnimationFrame` + `captureStream(24)` يعملان معاً. عندما `drawFrame()` تأخذ أكثر من 42ms، المتصفح يُسقط إطارات → تقطع
3. **الفيديو يتحرك بوتيرة مختلفة عن الرسم**: `ctx.drawImage(video, ...)` يلتقط الإطار الحالي فقط — إذا فات وقت لم يُرسم فيه، تفوت إطارات

## الحل: فصل طبقة الفيديو عن طبقة النص

بدلاً من رسم كل شيء في canvas واحد، نفصل العمل:

```text
┌─────────────────────────────────────┐
│ طبقة 1: فيديو Pexels (video element)│  ← يتشغل طبيعي بدون تدخل
│ طبقة 2: overlay canvas خفيف         │  ← فقط نص + أرقام آيات
│            ↓  دمج سريع               │
│ طبقة 3: recording canvas            │  ← drawImage(video) + drawImage(overlay)
└─────────────────────────────────────┘
```

### التغيير 1: `VideoPreview.tsx` — فصل الرسم لنظام ثنائي الطبقات

**أثناء التسجيل فقط**، نفصل `drawFrame` إلى مرحلتين:
- **المرحلة 1 (ثقيلة - مرة كل 200ms)**: رسم النصوص والعناصر الثابتة على `overlayCanvas` منفصل (لا يتغير كل إطار)
- **المرحلة 2 (خفيفة - كل إطار)**: `drawImage(video)` + `drawImage(overlayCanvas)` فقط — عمليتين سريعتين

هذا يعني:
- الفيديو يُرسم كل إطار بسلاسة (عملية واحدة فقط: `drawImage`)
- النص يُحدّث فقط عند تغيير الآية (ليس كل إطار)
- الحمل يقل بـ 80%+ لكل إطار

### التغيير 2: `PreviewPage.tsx` — حلقة تسجيل ثنائية

تعديل `drawLoop` ليستخدم النظام الثنائي:

```typescript
const drawLoop = (timestamp) => {
  if (recordingStopped) return;
  if (!loopStartTime) loopStartTime = timestamp;
  const elapsedMs = timestamp - loopStartTime;

  const ctx = recordingCanvas.getContext('2d');
  
  // المرحلة 1: رسم الفيديو مباشرة (سريع جداً)
  const video = videoRef.current;
  if (video && !video.paused) {
    ctx.drawImage(video, 0, 0, recordingCanvas.width, recordingCanvas.height);
  }
  
  // المرحلة 2: رسم الأوفرلي المُحدّث (نسخة مخزنة)
  ctx.drawImage(overlayCanvas, 0, 0);
  
  rafId = requestAnimationFrame(drawLoop);
};

// تحديث الأوفرلي فقط كل 150-200ms أو عند تغيير الآية
const overlayInterval = setInterval(() => {
  drawOverlayOnly(overlayCanvas, renderMode, elapsedMs);
}, 150);
```

### التغيير 3: `VideoPreview.tsx` — إضافة `drawOverlayOnly()` 

دالة جديدة ترسم فقط:
- الأوفرلي الشفاف `rgba(0,0,0, overlayOpacity)`
- النص (سورة + قارئ + آية حالية)
- رقم الآية
- العلامة المائية

**بدون**: خلفية، Ken Burns، تدرجات، فيديو. فقط النصوص على خلفية شفافة.

### التغيير 4: `VideoPreview.tsx` — إضافة `drawVideoFrame()`

دالة خفيفة جداً ترسم فقط:
```typescript
drawVideoFrame(targetCanvas) {
  const ctx = targetCanvas.getContext('2d');
  const video = videoRef.current;
  if (video && video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, targetCanvas.width, targetCanvas.height);
  }
}
```

### التغيير 5: تعريض الـ API الجديد

إضافة `drawVideoFrame` و `drawOverlayOnly` إلى `VideoPreviewRef`:
```typescript
interface VideoPreviewRef {
  // ... existing
  drawVideoFrame: (targetCanvas: HTMLCanvasElement) => void;
  drawOverlayOnly: (targetCanvas: HTMLCanvasElement, renderMode: string, forcedTimeMs: number) => void;
}
```

## ملخص التغييرات

| الملف | التغيير |
|-------|---------|
| `VideoPreview.tsx` | إضافة `drawVideoFrame()` — رسم الفيديو فقط |
| `VideoPreview.tsx` | إضافة `drawOverlayOnly()` — رسم النصوص فقط على canvas شفاف |
| `VideoPreview.tsx` | تعريض الدوال الجديدة في `useImperativeHandle` |
| `PreviewPage.tsx` | تعديل `drawLoop` لاستخدام النظام الثنائي: video كل إطار + overlay كل 150ms |

## النتيجة المتوقعة

- الفيديو يتحرك بسلاسة مثل الفيديوهات المرفقة (Facebook)
- النص يظهر واضح ويتغير عند الآية الصحيحة
- أداء أخف بـ 5-10x مقارنة بالوضع الحالي

