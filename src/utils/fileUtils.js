/**
 * Convert ArrayBuffer to base64 data URL.
 * @description It is useful when you want to use LxFileViewer component to show application/pdf files.
 * @param {ArrayBuffer} buffer - ArrayBuffer, which will be converted to base64.
 * @param {import('@/constants').MIME_TYPES} mimeType - MIME type of the data.
 * @returns {Promise<string>} Promise with base64 data URL.
 * @throws {Error} - FileReader error or FileReader did not return a string.
 * @example const base64 = await lxFileUtils.arrayBufferToBase64(buffer, MIME_TYPES.PDF);
 */
export async function arrayBufferToBase64(buffer, mimeType) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer], { type: mimeType });
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        const resBase64 = `data:${mimeType};base64,${base64}`;
        resolve(resBase64);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
