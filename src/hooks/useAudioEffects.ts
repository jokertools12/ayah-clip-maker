import { useRef, useCallback, useState, useEffect } from 'react';

export interface AudioEffects {
  reverbEnabled: boolean;
  reverbLevel: number; // 0-1
  echoEnabled: boolean;
  echoDelay: number; // 0-1 seconds
  echoFeedback: number; // 0-0.8
}

const defaultEffects: AudioEffects = {
  reverbEnabled: false,
  reverbLevel: 0.5,
  echoEnabled: false,
  echoDelay: 0.3,
  echoFeedback: 0.4,
};

export function useAudioEffects() {
  const [effects, setEffects] = useState<AudioEffects>(defaultEffects);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);

  // Create impulse response for reverb (simulates mosque acoustics)
  const createImpulseResponse = useCallback((duration: number, decay: number, reverse: boolean = false) => {
    if (!audioContextRef.current) return null;
    
    const sampleRate = audioContextRef.current.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContextRef.current.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = reverse ? length - i : i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }
    }
    
    return impulse;
  }, []);

  // Initialize audio context and nodes
  const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
    if (isInitialized && sourceNodeRef.current) {
      return;
    }

    try {
      // Create or resume audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // Only create source node once
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = ctx.createMediaElementSource(audioElement);
      }

      // Create nodes
      const convolver = ctx.createConvolver();
      const delay = ctx.createDelay(1.0);
      const feedback = ctx.createGain();
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const reverbGain = ctx.createGain();

      // Store refs
      convolverRef.current = convolver;
      delayRef.current = delay;
      feedbackRef.current = feedback;
      dryGainRef.current = dryGain;
      wetGainRef.current = wetGain;
      reverbGainRef.current = reverbGain;

      // Create mosque-like reverb impulse response
      const impulse = createImpulseResponse(3, 2);
      if (impulse) {
        convolver.buffer = impulse;
      }

      // Set initial values
      dryGain.gain.value = 1;
      wetGain.gain.value = 0;
      reverbGain.gain.value = 0;
      delay.delayTime.value = effects.echoDelay;
      feedback.gain.value = effects.echoFeedback;

      // Connect dry path
      sourceNodeRef.current.connect(dryGain);
      dryGain.connect(ctx.destination);

      // Connect reverb path
      sourceNodeRef.current.connect(convolver);
      convolver.connect(reverbGain);
      reverbGain.connect(ctx.destination);

      // Connect echo/delay path
      sourceNodeRef.current.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);
      wetGain.connect(ctx.destination);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio effects:', error);
    }
  }, [isInitialized, effects.echoDelay, effects.echoFeedback, createImpulseResponse]);

  // Update effects in real-time
  useEffect(() => {
    if (!isInitialized) return;

    // Update reverb
    if (reverbGainRef.current) {
      reverbGainRef.current.gain.value = effects.reverbEnabled ? effects.reverbLevel : 0;
    }

    // Update echo
    if (delayRef.current && feedbackRef.current && wetGainRef.current) {
      delayRef.current.delayTime.value = effects.echoDelay;
      feedbackRef.current.gain.value = effects.echoEnabled ? effects.echoFeedback : 0;
      wetGainRef.current.gain.value = effects.echoEnabled ? 0.5 : 0;
    }
  }, [effects, isInitialized]);

  // Resume audio context (needed for browsers that suspend it)
  const resumeContext = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      // Don't close the context, just disconnect nodes
      try {
        sourceNodeRef.current?.disconnect();
        convolverRef.current?.disconnect();
        delayRef.current?.disconnect();
        feedbackRef.current?.disconnect();
        dryGainRef.current?.disconnect();
        wetGainRef.current?.disconnect();
        reverbGainRef.current?.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    setIsInitialized(false);
  }, []);

  const updateEffect = useCallback(<K extends keyof AudioEffects>(
    key: K,
    value: AudioEffects[K]
  ) => {
    setEffects(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetEffects = useCallback(() => {
    setEffects(defaultEffects);
  }, []);

  return {
    effects,
    setEffects,
    updateEffect,
    resetEffects,
    initializeAudio,
    resumeContext,
    cleanup,
    isInitialized,
  };
}
