import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Shield, Users, CreditCard, BarChart3, Check, X, Clock,
  Loader2, Search, Crown, Video, TrendingUp, UserCheck, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PaymentRequest {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  payment_method: string;
  phone_number: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalVideos: number;
  premiumUsers: number;
  pendingRequests: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, fetchPaymentRequests, approvePayment, rejectPayment, fetchAllUsers, fetchStats, fetchDailyVideoStats } = useAdmin();

  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalVideos: 0, premiumUsers: 0, pendingRequests: 0 });
  const [dailyVideoData, setDailyVideoData] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [userSearch, setUserSearch] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) loadRequests();
  }, [filter, isAdmin]);

  const loadAll = async () => {
    setLoadingData(true);
    await Promise.all([loadRequests(), loadUsers(), loadStats(), loadDailyVideoStats()]);
    setLoadingData(false);
  };

  const loadDailyVideoStats = async () => {
    const data = await fetchDailyVideoStats();
    setDailyVideoData(data);
  };

  const loadRequests = async () => {
    const { data } = await fetchPaymentRequests(filter);
    setRequests(data as PaymentRequest[]);
  };

  const loadUsers = async () => {
    const data = await fetchAllUsers();
    setUsers(data);
  };

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  const handleApprove = async (req: PaymentRequest) => {
    setProcessingId(req.id);
    await approvePayment(req.id, req.user_id, req.plan);
    toast.success('تم تفعيل الاشتراك بنجاح');
    await loadAll();
    setProcessingId(null);
  };

  const handleReject = async (req: PaymentRequest) => {
    setProcessingId(req.id);
    await rejectPayment(req.id, 'تم الرفض بواسطة الأدمن');
    toast.success('تم رفض الطلب');
    await loadRequests();
    setProcessingId(null);
  };

  if (authLoading || adminLoading) {
    return <Layout><div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const walletName = (method: string) => {
    const map: Record<string, string> = { vodafone_cash: 'فودافون كاش', etisalat_cash: 'اتصالات كاش', orange_cash: 'أورانج كاش', we_pay: 'وي باي' };
    return map[method] || method;
  };

  const planName = (plan: string) => plan === 'yearly' ? 'سنوي' : 'شهري';

  const statusBadge = (status: string) => {
    if (status === 'pending') return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />قيد المراجعة</Badge>;
    if (status === 'approved') return <Badge className="gap-1 bg-green-600"><Check className="h-3 w-3" />تم القبول</Badge>;
    return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />مرفوض</Badge>;
  };

  const filteredUsers = users.filter(u =>
    !userSearch || (u.display_name || '').includes(userSearch) || u.user_id?.includes(userSearch)
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            لوحة تحكم الأدمن
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الاشتراكات والأعضاء والإحصائيات</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي الأعضاء', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
            { label: 'أعضاء مميزون', value: stats.premiumUsers, icon: Crown, color: 'text-amber-500' },
            { label: 'إجمالي الفيديوهات', value: stats.totalVideos, icon: Video, color: 'text-green-500' },
            { label: 'طلبات معلقة', value: stats.pendingRequests, icon: CreditCard, color: 'text-red-500' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="requests" className="gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">طلبات الدفع</span>
              <span className="sm:hidden">طلبات</span>
              {stats.pendingRequests > 0 && <Badge variant="destructive" className="mr-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{stats.pendingRequests}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">الأعضاء</span>
              <span className="sm:hidden">أعضاء</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">الإحصائيات</span>
              <span className="sm:hidden">إحصائيات</span>
            </TabsTrigger>
          </TabsList>

          {/* Payment Requests */}
          <TabsContent value="requests">
            <div className="flex gap-2 mb-4 flex-wrap">
              {['pending', 'approved', 'rejected', 'all'].map(s => (
                <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)}>
                  {s === 'pending' ? 'معلقة' : s === 'approved' ? 'مقبولة' : s === 'rejected' ? 'مرفوضة' : 'الكل'}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">لا توجد طلبات</CardContent></Card>
              ) : requests.map(req => (
                <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {statusBadge(req.status)}
                            <Badge variant="outline">{planName(req.plan)}</Badge>
                            <Badge variant="outline">{walletName(req.payment_method)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            الرقم: <span className="font-mono font-bold">{req.phone_number}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            المبلغ: <span className="font-bold">{req.amount} ج.م</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(req)} disabled={processingId === req.id} className="gap-1">
                              {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              قبول
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(req)} disabled={processingId === req.id} className="gap-1">
                              <X className="h-4 w-4" />
                              رفض
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Members */}
          <TabsContent value="members">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ابحث عن عضو..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pr-10" />
              </div>
            </div>
            <div className="space-y-3">
              {filteredUsers.map(u => (
                <Card key={u.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{u.display_name || 'بدون اسم'}</p>
                      <p className="text-xs text-muted-foreground">{u.user_id}</p>
                      <p className="text-xs text-muted-foreground">
                        انضم: {new Date(u.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> الفيديوهات المنشأة (آخر 7 أيام)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyVideoData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis allowDecimals={false} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="videos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="فيديوهات" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> توزيع الأعضاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'مجاني', value: Math.max(stats.totalUsers - stats.premiumUsers, 0) },
                            { name: 'مميز', value: stats.premiumUsers },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="hsl(var(--muted-foreground))" />
                          <Cell fill="hsl(var(--primary))" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> ملخص</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>الأعضاء المسجلين</span>
                    <span className="font-bold text-lg">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>الأعضاء المميزون</span>
                    <span className="font-bold text-lg text-primary">{stats.premiumUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>الفيديوهات المنشأة</span>
                    <span className="font-bold text-lg">{stats.totalVideos}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>نسبة التحويل</span>
                    <span className="font-bold text-lg">
                      {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> الإيرادات المتوقعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span>الإيراد الشهري المتوقع</span>
                    <span className="font-bold text-lg text-primary">${stats.premiumUsers * 10}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>الإيراد السنوي المتوقع</span>
                    <span className="font-bold text-lg">${stats.premiumUsers * 10 * 12}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
