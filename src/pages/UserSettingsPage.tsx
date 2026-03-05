import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Crown, Video, Calendar, Mail, Edit2, Loader2, Check, History, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Link, Navigate } from 'react-router-dom';

export default function UserSettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { subscription, isPremium, dailyUsage, videoLimit } = useSubscription();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) setDisplayName((data as any).display_name || '');
          setProfileLoaded(true);
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
    if (error) toast.error('حدث خطأ'); else toast.success('تم حفظ الإعدادات');
    setSaving(false);
  };

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const usagePercent = videoLimit > 0 ? (dailyUsage.count / videoLimit) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            الإعدادات
          </h1>

          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className={isPremium ? 'border-primary/50 shadow-lg shadow-primary/10' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className={`h-5 w-5 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
                  العضوية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>الخطة الحالية</span>
                  <Badge variant={isPremium ? 'default' : 'secondary'} className={isPremium ? 'gradient-primary text-primary-foreground' : ''}>
                    {isPremium ? 'مميز ✨' : 'مجاني'}
                  </Badge>
                </div>
                {subscription?.expires_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" />تنتهي في</span>
                    <span>{new Date(subscription.expires_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
                {!isPremium && (
                  <Button asChild className="w-full gradient-primary text-primary-foreground">
                    <Link to="/pricing"><Crown className="h-4 w-4 ml-2" />ترقية للعضوية المميزة</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  استخدام اليوم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>الفيديوهات المنشأة</span>
                  <span className="font-bold">{dailyUsage.count} / {videoLimit}</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {isPremium ? 'لديك 100 فيديو يومياً' : 'الخطة المجانية: 3 فيديوهات يومياً'}
                </p>
              </CardContent>
            </Card>

            {/* Payment History Link */}
            <Card>
              <CardContent className="p-4">
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/payment-history">
                    <History className="h-4 w-4" />
                    سجل المدفوعات
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5" />
                  الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Mail className="h-4 w-4" />البريد الإلكتروني</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="أدخل اسمك" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                  حفظ
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
