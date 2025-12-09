export function bufferToDataUrl(mimeType: string | null | undefined, data: Buffer) {
  const type = mimeType && mimeType.length ? mimeType : 'image/jpeg';
  return `data:${type};base64,${Buffer.from(data).toString('base64')}`;
}

export function ensureImageIsAllowed(file?: Express.Multer.File) {
  if (!file) {
    throw new Error('Image file is required');
  }
  const type = file.mimetype || '';
  if (!type.includes('jpeg') && !type.includes('png')) {
    throw new Error('Only JPEG or PNG images are supported');
  }
}
