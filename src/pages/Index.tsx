import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { BookOpen, Video, Sparkles, Play, Users, Download } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'جميع السور',
    description: 'الوصول إلى جميع سور القرآن الكريم البالغ عددها 114 سورة',
  },
  {
    icon: Users,
    title: 'شيوخ مشهورون',
    description: 'اختر من بين أشهر القراء مثل العفاسي والسديس وغيرهم',
  },
  {
    icon: Video,
    title: 'خلفيات مذهلة',
    description: 'فيديوهات وصور طبيعية خلابة لخلفية المقاطع',
  },
  {
    icon: Sparkles,
    title: 'نص متزامن',
    description: 'عرض الآيات بشكل احترافي متزامن مع التلاوة',
  },
  {
    icon: Download,
    title: 'تحميل سهل',
    description: 'تحميل الفيديوهات بجودة عالية لمشاركتها',
  },
  {
    icon: Play,
    title: 'صيغ متعددة',
    description: 'اختر بين الصيغة العمودية للريلز أو الأفقية ليوتيوب',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 islamic-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>أنشئ مقاطع قرآنية بسهولة</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">قرآن ريلز</span>
              <br />
              <span className="text-foreground">مقاطع قرآنية احترافية</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              أنشئ مقاطع فيديو قصيرة من القرآن الكريم مع تلاوات الشيوخ المشهورين
              وخلفيات طبيعية ساحرة، جاهزة للمشاركة على منصات التواصل الاجتماعي
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/create">
                  <Video className="h-5 w-5 ml-2" />
                  ابدأ الإنشاء
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/surahs">
                  <BookOpen className="h-5 w-5 ml-2" />
                  تصفح السور
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 top-1/4 h-20 w-20 rounded-full bg-quran-gold/20 blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-10 bottom-1/4 h-32 w-32 rounded-full bg-primary/20 blur-3xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">المميزات</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              كل ما تحتاجه لإنشاء مقاطع قرآنية احترافية في مكان واحد
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card rounded-xl p-6 border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary text-primary-foreground mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 islamic-pattern opacity-10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                جاهز لإنشاء مقطعك الأول؟
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                ابدأ الآن بإنشاء مقاطع قرآنية احترافية في دقائق معدودة
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/create">
                  <Play className="h-5 w-5 ml-2" />
                  ابدأ مجاناً
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
