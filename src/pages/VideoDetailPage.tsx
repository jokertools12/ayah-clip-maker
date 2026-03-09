import { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart, Share2, Mic, BookOpen, Loader2, Clock,
  MessageCircle, Send, User, Trash2, Reply, ArrowRight,
  Copy, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
  parent_id: string | null;
  replies?: Comment[];
}

export default function VideoDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('id');

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);

  useEffect(() => {
    if (videoId) loadVideo();
  }, [videoId, user]);

  const loadVideo = async () => {
    if (!videoId) return;
    setLoading(true);

    const { data: videoData } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('id', videoId)
      .maybeSingle();

    if (!videoData) {
      setLoading(false);
      return;
    }

    setVideo(videoData);

    // Load in parallel
    const [
      { data: likesData },
      { data: commentsData },
      { data: profileData },
    ] = await Promise.all([
      supabase.from('video_likes').select('id, user_id').eq('video_id', videoId),
      supabase.from('video_comments' as any).select('id, user_id, content, created_at, parent_id').eq('video_id', videoId).order('created_at', { ascending: true }),
      supabase.from('profiles').select('user_id, display_name, avatar_url, bio').eq('user_id', videoData.user_id).maybeSingle(),
    ]);

    setLikesCount((likesData || []).length);
    setIsLiked(user ? (likesData || []).some((l: any) => l.user_id === user.id) : false);
    setCreatorProfile(profileData);

    // Build threaded comments
    const userIds = [...new Set(((commentsData as any[]) || []).map((c: any) => c.user_id))];
    const { data: profiles } = userIds.length > 0
      ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
      : { data: [] };

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

    const allComments = ((commentsData as any[]) || []).map((c: any) => ({
      ...c,
      display_name: profileMap[c.user_id]?.display_name || null,
      avatar_url: profileMap[c.user_id]?.avatar_url || null,
      replies: [] as Comment[],
    }));

    const rootComments: Comment[] = [];
    const commentMap = new Map<string, Comment>();
    allComments.forEach(c => commentMap.set(c.id, c));
    allComments.forEach(c => {
      if (c.parent_id && commentMap.has(c.parent_id)) {
        commentMap.get(c.parent_id)!.replies!.push(c);
      } else {
        rootComments.push(c);
      }
    });

    setComments(rootComments);
    setLoading(false);
  };

  const toggleLike = async () => {
    if (!isAuthenticated || !user || !videoId) {
      toast.error('سجل دخول أولاً');
      return;
    }
    if (isLiked) {
      await supabase.from('video_likes').delete().eq('user_id', user.id).eq('video_id', videoId);
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from('video_likes').insert({ user_id: user.id, video_id: videoId });
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const submitComment = async () => {
    if (!isAuthenticated || !user || !videoId) {
      toast.error('سجل دخول أولاً');
      return;
    }
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    const insertData: any = { video_id: videoId, user_id: user.id, content: commentText.trim() };
    if (replyingTo) insertData.parent_id = replyingTo.id;

    const { data, error } = await supabase
      .from('video_comments' as any)
      .insert(insertData)
      .select('id, user_id, content, created_at, parent_id')
      .single();

    if (!error && data) {
      const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user.id).maybeSingle();
      const newComment: Comment = {
        ...(data as any),
        display_name: (profile as any)?.display_name || null,
        avatar_url: (profile as any)?.avatar_url || null,
        replies: [],
      };

      if (replyingTo) {
        setComments(prev => prev.map(c => c.id === replyingTo.id ? { ...c, replies: [...(c.replies || []), newComment] } : c));
      } else {
        setComments(prev => [...prev, newComment]);
      }
      setCommentText('');
      setReplyingTo(null);
    }
    setSubmittingComment(false);
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from('video_comments' as any).delete().eq('id', commentId);
    setComments(prev =>
      prev.filter(c => c.id !== commentId)
        .map(c => ({ ...c, replies: (c.replies || []).filter(r => r.id !== commentId) }))
    );
  };

  const shareVideo = () => {
    const url = `${window.location.origin}/video?id=${videoId}`;
    const text = video ? `🎬 ${video.surah_name} | القارئ: ${video.reciter_name}` : '';
    if (navigator.share) {
      navigator.share({ title: 'قرآن ريلز', text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الفيديو');
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/video?id=${videoId}`;
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `منذ ${days} يوم`;
    return `منذ ${Math.floor(days / 30)} شهر`;
  };

  if (loading || authLoading) {
    return <Layout><div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!video) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">الفيديو غير موجود</h2>
          <p className="text-muted-foreground mb-4">قد يكون تم حذفه أو أنه غير عام</p>
          <Button asChild><Link to="/discover">العودة للاكتشاف</Link></Button>
        </div>
      </Layout>
    );
  }

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
          <Link to="/discover">
            <ArrowRight className="h-4 w-4" />
            العودة للاكتشاف
          </Link>
        </Button>

        {/* Video Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
              <BookOpen className="h-14 w-14 text-primary mx-auto mb-3" />
              <h1 className="text-2xl font-bold">{video.surah_name}</h1>
              <p className="text-muted-foreground mt-1">آية {video.start_ayah} - {video.end_ayah}</p>
            </div>

            <CardContent className="p-6">
              {/* Creator info */}
              {creatorProfile && (
                <Link to={`/profile?id=${video.user_id}`} className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {creatorProfile.avatar_url ? (
                      <img src={creatorProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{creatorProfile.display_name || 'مستخدم'}</p>
                    {creatorProfile.bio && <p className="text-xs text-muted-foreground line-clamp-1">{creatorProfile.bio}</p>}
                  </div>
                </Link>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{video.reciter_name}</span>
                </div>
                <Badge variant="secondary">{video.aspect_ratio}</Badge>
                <Badge variant="outline">{video.background_type}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(video.created_at)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-2">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  onClick={toggleLike}
                  className="gap-2 flex-1"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  {likesCount} إعجاب
                </Button>
                <Button variant="outline" onClick={shareVideo} className="gap-2 flex-1">
                  <Share2 className="h-5 w-5" />
                  مشاركة
                </Button>
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comments Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                التعليقات ({totalComments})
              </h2>

              {/* Comment Input */}
              {isAuthenticated ? (
                <div className="mb-6">
                  {replyingTo && (
                    <div className="flex items-center gap-2 text-xs text-primary mb-2 bg-primary/5 rounded p-2">
                      <Reply className="h-3 w-3" />
                      <span>رد على {replyingTo.name}</span>
                      <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground mr-auto">✕</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder={replyingTo ? `رد على ${replyingTo.name}...` : 'اكتب تعليقاً...'}
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitComment()}
                      className="text-sm"
                    />
                    <Button onClick={submitComment} disabled={submittingComment || !commentText.trim()} className="gap-1">
                      <Send className="h-4 w-4" />
                      إرسال
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 mb-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline font-medium">سجل دخول</Link> لإضافة تعليق
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد تعليقات بعد. كن أول من يعلق!</p>
                ) : comments.map(c => (
                  <div key={c.id} className="space-y-3">
                    {/* Root comment */}
                    <div className="flex items-start gap-3">
                      <Link to={`/profile?id=${c.user_id}`}>
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={`/profile?id=${c.user_id}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {c.display_name || 'مستخدم'}
                          </Link>
                          <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{c.content}</p>
                        <button
                          onClick={() => setReplyingTo({ id: c.id, name: c.display_name || 'مستخدم' })}
                          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                        >
                          <Reply className="h-3 w-3" />
                          رد
                        </button>
                      </div>
                      {c.user_id === user?.id && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteComment(c.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {/* Replies */}
                    {(c.replies || []).map(r => (
                      <div key={r.id} className="flex items-start gap-3 mr-8 border-r-2 border-primary/20 pr-3">
                        <Link to={`/profile?id=${r.user_id}`}>
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {r.avatar_url ? (
                              <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link to={`/profile?id=${r.user_id}`} className="font-medium text-xs hover:text-primary transition-colors">
                              {r.display_name || 'مستخدم'}
                            </Link>
                            <span className="text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</span>
                          </div>
                          <p className="text-xs text-foreground mt-0.5">{r.content}</p>
                        </div>
                        {r.user_id === user?.id && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteComment(r.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}