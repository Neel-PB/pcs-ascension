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
    // Detect if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Prefer the app's actual computed background (avoids "washed out" captures)
    const fallbackBg = isDarkMode ? '#0a0a0b' : '#ffffff';
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;

    const isUsableBg = (c?: string | null) =>
      !!c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)';

    const backgroundColor = isUsableBg(bodyBg) ? bodyBg : isUsableBg(htmlBg) ? htmlBg : fallbackBg;

    // Capture full page with html2canvas
    const scaleFactor = window.devicePixelRatio;

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: backgroundColor,
      scale: scaleFactor,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      ignoreElements: (el) => {
        return el.closest('[data-feedback-ui]') !== null;
      },
    });

    // If area specified, crop the canvas
    if (area) {
      const croppedCanvas = document.createElement('canvas');
      // Add scroll offset — selection uses viewport coords, canvas includes full page
      const cropX = (area.x + window.scrollX) * scaleFactor;
      const cropY = (area.y + window.scrollY) * scaleFactor;
      
      croppedCanvas.width = area.width * scaleFactor;
      croppedCanvas.height = area.height * scaleFactor;

      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(
        canvas,
        area.x * scaleFactor,
        area.y * scaleFactor,
        area.width * scaleFactor,
        area.height * scaleFactor,
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
