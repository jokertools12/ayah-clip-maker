import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Video, Library, LogIn, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">قرآن ريلز</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/surahs"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>السور</span>
            </Link>
            <Link
              to="/create"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Video className="h-4 w-4" />
              <span>إنشاء فيديو</span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/library"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Library className="h-4 w-4" />
                <span>مكتبتي</span>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-muted-foreground text-sm">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/library" className="flex items-center gap-2">
                      <Library className="h-4 w-4" />
                      <span>مكتبتي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 ml-2" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
