import { useState } from "react";
import { Button } from "@/components/ui/button";
import Newsletter from "@/components/Newsletter";
import Forum from "@/components/Forum";
import { Newspaper, MessageSquare } from "lucide-react";

export default function Index() {
  const [activeSection, setActiveSection] = useState<"newsletter" | "forum">(
    "newsletter",
  );

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12 animate-fade-in">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
          Newsletter & Fórum
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-4">
          Acompanhe as últimas novidades e participe das discussões mais
          relevantes da comunidade tech.
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6 md:mb-8 animate-slide-up px-4">
        <div className="flex bg-muted rounded-lg p-1 shadow-sm w-full max-w-md">
          <Button
            variant={activeSection === "newsletter" ? "default" : "ghost"}
            size="lg"
            onClick={() => setActiveSection("newsletter")}
            className={`flex items-center space-x-2 px-4 md:px-8 py-3 rounded-md transition-all duration-200 flex-1 ${
              activeSection === "newsletter"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Newspaper className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Newsletter</span>
          </Button>
          <Button
            variant={activeSection === "forum" ? "default" : "ghost"}
            size="lg"
            onClick={() => setActiveSection("forum")}
            className={`flex items-center space-x-2 px-4 md:px-8 py-3 rounded-md transition-all duration-200 flex-1 ${
              activeSection === "forum"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Fórum</span>
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="animate-scale-in">
        {activeSection === "newsletter" && <Newsletter />}
        {activeSection === "forum" && <Forum />}
      </div>
    </main>
  );
}
