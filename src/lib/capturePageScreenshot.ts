import { toBlob } from 'html-to-image';

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
    const isDarkMode = document.documentElement.classList.contains('dark');
    const fallbackBg = isDarkMode ? '#0a0a0b' : '#ffffff';
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;

    const isUsableBg = (c?: string | null) =>
      !!c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)';

    const backgroundColor = isUsableBg(bodyBg) ? bodyBg : isUsableBg(htmlBg) ? htmlBg : fallbackBg;

    const pixelRatio = window.devicePixelRatio;

    const filter = (node: HTMLElement) => {
      if (node?.closest?.('[data-feedback-ui]')) return false;
      if (node?.getAttribute?.('data-feedback-ui')) return false;
      return true;
    };

    const fullBlob = await toBlob(document.body, {
      backgroundColor,
      pixelRatio,
      filter,
      cacheBust: true,
    });

    if (!fullBlob) {
      throw new Error('html-to-image returned null blob');
    }

    // No area specified — return full page
    if (!area) return fullBlob;

    // Crop the selected area from the full-page image
    const img = await createImageBitmap(fullBlob);

    const cropX = (area.x + window.scrollX) * pixelRatio;
    const cropY = (area.y + window.scrollY) * pixelRatio;
    const cropW = area.width * pixelRatio;
    const cropH = area.height * pixelRatio;

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    img.close();

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
