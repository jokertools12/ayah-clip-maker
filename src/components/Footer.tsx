import { Link } from 'react-router-dom';
import { Heart, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 gradient-text">قرآن ريلز</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              منصة لإنشاء مقاطع فيديو قصيرة من القرآن الكريم والابتهالات والتواشيح
              بأصوات أشهر القراء والمبتهلين مع خلفيات طبيعية جميلة.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/surahs" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  تصفح السور
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  إنشاء فيديو قرآني
                </Link>
              </li>
              <li>
                <Link to="/ibtahalat" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  ابتهالات وتواشيح
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  المكتبة الشخصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Github"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            صُنع بـ <Heart className="h-4 w-4 text-destructive" /> لنشر كلام الله
          </p>
        </div>
      </div>
    </footer>
  );
}