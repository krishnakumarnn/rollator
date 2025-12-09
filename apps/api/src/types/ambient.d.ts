// apps/api/src/types/ambient.d.ts
declare module 'multer'; // quiets the module resolution if node_modules types are odd

// Minimal shape if @types/express is not available for some reason
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer?: Buffer;
    }
  }
}
