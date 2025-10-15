import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Columns3, RotateCcw } from 'lucide-react';
import { ColumnDef, ColumnState } from '@/types/table';
import { useColumnStore } from '@/stores/useColumnStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnVisibilityPanelProps<T = any> {
  columns: ColumnDef<T>[];
  storeNamespace: string;
}

export function ColumnVisibilityPanel<T = any>({
  columns,
  storeNamespace,
}: ColumnVisibilityPanelProps<T>) {
  const { getColumns, setColumnVisibility, resetToDefault } = useColumnStore();
  const columnStates = getColumns(storeNamespace);

  const handleToggle = (columnId: string, visible: boolean) => {
    setColumnVisibility(storeNamespace, columnId, visible);
  };

  const handleReset = () => {
    const defaultStates: ColumnState[] = columns.map((col, index) => ({
      id: col.id,
      isVisible: true,
      order: index,
      width: col.width,
    }));
    resetToDefault(storeNamespace, defaultStates);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns3 className="h-4 w-4" />
          Columns
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Column Visibility</SheetTitle>
          <SheetDescription>
            Show or hide columns in the table
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>

          <ScrollArea className="h-[calc(100vh-240px)]">
            <div className="space-y-3">
              {columns.map((column) => {
                const state = columnStates.find(cs => cs.id === column.id);
                const isVisible = state?.isVisible !== false;
                const isLocked = column.locked;

                return (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={isVisible}
                      onCheckedChange={(checked) => handleToggle(column.id, !!checked)}
                      disabled={isLocked}
                    />
                    <Label
                      htmlFor={column.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {column.label}
                      {isLocked && (
                        <span className="ml-2 text-xs text-muted-foreground">(locked)</span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
