export function bufferToDataUrl(mimeType, data) {
    const type = mimeType && mimeType.length ? mimeType : 'image/jpeg';
    return `data:${type};base64,${Buffer.from(data).toString('base64')}`;
}
export function ensureImageIsAllowed(file) {
    if (!file) {
        throw new Error('Image file is required');
    }
    const type = file.mimetype || '';
    if (!type.includes('jpeg') && !type.includes('png')) {
        throw new Error('Only JPEG or PNG images are supported');
    }
}
