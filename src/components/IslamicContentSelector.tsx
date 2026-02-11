import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { islamicContent, contentCategories, getContentByCategory, IslamicContentItem } from '@/data/islamicContent';

interface IslamicContentSelectorProps {
  onSelect: (item: IslamicContentItem) => void;
}

export function IslamicContentSelector({ onSelect }: IslamicContentSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const items = getContentByCategory(activeCategory);

  return (
    <div className="space-y-3">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full grid grid-cols-4">
          {contentCategories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs gap-1">
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[45vh]">
        <div className="space-y-2 p-1">
          {items.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/80 text-right"
              onClick={() => onSelect(item)}
            >
              <div className="text-right flex-1">
                <p className="font-semibold text-sm leading-relaxed" style={{ fontFamily: '"Amiri", serif' }}>
                  {item.text.length > 80 ? item.text.substring(0, 80) + '...' : item.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.source}
                  {item.subcategory && (
                    <span className="mr-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                      {item.subcategory}
                    </span>
                  )}
                </p>
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
