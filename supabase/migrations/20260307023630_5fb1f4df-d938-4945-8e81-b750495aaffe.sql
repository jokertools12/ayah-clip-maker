-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can insert notifications for any user (via service role or RPC)
CREATE POLICY "Service can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create a function to send notification when payment status changes
CREATE OR REPLACE FUNCTION public.notify_payment_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (NEW.user_id, 'تم قبول طلب الاشتراك', 'تهانينا! تم تفعيل اشتراكك بنجاح. استمتع بجميع المميزات الاحترافية.', 'success');
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (NEW.user_id, 'تم رفض طلب الاشتراك', COALESCE('سبب الرفض: ' || NEW.admin_note, 'تم رفض طلبك. يرجى التواصل مع الدعم.'), 'error');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger
CREATE TRIGGER on_payment_status_change
  AFTER UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;