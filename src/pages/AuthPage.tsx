import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('الرجاء إدخال بريد إلكتروني صحيح');
const passwordSchema = z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const validateForm = (isSignUp: boolean): boolean => {
    setError(null);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return false;
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (error.message.includes('Email not confirmed')) {
        setError('الرجاء تأكيد بريدك الإلكتروني أولاً');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول');
      }
    } else {
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password);

    if (error) {
      if (error.message.includes('User already registered')) {
        setError('هذا البريد الإلكتروني مسجل بالفعل');
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب');
      }
    } else {
      toast.success('تم إنشاء الحساب! الرجاء تفقد بريدك الإلكتروني للتأكيد');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-4">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">مرحباً بك في قرآن ريلز</h1>
            <p className="text-muted-foreground mt-2">
              سجل دخولك لحفظ مقاطعك ومشاركتها
            </p>
          </div>

          <Card>
            <Tabs defaultValue="login">
              <CardHeader className="pb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="login" className="flex-1">
                    تسجيل الدخول
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex-1">
                    حساب جديد
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mb-4"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      تسجيل الدخول
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="6 أحرف على الأقل"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      إنشاء حساب
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            بإنشائك حساباً، ستتمكن من حفظ الفيديوهات في مكتبتك الشخصية
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
