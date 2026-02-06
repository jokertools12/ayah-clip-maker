// src/data/videoPresets.ts
// 12 ready-to-use presets for one-click styling similar to professional reference videos

import type { DisplaySettings } from '@/components/DisplaySettingsPanel';
import type { TextSettings } from '@/components/TextSettingsPanel';
import type { ExportQuality } from '@/hooks/useVideoRecorder';

export interface VideoPreset {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  textSettings: Partial<TextSettings>;
  displaySettings: Partial<DisplaySettings>;
  recommendedBackground: string;
  recommendedAspectRatio: '9:16' | '16:9';
  exportQuality: ExportQuality;
  /**
   * Optional CSS gradient or color for previewing the preset in UI.
   */
  previewGradient?: string;
}

export const VIDEO_PRESETS: VideoPreset[] = [
  // 1 - Classic Dark
  {
    id: 'classic-dark',
    name: 'كلاسيكي داكن',
    description: 'تصميم بسيط وأنيق على خلفية سوداء مع توهج ذهبي.',
    previewGradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    textSettings: {
      fontSize: 32,
      fontFamily: '"Amiri", serif',
      textColor: '#ffffff',
      shadowIntensity: 0.6,
      overlayOpacity: 0.5,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'none',
      ayahNumberStyle: 'circle',
      surahNamePosition: 'top',
      textShadowStyle: 'soft',
    },
    recommendedBackground: 'nature-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 2 - Golden Ornate
  {
    id: 'golden-ornate',
    name: 'ذهبي مزخرف',
    description: 'إطار ذهبي فاخر مع زخارف إسلامية وألوان دافئة.',
    previewGradient: 'linear-gradient(135deg, #8B6914 0%, #D4AF37 50%, #8B6914 100%)',
    textSettings: {
      fontSize: 30,
      fontFamily: '"Scheherazade New", serif',
      textColor: '#F5E6C8',
      shadowIntensity: 0.4,
      overlayOpacity: 0.55,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'golden',
      ayahNumberStyle: 'star',
    },
    recommendedBackground: 'mosque-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 3 - Minimal White
  {
    id: 'minimal-white',
    name: 'أبيض بسيط',
    description: 'خلفية فاتحة مع نص داكن وتصميم نظيف.',
    previewGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    textSettings: {
      fontSize: 28,
      fontFamily: '"Cairo", sans-serif',
      textColor: '#1a1a1a',
      shadowIntensity: 0.1,
      overlayOpacity: 0.2,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: false,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'solid',
      frameStyle: 'simple',
      ayahNumberStyle: 'circle',
    },
    recommendedBackground: 'clouds-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 4 - Nature Calm
  {
    id: 'nature-calm',
    name: 'طبيعة هادئة',
    description: 'صور طبيعية مع تدرجات خضراء وزرقاء مريحة.',
    previewGradient: 'linear-gradient(135deg, #2E7D32 0%, #1565C0 100%)',
    textSettings: {
      fontSize: 30,
      fontFamily: '"Noto Naskh Arabic", serif',
      textColor: '#ffffff',
      shadowIntensity: 0.5,
      overlayOpacity: 0.45,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'underline',
      frameStyle: 'none',
      ayahNumberStyle: 'flower',
    },
    recommendedBackground: 'forest-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 5 - Geometric Modern
  {
    id: 'geometric-modern',
    name: 'هندسي حديث',
    description: 'تصميم عصري مع إطار هندسي وخطوط حادة.',
    previewGradient: 'linear-gradient(135deg, #37474F 0%, #546E7A 100%)',
    textSettings: {
      fontSize: 26,
      fontFamily: '"Cairo", sans-serif',
      textColor: '#E0E0E0',
      shadowIntensity: 0.3,
      overlayOpacity: 0.5,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'solid',
      frameStyle: 'geometric',
      ayahNumberStyle: 'octagon',
    },
    recommendedBackground: 'abstract-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 6 - Desert Warm
  {
    id: 'desert-warm',
    name: 'صحراء دافئة',
    description: 'ألوان برتقالية ودافئة تذكر بالغروب والصحراء.',
    previewGradient: 'linear-gradient(135deg, #E65100 0%, #FF8F00 50%, #FFC107 100%)',
    textSettings: {
      fontSize: 30,
      fontFamily: '"Amiri", serif',
      textColor: '#FFF8E1',
      shadowIntensity: 0.45,
      overlayOpacity: 0.4,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'simple',
      ayahNumberStyle: 'diamond',
    },
    recommendedBackground: 'desert-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 7 - Ocean Blue
  {
    id: 'ocean-blue',
    name: 'محيط أزرق',
    description: 'درجات زرقاء هادئة مع لمسات بيضاء.',
    previewGradient: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #42A5F5 100%)',
    textSettings: {
      fontSize: 28,
      fontFamily: '"Noto Naskh Arabic", serif',
      textColor: '#BBDEFB',
      shadowIntensity: 0.5,
      overlayOpacity: 0.5,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'none',
      ayahNumberStyle: 'circle',
    },
    recommendedBackground: 'ocean-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 8 - Night Sky
  {
    id: 'night-sky',
    name: 'سماء الليل',
    description: 'خلفية نجوم ودرجات بنفسجية داكنة.',
    previewGradient: 'linear-gradient(135deg, #1A237E 0%, #311B92 50%, #4A148C 100%)',
    textSettings: {
      fontSize: 30,
      fontFamily: '"Scheherazade New", serif',
      textColor: '#E1BEE7',
      shadowIntensity: 0.6,
      overlayOpacity: 0.55,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'ornate',
      ayahNumberStyle: 'star',
    },
    recommendedBackground: 'stars-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 9 - Mosque Traditional
  {
    id: 'mosque-traditional',
    name: 'مسجد تقليدي',
    description: 'صور مساجد مع إطار إسلامي تقليدي.',
    previewGradient: 'linear-gradient(135deg, #3E2723 0%, #5D4037 50%, #795548 100%)',
    textSettings: {
      fontSize: 28,
      fontFamily: '"Amiri", serif',
      textColor: '#FFF8E1',
      shadowIntensity: 0.5,
      overlayOpacity: 0.5,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'ornate',
      ayahNumberStyle: 'flower',
    },
    recommendedBackground: 'mosque-2',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 10 - Ramadan Special
  {
    id: 'ramadan-special',
    name: 'رمضان المبارك',
    description: 'تصميم خاص برمضان بألوان ذهبية وبنفسجية.',
    previewGradient: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 40%, #D4AF37 100%)',
    textSettings: {
      fontSize: 32,
      fontFamily: '"Scheherazade New", serif',
      textColor: '#FFD700',
      shadowIntensity: 0.6,
      overlayOpacity: 0.5,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'golden',
      ayahNumberStyle: 'star',
    },
    recommendedBackground: 'ramadan-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 11 - Sunrise Hope
  {
    id: 'sunrise-hope',
    name: 'شروق الأمل',
    description: 'ألوان وردية ودافئة مثل شروق الشمس.',
    previewGradient: 'linear-gradient(135deg, #FF6F00 0%, #FF8A65 50%, #FFAB91 100%)',
    textSettings: {
      fontSize: 28,
      fontFamily: '"Noto Naskh Arabic", serif',
      textColor: '#ffffff',
      shadowIntensity: 0.45,
      overlayOpacity: 0.4,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'underline',
      frameStyle: 'simple',
      ayahNumberStyle: 'circle',
    },
    recommendedBackground: 'sunrise-1',
    recommendedAspectRatio: '9:16',
    exportQuality: 'high',
  },
  // 12 - Cinematic Wide (16:9)
  {
    id: 'cinematic-wide',
    name: 'سينمائي عريض',
    description: 'تصميم بنسبة 16:9 مثالي للمشاركة على يوتيوب.',
    previewGradient: 'linear-gradient(135deg, #212121 0%, #424242 100%)',
    textSettings: {
      fontSize: 36,
      fontFamily: '"Amiri", serif',
      textColor: '#ffffff',
      shadowIntensity: 0.5,
      overlayOpacity: 0.6,
    },
    displaySettings: {
      showSurahName: true,
      showReciterName: true,
      showAyahText: true,
      showAyahNumber: true,
      highlightStyle: 'glow',
      frameStyle: 'none',
      ayahNumberStyle: 'circle',
    },
    recommendedBackground: 'landscape-1',
    recommendedAspectRatio: '16:9',
    exportQuality: 'ultra',
  },
];

export const getPresetById = (id: string): VideoPreset | undefined => {
  return VIDEO_PRESETS.find((p) => p.id === id);
};
