'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageDropZone } from '@/components/form/ImageDropZone';
import type { ExtractedMonster } from '@/lib/validateExtractedMonster';

export interface FillFromImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtracted: (monster: ExtractedMonster) => void;
}

type ModalState = 'idle' | 'preview' | 'loading' | 'error';

const DAILY_LIMIT = 20;

export function FillFromImageModal({ open, onOpenChange, onExtracted }: FillFromImageModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [usedToday, setUsedToday] = useState<number | null>(null);

  // Fetch current usage whenever the modal opens
  useEffect(() => {
    if (!open) return;
    fetch('/api/monsters/from-image/usage')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUsedToday(data.used); })
      .catch(() => {});
  }, [open]);

  const isLimitReached = usedToday !== null && usedToday >= DAILY_LIMIT;

  const handleImage = useCallback((file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setState('preview');
    setErrorMessage('');
  }, []);

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setState('idle');
    setErrorMessage('');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) handleReset();
    onOpenChange(isOpen);
  };

  const handleConfirm = async () => {
    if (!imageFile) return;
    setState('loading');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/monsters/from-image', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        setErrorMessage(json.error ?? 'Failed to extract monster from image.');
        setState('error');
        if (json.used !== undefined) setUsedToday(json.used);
        return;
      }

      if (json.usage?.used !== undefined) setUsedToday(json.usage.used);
      onExtracted(json.monster as ExtractedMonster);
      handleClose(false);
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setState('error');
    }
  };

  const usageLabel =
    usedToday !== null ? `${usedToday} / ${DAILY_LIMIT} uses today` : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Fill from Image
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between gap-2">
            <span>Drop or upload a monster stat block image and let AI extract the data for you.</span>
            {usageLabel && (
              <span className={`text-xs font-medium shrink-0 ${isLimitReached ? 'text-destructive' : 'text-muted-foreground'}`}>
                {usageLabel}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLimitReached && (
            <p className="text-sm text-destructive text-center rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
              You&apos;ve reached the daily limit of {DAILY_LIMIT} image extractions. Come back tomorrow!
            </p>
          )}

          {!isLimitReached && (state === 'idle' || state === 'error') && (
            <>
              <ImageDropZone onImage={handleImage} />
              {state === 'error' && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}
            </>
          )}

          {!isLimitReached && (state === 'preview' || state === 'loading') && previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border bg-muted max-h-72 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Monster stat block preview"
                  className="object-contain max-h-72 w-full"
                />
                {state === 'preview' && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute top-2 right-2 rounded-full bg-background/80 p-1 hover:bg-background transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {state === 'loading' && (
                  <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Extracting monster data…</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={state === 'loading'}
                >
                  Change Image
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={state === 'loading'}
                >
                  {state === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract & Fill
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
