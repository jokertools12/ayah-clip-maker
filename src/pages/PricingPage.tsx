import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Check, Crown, Sparkles, Smartphone, Loader2, Star, Video, Type, Image as ImageIcon, Music, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^01[0-9]{9}$/, 'رقم هاتف مصري غير صحيح');

const PLANS = [
  {
    id: 'monthly',
    name: 'شهري',
    price: 10,
    currency: '$',
    period: '/شهر',
    egpPrice: '500 ج.م',
  },
  {
    id: 'yearly',
    name: 'سنوي',
    price: 96,
    currency: '$',
    period: '/سنة',
    egpPrice: '4800 ج.م',
    badge: 'وفر 20%',
  },
];

const WALLET_METHODS = [
  { id: 'vodafone_cash', name: 'فودافون كاش', color: 'bg-red-500' },
  { id: 'etisalat_cash', name: 'اتصالات كاش', color: 'bg-green-600' },
  { id: 'orange_cash', name: 'أورانج كاش', color: 'bg-orange-500' },
  { id: 'we_pay', name: 'وي باي', color: 'bg-purple-600' },
];

const PREMIUM_FEATURES_LIST = [
  { icon: Video, text: '100 فيديو يومياً' },
  { icon: ImageIcon, text: 'فيديوهات Pexels الاحترافية' },
  { icon: Sparkles, text: 'خلفيات متحركة ومتغيرة' },
  { icon: Type, text: 'جميع الخطوط العربية (11 خط)' },
  { icon: Shield, text: 'حماية حقوق الصوت' },
  { icon: Music, text: 'تأثيرات صوتية متقدمة' },
  { icon: Star, text: 'قوالب جاهزة احترافية' },
  { icon: Crown, text: 'علامة مائية مخصصة' },
  { icon: Video, text: 'تصدير 1080p Full HD و Ultra' },
  { icon: Sparkles, text: 'تصدير دفعات متعددة' },
  { icon: Star, text: 'دعم أولوية سريع' },
  { icon: Crown, text: 'براندنج وشعار مخصص' },
];

const FREE_FEATURES = [
  '3 فيديوهات يومياً',
  'صور خلفية أساسية',
  '3 خطوط عربية',
  'تصدير بجودة عادية',
];

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const { isPremium, subscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedWallet, setSelectedWallet] = useState('vodafone_cash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubmitPayment = async () => {
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const phoneResult = phoneSchema.safeParse(phoneNumber);
    if (!phoneResult.success) {
      toast.error(phoneResult.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const plan = PLANS.find(p => p.id === selectedPlan)!;

    const { error } = await supabase.from('payment_requests').insert({
      user_id: user.id,
      plan: selectedPlan,
      amount: selectedPlan === 'yearly' ? 4800 : 500,
      payment_method: selectedWallet,
      phone_number: phoneNumber,
    });

    if (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } else {
      toast.success('تم إرسال طلب الاشتراك بنجاح! سيتم مراجعته قريباً');
      setShowPayment(false);
      setPhoneNumber('');
    }
    setSubmitting(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge className="mb-4 px-4 py-1.5 text-sm" variant="secondary">
            <Crown className="h-4 w-4 ml-1" />
            خطط الاشتراك
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            اختر <span className="gradient-text">خطتك المناسبة</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ابدأ مجاناً واترقِ للعضوية المميزة للحصول على كل الميزات
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Free Plan */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full relative">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">مجاني</CardTitle>
                <CardDescription>للتجربة والاستخدام البسيط</CardDescription>
                <div className="text-4xl font-bold mt-4">$0</div>
              </CardHeader>
              <CardContent className="space-y-4">
                {FREE_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </div>
                ))}
                {!isAuthenticated ? (
                  <Button asChild className="w-full mt-4" variant="outline">
                    <Link to="/auth">سجل مجاناً</Link>
                  </Button>
                ) : !isPremium ? (
                  <Button disabled className="w-full mt-4" variant="outline">الخطة الحالية</Button>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full relative border-primary/50 shadow-lg shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gradient-primary text-primary-foreground px-4">
                  <Star className="h-3 w-3 ml-1" />
                  الأكثر شعبية
                </Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  العضوية المميزة
                </CardTitle>
                <CardDescription>لصناع المحتوى الاحترافي</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">$10<span className="text-lg font-normal text-muted-foreground">/شهر</span></div>
                  <p className="text-sm text-muted-foreground mt-1">أو $96/سنة (وفر 20%)</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {PREMIUM_FEATURES_LIST.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <f.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{f.text}</span>
                  </div>
                ))}
                {isPremium ? (
                  <Button disabled className="w-full mt-4">مشترك بالفعل ✓</Button>
                ) : (
                  <Button className="w-full mt-4 gradient-primary text-primary-foreground" onClick={() => {
                    if (!isAuthenticated) { toast.error('يجب تسجيل الدخول أولاً'); return; }
                    setShowPayment(true);
                  }}>
                    اشترك الآن
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payment Form */}
        {showPayment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  الدفع عبر المحافظ الإلكترونية
                </CardTitle>
                <CardDescription>
                  قم بتحويل المبلغ على الرقم <span className="font-bold text-primary direction-ltr inline-block">01098959911</span> ثم أدخل بياناتك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Selection */}
                <div className="space-y-2">
                  <Label>اختر الخطة</Label>
                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid grid-cols-2 gap-3">
                    {PLANS.map(plan => (
                      <div key={plan.id} className="relative">
                        <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} className="peer sr-only" />
                        <Label htmlFor={`plan-${plan.id}`} className="flex flex-col items-center p-4 rounded-xl border-2 border-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all">
                          {plan.badge && <Badge className="mb-2 text-xs" variant="secondary">{plan.badge}</Badge>}
                          <span className="font-bold text-lg">{plan.name}</span>
                          <span className="text-primary font-bold">{plan.egpPrice}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Wallet Selection */}
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <RadioGroup value={selectedWallet} onValueChange={setSelectedWallet} className="grid grid-cols-2 gap-3">
                    {WALLET_METHODS.map(w => (
                      <div key={w.id} className="relative">
                        <RadioGroupItem value={w.id} id={`wallet-${w.id}`} className="peer sr-only" />
                        <Label htmlFor={`wallet-${w.id}`} className="flex items-center gap-2 p-3 rounded-xl border-2 border-muted cursor-pointer peer-data-[state=checked]:border-primary transition-all">
                          <div className={`h-3 w-3 rounded-full ${w.color}`} />
                          <span className="text-sm font-medium">{w.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label>رقم الهاتف الذي حولت منه</Label>
                  <Input
                    placeholder="01XXXXXXXXX"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    maxLength={11}
                    className="text-left direction-ltr"
                  />
                </div>

                {/* Info Box */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm space-y-2">
                  <p className="font-medium text-primary">خطوات الدفع:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>حوّل المبلغ على الرقم <span className="font-bold">01098959911</span></li>
                    <li>أدخل رقم الهاتف الذي حولت منه</li>
                    <li>اضغط إرسال الطلب</li>
                    <li>سيتم تفعيل حسابك خلال 24 ساعة</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmitPayment} disabled={submitting} className="flex-1 gradient-primary text-primary-foreground">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                    إرسال الطلب
                  </Button>
                  <Button variant="outline" onClick={() => setShowPayment(false)}>إلغاء</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
