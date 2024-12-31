// middleware/allowExtension.js
export const allowedExtensions = [
    'pdf', 'png', 'jpg', 'jpeg', 'gif', 'docx', 'xlsx', 'txt', 
    'zip', 'rar', 'pptx', 'mp4', 'mp3', 'wav', 'flac', 'avi', 
    'mkv', 'mov', 'wmv', 'wma', 'ogg', 'webm', 'm4a', 'm4v', 
    'flv', '3gp', 'aac', 'mpg', 'mpeg'
];

export const disallowedExtensions = ['exe', 'bat', 'sh'];

export function extensionPermitidas(extension) {
    if (disallowedExtensions.includes(extension)) {
        return false;
    }
    return allowedExtensions.includes(extension);
}
