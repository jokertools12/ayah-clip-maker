

# خطة: إصلاح رفع الخلفية في خطوة 4 + تحسين جودة التسجيل + خيار دقة الخلفية

## المشاكل

### 1. رفع الخلفية في خطوة 4 (CreatePage) لا يعمل
`CreatePage.tsx` لا يحتوي على state لـ `customBackground` أصلاً. و`BackgroundSelector.tsx` سطر 141 يستدعي `onUpload` بدون تمرير `type`، فلا يتم تمييز الفيديو من الصورة. كما أن `CreatePage` لا يمرر `customBackground` أو `onCustomBackgroundChange` لـ `BackgroundSelector`.

### 2. جودة التسجيل ضعيفة في وضع التوافق، وثقيلة في باقي الأوضاع
- **وضع التوافق** (`compatibility`): يستخدم `liteScale = 0.67` (يقلص الكانفاس 33%) + يُنزل الجودة لـ `medium` (720p) → النتيجة ضبابية
- **وضع سلس/جودة**: يرسم بالدقة الكاملة → ثقيل على الجهاز مع خلفيات فيديو

**الحل**: إزالة `liteScale` تماماً والحفاظ على دقة الكانفاس كاملة في كل الأوضاع. بدلاً من تصغير الكانفاس، نخفض فقط bitrate و FPS للأوضاع الأخف. هذا يحافظ على وضوح الصورة مع تقليل الحمل.

### 3. إضافة خيار دقة الخلفية أثناء التسجيل
إضافة slider أو خيار في تبويب "جودة" يتحكم في حجم الـ off-screen canvas الوسيط (من 240px إلى 720px). هذا يقلل حمل رسم الخلفية دون تأثير على دقة النص.

## التغييرات

### الملف 1: `CreatePage.tsx`
- إضافة `customBackground` و `customBackgroundType` state
- تمريرهما لـ `BackgroundSelector` عبر props `customBackground` و `onCustomBackgroundChange`
- عند الانتقال للمعاينة، تمرير `customBackground` و `customBackgroundType` في URL params

### الملف 2: `BackgroundSelector.tsx`
- تحديث سطر 141: تمرير `type` من `CustomBackgroundUploader` → `onCustomBackgroundChange`
- إضافة prop `customBackgroundType` + `onCustomBackgroundTypeChange`
- تحديث `CustomBackgroundUploader` لتمرير `currentBackgroundType`

### الملف 3: `PreviewPage.tsx`
- إزالة `liteScale` من حساب أبعاد كانفاس التسجيل (سطر 1037-1039)
- جعل كل الأوضاع تستخدم الدقة الكاملة المختارة
- وضع التوافق يبقى أخف عبر FPS و bitrate فقط
- قراءة `customBackground` و `customBackgroundType` من URL params إن وُجدا
- إضافة state `backgroundScaleMax` (قيمة 240-720، افتراضي 480) وتمريرها لـ `VideoPreview`

### الملف 4: `VideoPreview.tsx`
- استقبال prop `backgroundScaleMax` واستخدامها بدل القيمة الثابتة 480 في off-screen canvas

### الملف 5: `ExportFormatSelector.tsx`
- إضافة Slider لـ "دقة الخلفية أثناء التسجيل" في تبويب الجودة (240px-720px)

## تفاصيل تقنية

```text
قبل الإصلاح:
  compatibility → canvas = quality × 0.67 → ضبابي
  smooth/quality → canvas = quality × 1.0 → ثقيل بسبب خلفية كبيرة

بعد الإصلاح:
  كل الأوضاع → canvas = quality × 1.0 (نص واضح دائماً)
  التحكم في الثقل عبر:
    1. backgroundScaleMax (حجم off-screen canvas للخلفية)
    2. FPS + bitrate (أقل في compatibility)
```

