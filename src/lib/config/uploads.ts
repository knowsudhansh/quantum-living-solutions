// Public upload policy shared by the browser and server. No credentials here.
// 4 MiB leaves >300 KB below Vercel's 4.5 MB request cap for multipart overhead.
export const MAX_MEDIA_FILE_SIZE = 4 * 1024 * 1024;
export const MEDIA_FILE_SIZE_ERROR = 'File size exceeds 4 MiB limit';
