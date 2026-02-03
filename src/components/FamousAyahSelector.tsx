import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bookmark, ChevronLeft } from 'lucide-react';
import { famousAyahs, FamousAyah } from '@/data/famousAyahs';

interface FamousAyahSelectorProps {
  onSelect: (ayah: FamousAyah) => void;
}

export function FamousAyahSelector({ onSelect }: FamousAyahSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          آيات مشهورة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-4">
          <div className="space-y-2 pb-4">
            {famousAyahs.map((ayah) => (
              <Button
                key={ayah.id}
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/80"
                onClick={() => onSelect(ayah)}
              >
                <div className="text-right">
                  <p className="font-semibold">{ayah.name}</p>
                  <p className="text-xs text-muted-foreground">{ayah.description}</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
