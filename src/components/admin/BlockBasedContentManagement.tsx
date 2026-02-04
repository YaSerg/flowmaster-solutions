import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Home, Building2, Truck, Phone, FileText } from "lucide-react";
import PageBlocksEditor from "./PageBlocksEditor";

const PAGES = [
  { id: "home_page", label: "Главная", icon: Home },
  { id: "about_page", label: "О компании", icon: Building2 },
  { id: "suppliers_page", label: "Для поставщиков", icon: Truck },
  { id: "contacts_page", label: "Контакты", icon: Phone },
];

const BlockBasedContentManagement = () => {
  const [activeTab, setActiveTab] = useState(PAGES[0].id);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-2">
          {PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <TabsTrigger key={page.id} value={page.id} className="gap-2">
                <Icon className="h-4 w-4" />
                {page.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page.id} value={page.id}>
            <PageBlocksEditor pageId={page.id} pageLabel={page.label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BlockBasedContentManagement;
