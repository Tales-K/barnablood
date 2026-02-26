'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, ClipboardPaste, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDropZoneProps {
  onImage: (file: File) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function fileFromClipboard(items: DataTransferItemList): File | null {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file' && ACCEPTED_TYPES.includes(item.type)) {
      return item.getAsFile();
    }
  }
  return null;
}

export function ImageDropZone({ onImage }: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      onImage(file);
    },
    [onImage]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (ACCEPTED_TYPES.includes(type)) {
            const blob = await item.getType(type);
            const file = new File([blob], 'pasted-image.' + type.split('/')[1], { type });
            handleFile(file);
            return;
          }
        }
      }
    } catch {
      // Fallback: ask the user to use Ctrl+V on the zone
    }
  };

  const handleWindowPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData?.items) {
      const file = fileFromClipboard(e.clipboardData.items);
      if (file) handleFile(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onPaste={handleWindowPaste}
      tabIndex={0}
      className={`
        relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed
        p-10 transition-colors outline-none focus:ring-2 focus:ring-ring
        ${isDragging
          ? 'border-primary bg-primary/10'
          : 'border-muted-foreground/30 hover:border-muted-foreground/60'
        }
      `}
    >
      <ImageIcon className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">
        Drop an image here, or use the buttons below
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePaste}
        >
          <ClipboardPaste className="h-4 w-4 mr-2" />
          Paste from Clipboard
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        You can also press Ctrl+V while this area is focused
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
