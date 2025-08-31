'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePdfStore } from '@/lib/store/usePdfStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dynamic from 'next/dynamic'
const PreviewDisplay = dynamic(
  () => import('./PreviewDisplay'),
  { ssr: false }
);

interface SortableItemProps {
  id: string;
  pageNumber: number;
  imageUrl: string;
}

function SortableItem({ id, pageNumber, imageUrl }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab active:cursor-grabbing">
        <CardContent className="p-2">
          <div className="relative aspect-[3/4]">
            
             <PreviewDisplay src={imageUrl}
              alt={`Page ${pageNumber}`}
              className="object-cover rounded"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"/>
            <div className="absolute bottom-0 right-0 p-1 bg-background/80 text-xs rounded-tl">
              {pageNumber}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PageReorderDialogProps {
  fileId: string;
  onClose: () => void;
  onSave: () => void;
}

export function PageReorderDialog({ fileId, onClose, onSave }: PageReorderDialogProps) {
  const { files, updatePageArrangement } = usePdfStore();
  const file = files.find(f => f.id === fileId);
  
  const [items, setItems] = useState(
    file?.previews.map(preview => ({
      id: `${preview.pageNumber}`,
      pageNumber: preview.pageNumber,
      imageUrl: preview.imageUrl,
    })) || []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!file) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    const newArrangement = items.map(item => parseInt(item.id) - 1);
    updatePageArrangement(fileId, newArrangement);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-0 top-0 p-4 bg-background border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold">
            Reorder Pages - {file.name}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Order
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20 p-4 max-w-7xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {items.map((item) => (
                <SortableItem key={item.id} {...item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
