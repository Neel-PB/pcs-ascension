import html2canvas from 'html2canvas';

type CaptureArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const capturePageScreenshot = async (
  area?: CaptureArea
): Promise<Blob | null> => {
  try {
    // Capture full page with html2canvas
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: window.devicePixelRatio,
      logging: false,
      ignoreElements: (el) => {
        return el.closest('[data-feedback-ui]') !== null;
      },
    });

    // If area specified, crop the canvas
    if (area) {
      const croppedCanvas = document.createElement('canvas');
      const scale = window.devicePixelRatio;
      
      croppedCanvas.width = area.width * scale;
      croppedCanvas.height = area.height * scale;

      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(
        canvas,
        area.x * scale,
        area.y * scale,
        area.width * scale,
        area.height * scale,
        0,
        0,
        croppedCanvas.width,
        croppedCanvas.height
      );

      return new Promise<Blob>((resolve, reject) => {
        croppedCanvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
          'image/png',
          1.0
        );
      });
    }

    // Return full page if no area
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return null;
  }
};
