import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SurahsPage from "./pages/SurahsPage";
import CreatePage from "./pages/CreatePage";
import IbtahalatPage from "./pages/IbtahalatPage";
import PreviewPage from "./pages/PreviewPage";
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import BrowsePage from "./pages/BrowsePage";
import PricingPage from "./pages/PricingPage";
import AdminPage from "./pages/AdminPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import MyStatsPage from "./pages/MyStatsPage";
import AchievementsPage from "./pages/AchievementsPage";
import DiscoverPage from "./pages/DiscoverPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/surahs" element={<SurahsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/ibtahalat" element={<IbtahalatPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/my-stats" element={<MyStatsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
