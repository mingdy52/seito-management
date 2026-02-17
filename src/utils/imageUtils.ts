import { IMAGE_MAX_SIZE, IMAGE_QUALITY } from '../constants';

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > IMAGE_MAX_SIZE) {
            height *= IMAGE_MAX_SIZE / width;
            width = IMAGE_MAX_SIZE;
          }
        } else {
          if (height > IMAGE_MAX_SIZE) {
            width *= IMAGE_MAX_SIZE / height;
            height = IMAGE_MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      img.src = event.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
