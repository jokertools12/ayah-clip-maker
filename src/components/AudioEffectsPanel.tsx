import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AudioEffects } from '@/hooks/useAudioEffects';
import { PremiumBadge } from '@/components/PremiumBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { Music, Waves, Timer, Shield, AlertTriangle, Volume2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AudioEffectsPanelProps {
  effects: AudioEffects;
  onChange: (effects: AudioEffects) => void;
  disabled?: boolean;
  onToggleCopyrightProtection?: (enabled: boolean) => void;
}

export function AudioEffectsPanel({ effects, onChange, disabled, onToggleCopyrightProtection }: AudioEffectsPanelProps) {
  const { isPremium, canUseFeature } = useSubscription();
  
  const updateEffect = <K extends keyof AudioEffects>(key: K, value: AudioEffects[K]) => {
    onChange({ ...effects, [key]: value });
  };

  const handlePremiumToggle = (key: keyof AudioEffects, checked: boolean) => {
    if (!isPremium) {
      toast.error('هذه الميزة متاحة للأعضاء المميزين فقط');
      return;
    }
    updateEffect(key, checked as never);
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
        {/* Copyright Protection - Premium */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="copyrightProtection" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium text-sm">حماية حقوق النشر</span>
              {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Switch
              id="copyrightProtection"
              checked={effects.copyrightProtectionEnabled}
              onCheckedChange={(checked) => {
                if (!isPremium) {
                  toast.error('حماية حقوق النشر متاحة للأعضاء المميزين فقط');
                  return;
                }
                updateEffect('copyrightProtectionEnabled', checked);
                onToggleCopyrightProtection?.(checked);
              }}
              disabled={disabled}
            />
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
            <p>
              يُطبق تعديلات صوتية طفيفة غير ملحوظة لتجنب اكتشاف الصوت تلقائياً على فيسبوك ويوتيوب
            </p>
          </div>
          {!isPremium && <PremiumBadge showLock />}
          {effects.copyrightProtectionEnabled && isPremium && (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
              <Shield className="h-3 w-3 ml-1" />
              الحماية مُفعّلة
            </Badge>
          )}
        </div>

        {/* Audio Normalization - Premium */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="normalize" className="flex items-center gap-2 cursor-pointer">
              <Volume2 className="h-4 w-4 text-primary" />
              <span>تسوية الصوت</span>
              {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Switch
              id="normalize"
              checked={effects.normalizeEnabled ?? false}
              onCheckedChange={(checked) => handlePremiumToggle('normalizeEnabled' as keyof AudioEffects, checked)}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground pr-6">
            تسوية مستوى الصوت تلقائياً لضمان وضوح ثابت
          </p>
        </div>

        {/* EQ Enhancement - Premium */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="eq" className="flex items-center gap-2 cursor-pointer">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 21v-8M8 21V9M12 21v-6M16 21v-10M20 21V5" />
              </svg>
              <span>تحسين EQ</span>
              {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Switch
              id="eq"
              checked={effects.eqEnabled ?? false}
              onCheckedChange={(checked) => handlePremiumToggle('eqEnabled' as keyof AudioEffects, checked)}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground pr-6">
            تحسين الوضوح وتقليل الضجيج للحصول على صوت أكثر نقاءً
          </p>
        </div>

        {/* Reverb - Free */}
        <div className="space-y-4 pt-2 border-t">
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

        {/* Echo - Free */}
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

        {!isPremium && (
          <p className="text-xs text-muted-foreground text-center pt-2 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            بعض المؤثرات متاحة للأعضاء المميزين فقط
          </p>
        )}
      </CardContent>
    </Card>
  );
}
