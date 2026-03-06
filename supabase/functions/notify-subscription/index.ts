import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { userId, status, plan, adminNote } = await req.json();

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = userData.user.email;
    const planName = plan === "yearly" ? "السنوية" : "الشهرية";
    const isApproved = status === "approved";

    const subject = isApproved
      ? `✅ تم تفعيل عضويتك ${planName} بنجاح!`
      : `❌ تم رفض طلب العضوية ${planName}`;

    const body = isApproved
      ? `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a;">🎉 مبروك! تم تفعيل عضويتك</h2>
          <p>مرحباً،</p>
          <p>تم تفعيل عضويتك <strong>${planName}</strong> بنجاح في <strong>Ayah Clip Maker</strong>.</p>
          <p>يمكنك الآن الاستمتاع بجميع الميزات المميزة:</p>
          <ul>
            <li>100 فيديو يومياً</li>
            <li>خلفيات وفيديوهات Pexels</li>
            <li>خطوط مميزة وإعدادات متقدمة</li>
            <li>التحكم في سرعة الخلفية</li>
            <li>علامة مائية مخصصة</li>
          </ul>
          <p>شكراً لدعمك! 🌟</p>
        </div>`
      : `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">طلب العضوية ${planName}</h2>
          <p>مرحباً،</p>
          <p>نأسف لإبلاغك أن طلب عضويتك <strong>${planName}</strong> قد تم رفضه.</p>
          ${adminNote ? `<p><strong>ملاحظة:</strong> ${adminNote}</p>` : ""}
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل معنا أو إعادة المحاولة.</p>
        </div>`;

    // Send email using Supabase's built-in email (via auth admin)
    // Since we can't send arbitrary emails via Supabase directly,
    // we'll store the notification in a simple log for now
    // and use the admin's approval flow as the notification mechanism

    console.log(`Email notification for ${email}: ${subject}`);

    return new Response(
      JSON.stringify({ success: true, email, subject }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
