import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AudioEffects } from '@/hooks/useAudioEffects';
import { Music, Waves, Timer, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AudioEffectsPanelProps {
  effects: AudioEffects;
  onChange: (effects: AudioEffects) => void;
  disabled?: boolean;
  onToggleCopyrightProtection?: (enabled: boolean) => void;
}

export function AudioEffectsPanel({ effects, onChange, disabled, onToggleCopyrightProtection }: AudioEffectsPanelProps) {
  const updateEffect = <K extends keyof AudioEffects>(key: K, value: AudioEffects[K]) => {
    onChange({ ...effects, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Music className="h-5 w-5" />
          المؤثرات الصوتية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Copyright Protection */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="copyrightProtection" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-400 font-medium text-sm">حماية حقوق النشر</span>
            </Label>
            <Switch
              id="copyrightProtection"
              checked={effects.copyrightProtectionEnabled}
              onCheckedChange={(checked) => {
                updateEffect('copyrightProtectionEnabled', checked);
                onToggleCopyrightProtection?.(checked);
              }}
              disabled={disabled}
            />
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
            <p>
              يُطبق تعديلات صوتية طفيفة غير ملحوظة لتجنب اكتشاف الصوت تلقائياً على فيسبوك ويوتيوب
            </p>
          </div>
          {effects.copyrightProtectionEnabled && (
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-0">
              <Shield className="h-3 w-3 ml-1" />
              الحماية مُفعّلة
            </Badge>
          )}
        </div>

        {/* Reverb (Mosque Effect) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reverb" className="flex items-center gap-2 cursor-pointer">
              <Waves className="h-4 w-4 text-primary" />
              <span>تأثير المسجد (صدى)</span>
            </Label>
            <Switch
              id="reverb"
              checked={effects.reverbEnabled}
              onCheckedChange={(checked) => updateEffect('reverbEnabled', checked)}
              disabled={disabled}
            />
          </div>
          
          {effects.reverbEnabled && (
            <div className="space-y-2 pr-6">
              <Label className="text-sm text-muted-foreground">شدة الصدى</Label>
              <Slider
                value={[effects.reverbLevel]}
                onValueChange={([value]) => updateEffect('reverbLevel', value)}
                min={0}
                max={1}
                step={0.1}
                disabled={disabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>خفيف</span>
                <span>قوي</span>
              </div>
            </div>
          )}
        </div>

        {/* Echo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="echo" className="flex items-center gap-2 cursor-pointer">
              <Timer className="h-4 w-4 text-primary" />
              <span>تأثير الترديد</span>
            </Label>
            <Switch
              id="echo"
              checked={effects.echoEnabled}
              onCheckedChange={(checked) => updateEffect('echoEnabled', checked)}
              disabled={disabled}
            />
          </div>
          
          {effects.echoEnabled && (
            <div className="space-y-4 pr-6">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">تأخير الترديد</Label>
                <Slider
                  value={[effects.echoDelay]}
                  onValueChange={([value]) => updateEffect('echoDelay', value)}
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>قصير</span>
                  <span>{(effects.echoDelay * 1000).toFixed(0)}ms</span>
                  <span>طويل</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">تكرار الترديد</Label>
                <Slider
                  value={[effects.echoFeedback]}
                  onValueChange={([value]) => updateEffect('echoFeedback', value)}
                  min={0.1}
                  max={0.7}
                  step={0.05}
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>قليل</span>
                  <span>كثير</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          💡 المؤثرات تضيف أجواء روحانية للتلاوة
        </p>
      </CardContent>
    </Card>
  );
}
