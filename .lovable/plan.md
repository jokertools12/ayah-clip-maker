

# خطة: إزالة الشيخ عاصم اللحيدان + تحسين الابتهالات + تحديثات مميزة

## 1. إزالة كل ما يخص الشيخ عاصم اللحيدان

### الملفات المتأثرة:
- **`src/data/reciters.ts`**: حذف كائن `asim_luhaidan` (أسطر 302-310)
- **`src/lib/audioSilenceDetector.ts`**: حذف الملف بالكامل (457 سطر) — لم يعد مستخدماً من أي قارئ آخر لأن جميعهم يملكون `everyAyahSubfolder`
- **`src/pages/PreviewPage.tsx`**: 
  - حذف import لـ `createSmartAyahClipFromFullSurah` و `AyahSegment` (سطر 34)
  - حذف Strategy 3 "Smart clip" بالكامل (أسطر 468-508) — الـ fallback العادي يكفي

## 2. إصلاح رفع الخلفيات في الابتهالات

**المشكلة**: في `BackgroundSelector.tsx` سطر 141، `CustomBackgroundUploader` يستقبل `onUpload` لكنه لا يُمرر `type` لأعلى — `onCustomBackgroundChange` يأخذ `url` فقط.

**الحل**:
- **`BackgroundSelector.tsx`**: تحديث interface ليقبل `onCustomBackgroundTypeChange?: (type: 'image' | 'video') => void` + تمريره في `onUpload`
- **`IbtahalatPage.tsx`**: تمرير `onCustomBackgroundTypeChange` لـ `BackgroundSelector` لتحديث `customBgType` عند الرفع
- **`CustomBackgroundUploader.tsx`**: التأكد من تمرير النوع الصحيح (يعمل حالياً)

## 3. إضافة خطوط وألوان احترافية للابتهالات

**الحل**: الخطوط والألوان موجودة بالفعل في `TextSettingsPanel.tsx` — المشكلة أن تبويب النص يظهر في المعاينة. سأتأكد من عمل الخطوط العربية عبر إضافة Google Fonts imports في `index.html`:
- خطوط جديدة: `Thuluth` (خط الثلث)، `Diwani` (ديواني)، `Kufi` (كوفي) — عبر `Katibeh`, `Rakkas`, `Lalezar` الموجودين + إضافة `Mirza` و `Marhey`
- ألوان جديدة: تدرج ذهبي ملكي، أخضر إسلامي، أزرق ملكي

## 4. تحديثات مميزة للمشروع

### أ. إضافة تأثير "Fade In" تدريجي للنص عند ظهور كل آية/سطر
- في `VideoPreview.tsx`: بدلاً من ظهور النص مباشرة، إضافة `globalAlpha` تدريجي أول 300ms من كل سطر

### ب. إضافة شريط تقدم أنيق أسفل الفيديو
- شريط رفيع ملون يتحرك مع تقدم الصوت — يظهر في المعاينة والتصدير

### ج. تحسين شاشة التحميل أثناء تجهيز الصوت
- إضافة رسوم متحركة (Skeleton + نص توضيحي) بدلاً من spinner بسيط

### د. إضافة زر "نسخ الرابط" للمشاركة السريعة بعد التصدير

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `src/data/reciters.ts` | حذف عاصم اللحيدان |
| `src/lib/audioSilenceDetector.ts` | حذف الملف |
| `src/pages/PreviewPage.tsx` | حذف SmartClip import + Strategy 3 + إضافة شريط تقدم + تحسين التحميل |
| `src/components/BackgroundSelector.tsx` | إضافة `onCustomBackgroundTypeChange` |
| `src/pages/IbtahalatPage.tsx` | تمرير `onCustomBackgroundTypeChange` |
| `src/components/TextSettingsPanel.tsx` | إضافة خطوط وألوان جديدة |
| `src/components/VideoPreview.tsx` | تأثير Fade In للنص + شريط تقدم |
| `index.html` | إضافة Google Fonts imports |

~120 سطر تغييرات إجمالي.

