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
            <div
              key={item.id}
              className="w-full rounded-lg border border-border/50 p-4 hover:bg-muted/80 cursor-pointer transition-colors"
              onClick={() => onSelect(item)}
            >
              <p className="font-semibold text-sm leading-loose text-right whitespace-pre-wrap" style={{ fontFamily: '"Amiri", serif' }}>
                {item.text}
              </p>
              <div className="flex items-center justify-between mt-2">
                <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 text-right">
                  {item.subcategory && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                      {item.subcategory}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
