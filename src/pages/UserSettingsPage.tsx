import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { User, Crown, Video, Calendar, Mail, Edit2, Loader2, Check, History, Camera, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Link, Navigate } from 'react-router-dom';

export default function UserSettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { subscription, isPremium, dailyUsage, videoLimit } = useSubscription();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('display_name, avatar_url, bio').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setDisplayName((data as any).display_name || '');
            setAvatarUrl((data as any).avatar_url || null);
            setBio((data as any).bio || '');
          }
          setProfileLoaded(true);
        });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('الحد الأقصى لحجم الصورة 2 ميجابايت');
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('فشل رفع الصورة');
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    
    await supabase.from('profiles').update({ avatar_url: newUrl }).eq('user_id', user.id);
    setAvatarUrl(newUrl);
    setUploadingAvatar(false);
    toast.success('تم تحديث الصورة');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles')
      .update({ display_name: displayName, bio } as any)
      .eq('user_id', user.id);
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
            {/* Profile Card with Avatar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5" />
                  الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                    >
                      {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">اضغط على الكاميرا لتغيير الصورة (حد 2MB)</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Mail className="h-4 w-4" />البريد الإلكتروني</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="أدخل اسمك" />
                </div>
                <div className="space-y-2">
                  <Label>نبذة عنك</Label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="اكتب نبذة قصيرة عن نفسك..."
                    className="resize-none h-20"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-left">{bio.length}/200</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                  حفظ
                </Button>
              </CardContent>
            </Card>

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
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
