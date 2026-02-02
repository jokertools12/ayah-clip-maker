import { useState, useCallback } from 'react';

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
  audioSecondary?: string[];
  page: number;
  hizbQuarter: number;
  juz: number;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

interface QuranApiResponse {
  code: number;
  status: string;
  data: SurahData;
}

export function useQuranApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurah = useCallback(async (surahNumber: number): Promise<SurahData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      );

      if (!response.ok) {
        throw new Error('فشل في جلب بيانات السورة');
      }

      const data: QuranApiResponse = await response.json();

      if (data.code !== 200) {
        throw new Error('خطأ في الاستجابة من API');
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAyahs = useCallback(async (
    surahNumber: number,
    startAyah: number,
    endAyah: number
  ): Promise<Ayah[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      );

      if (!response.ok) {
        throw new Error('فشل في جلب الآيات');
      }

      const data: QuranApiResponse = await response.json();

      if (data.code !== 200) {
        throw new Error('خطأ في الاستجابة');
      }

      const ayahs = data.data.ayahs.filter(
        (ayah) => ayah.numberInSurah >= startAyah && ayah.numberInSurah <= endAyah
      );

      return ayahs;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchSurah,
    fetchAyahs,
  };
}
