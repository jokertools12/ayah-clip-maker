import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, Zap, Snail } from 'lucide-react';

interface MotionSpeedControlProps {
  speed: number;
  onChange: (speed: number) => void;
}

export function MotionSpeedControl({ speed, onChange }: MotionSpeedControlProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          سرعة الخلفية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Snail className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold text-primary">x{speed}</span>
          <Zap className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <Slider
          value={[speed]}
          onValueChange={([value]) => onChange(value)}
          min={1}
          max={10}
          step={0.5}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>بطيء جداً</span>
          <span>متوسط</span>
          <span>سريع جداً</span>
        </div>

        <div className="grid grid-cols-5 gap-1 pt-2">
          {[1, 2, 3, 5, 10].map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`py-2 px-1 text-xs rounded-lg border transition-all ${
                speed === preset
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-muted hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              x{preset}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          💡 اختر السرعة المناسبة للحصول على حركة سلسة واحترافية
        </p>
      </CardContent>
    </Card>
  );
}
