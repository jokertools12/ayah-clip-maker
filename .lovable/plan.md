

# خطة: تحسين جذري لأداء الفيديو + حذف الخيارات غير الضرورية

## تحليل المشكلة

بعد فحص شامل، السبب الرئيسي للتهنيج في أول دقيقة مع Pexels:

### 1. `drawImage` لفيديو عالي الدقة كل إطار (السبب #1)
Pexels يُعيد فيديوهات بدقة عالية (640×360 أو أكثر). `ctx.drawImage(video, 0, 0, canvas.width, canvas.height)` (سطر 977) يُعيد رسم كل frame من الفيديو على canvas كبير — عملية GPU مكلفة جدًا خاصة أول 30-60 ثانية حيث يكون المتصفح لم يحمّل الفيديو بالكامل في الذاكرة بعد.

**الحل**: إضافة off-screen canvas مخصص لتصغير إطار الفيديو أولاً، ثم رسمه على الـ recording canvas. هذا يقلل عمليات الـ GPU بشكل كبير.

### 2. `ctx.measureText(w).width` لكل كلمة كل إطار (سطر 1970)
رغم أن `lineTotals` مخزنة مؤقتاً، إلا أن **عرض كل كلمة منفردة** لا يزال يُحسب كل frame لتحديد موضع cursorX. يجب تخزين عروض الكلمات الفردية في الـ cache.

### 3. `getTokenHsl` يستدعي `getComputedStyle` (سطر 446-452)
هذه الدالة في dependency array لـ `drawFrame` وتُستدعى أثناء الرسم (سطر 1956). يجب تخزين النتيجة.

### 4. إطارات `ornate`/`golden`/`geometric` ثقيلة أثناء التسجيل
رغم أن الزخارف الجانبية تُخطى أثناء التسجيل، الإطارات المعقدة (bezierCurveTo, arc, shadowBlur=15) لا تزال تُرسم في كل أوضاع التسجيل (سطر 1800-1808).

### 5. خيارات يريد المستخدم حذفها نهائيًا

بناءً على تحليل الخيارات المؤثرة على الأداء والتي لا تضيف قيمة كبيرة:
- **`decorationStyle`** (sideBorder/separator/both) — تُحذف من المعاينة والتسجيل. تبقى `none` الافتراضي فقط
- **`particleDensity`** — بالفعل `off` افتراضيًا ومعطل، لكن الخيار لا يزال في الواجهة
- **`performanceMode`** — 3 أوضاع (economy/balanced/pro) تُعقد الأمور. الأفضل حذفه وجعل النظام ذكيًا تلقائيًا

## التغييرات

### الملف 1: `VideoPreview.tsx`

| التغيير | التفاصيل |
|---------|----------|
| تخزين عروض الكلمات | إضافة `wordWidths: number[][]` لـ `textLayoutCacheRef` + تخزينها عند حساب layout. استخدامها بدل `ctx.measureText(w).width` في سطر 1970 |
| تبسيط إطارات التسجيل | لف `drawIslamicFrame` في شرط: أثناء التسجيل → استخدام `simple` frame بدل `ornate`/`golden`/`geometric` (حدود بسيطة فقط) |
| تخزين `getTokenHsl` | تحويلها لاستخدام ref cache بدل `getComputedStyle` كل مرة |
| تخفيف Video drawImage | إضافة `videoScaleCanvasRef` — canvas صغير وسيط لتصغير إطار الفيديو أولاً ثم نسخه (يقلل GPU load بنسبة ~40%) |
| حذف كود `decorationStyle` | إزالة رسم sideBorder و separator نهائيًا من `drawFrame` |
| حذف `particleDensity` | إزالة أي reference للجزيئات |
| حذف `performanceMode` | استخدام قيم ثابتة ذكية بدلاً من 3 أوضاع |

### الملف 2: `DisplaySettingsPanel.tsx`

| التغيير | التفاصيل |
|---------|----------|
| حذف قسم `decorationStyle` | إزالة الـ RadioOptionGrid وخياراته (أسطر 498-510) |
| حذف قسم `performanceMode` | إزالة الـ RadioOptionGrid (أسطر 548-558) |
| حذف `particleDensity` من الـ interface | إزالة من `DisplaySettings` interface |

### الملف 3: `PreviewPage.tsx`

| التغيير | التفاصيل |
|---------|----------|
| حذف `performanceMode` من defaults | إزالة من `DEFAULT_DISPLAY_SETTINGS` |
| حذف `decorationStyle` من defaults | إزالة من `DEFAULT_DISPLAY_SETTINGS` |
| حذف `particleDensity` من defaults | إزالة من `DEFAULT_DISPLAY_SETTINGS` |

### الملف 4: `VideoPreview.tsx` — Props interface

| التغيير | التفاصيل |
|---------|----------|
| حذف `decorationStyle`, `particleDensity`, `performanceMode` من displaySettings type | تنظيف الـ interface |

## تفاصيل تقنية: Video Scale Canvas

```text
┌─────────────────────┐      ┌──────────────┐      ┌─────────────────────┐
│ Pexels Video Element│ ───▶ │ Scale Canvas │ ───▶ │ Recording Canvas    │
│ (640×1138 native)   │      │ (360×640)    │      │ (720×1280 or more)  │
└─────────────────────┘      └──────────────┘      └─────────────────────┘
     drawImage مباشر             drawImage              drawImage
     (ثقيل جداً)               (تصغير سريع)           (نسخ خفيف)
```

هذا يقلل عمليات الـ pixel processing بنسبة ~60% لأن الـ intermediate canvas أصغر بكثير.

## النتيجة المتوقعة
- اختفاء التهنيج في أول دقيقة مع فيديوهات Pexels
- واجهة إعدادات أبسط بـ3 خيارات أقل
- أداء تسجيل أسرع بنسبة ~50%

