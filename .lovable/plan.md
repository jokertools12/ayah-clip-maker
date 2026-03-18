

# خطة: إصلاح الخلفية المرفوعة + جودة 4K + حذف تأثير التكبير

## المشاكل المكتشفة

### 1. الخلفية المرفوعة لا تعمل بشكل صحيح
**السبب**: في `VideoPreview.tsx` سطر 264، `bgType` يُحدد دائماً من `background?.type || 'image'` — يعني حتى لو رفع المستخدم فيديو عبر `CustomBackgroundUploader`، النظام يعامله كصورة لأنه لا يفحص نوع `customBackground` (الـ blob URL لا يحتوي على `.mp4`).

**الحل**: 
- إضافة prop `customBackgroundType` من `CustomBackgroundUploader` إلى `PreviewPage` ثم `VideoPreview`
- عند رفع ملف، تخزين نوعه (`image` أو `video`) بجانب الـ URL
- في `VideoPreview.tsx` سطر 264: إذا كان `customBackground` موجود → استخدام `customBackgroundType` بدل `background?.type`

### 2. جودة الفيديو منخفضة — لا يوجد خيار 4K
**السبب**: في `useVideoRecorder.ts` سطر 26-31، أعلى جودة (`ultra`) هي 1080×1920 فقط.

**الحل**: تغيير `ultra` إلى 4K:
```
ultra: { label: '4K Ultra HD', resolution: '2160×3840', bitrate: 12_000_000, canvasWidth: 2160, canvasHeight: 3840 }
```

### 3. حذف `wordScaleEffect` نهائياً
- حذف من `DisplaySettings` interface في `DisplaySettingsPanel.tsx` (سطر 35)
- حذف الـ Switch UI (أسطر 403-413)
- حذف من `DEFAULT_DISPLAY_SETTINGS` في `PreviewPage.tsx` (سطر 98)
- حذف الشرط والكود في `VideoPreview.tsx` (أسطر 2011-2016)
- حذف من `displaySettings` interface في `VideoPreview.tsx` (سطر 65)

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `CustomBackgroundUploader.tsx` | تمرير نوع الملف مع الـ URL عبر `onUpload` |
| `PreviewPage.tsx` | تخزين `customBackgroundType` + تمريره لـ `VideoPreview` + حذف `wordScaleEffect` من defaults |
| `VideoPreview.tsx` | استقبال `customBackgroundType` + استخدامه في تحديد `bgType` + حذف كود `wordScaleEffect` |
| `DisplaySettingsPanel.tsx` | حذف `wordScaleEffect` من الـ interface والـ UI |
| `useVideoRecorder.ts` | ترقية `ultra` إلى 4K (2160×3840) |

