import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, RotateCw, Trash2 } from '@/lib/icons';
import Cropper from 'react-easy-crop';
import { createCroppedImage, type CropArea } from '@/lib/cropImage';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadCropProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentAvatarUrl?: string | null;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUploadCrop({ open, onOpenChange, userId, currentAvatarUrl }: AvatarUploadCropProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  
  const { uploadAvatar, deleteAvatar, isUploading } = useAvatarUpload();

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file format
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      toast({
        title: 'Invalid format',
        description: 'Please select a JPEG, PNG, or WebP image',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels, rotation);
      await uploadAvatar(userId, croppedBlob);
      handleClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAvatar(userId);
      handleClose();
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onOpenChange(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageSrc ? (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG or WebP (max. 2MB)
                </div>
              </label>
            </div>
          ) : (
            <>
              <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zoom</label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={1}
                    max={3}
                    step={0.1}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotate 90°
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImageSrc(null)}
                  >
                    Change Image
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {currentAvatarUrl && !imageSrc && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Avatar
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            
            {imageSrc && (
              <Button
                type="button"
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save Avatar'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
