import { Footer } from "./Footer";
import { Header } from "./Header";
type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
<div className="min-h-screen bg-brandBg text-brandText">      <Header />
      {children}
      <Footer />
    </div>
  );
}