import { safeDeprecationWarning } from '../helpers';
import type { TUploadableMedia, TUploadTypeV1 } from '../types';
import { EUploadMimeType } from '../types';

interface FileSystemModule {
  promises: {
    FileHandle: any;
    open: (path: string, flags: string) => Promise<any>;
  };
  Stats: any;
  readFile: (handle: number, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => void;
  fstat: (handle: number, callback: (err: NodeJS.ErrnoException | null, stats: FileSystemModule['Stats']) => void) => void;
  read: (fd: number, buffer: Buffer, offset: number, length: number, position: number, callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: Buffer) => void) => void;
}

let fs: FileSystemModule | null = null;
if (typeof window === 'undefined') {
  fs = require('fs') as FileSystemModule;
}

type FileHandleWithMethods = {
  readFile: () => Promise<Buffer>;
  stat: () => Promise<{ size: number }>;
  read: (buffer: Buffer, offset: number, length: number, position: number) => Promise<{ bytesRead: number }>;
};

export type TFileHandle = number | Buffer | FileHandleWithMethods;

// -------------
// Media helpers
// -------------

export async function readFileIntoBuffer(file: TUploadableMedia): Promise<Buffer> {
  const handle = await getFileHandle(file);

  if (typeof handle === 'number') {
    return new Promise<Buffer>((resolve, reject) => {
      fs!.readFile(handle, (err, data) => err ? reject(err) : resolve(data));
    });
  } else if (handle instanceof Buffer) {
    return handle;
  } else if ('readFile' in handle) {
    return handle.readFile();
  } else {
    throw new Error('Invalid file handle');
  }
}

export async function getFileHandle(file: TUploadableMedia): Promise<TFileHandle> {
  if (typeof window === 'undefined') {
    // Node.js environment
    if (typeof file === 'string') {
      return fs!.promises.open(file, 'r');
    } else if (typeof file === 'number' || file instanceof Buffer) {
      return file;
    } else if (typeof file === 'object' && 'readFile' in file && 'stat' in file && 'read' in file) {
      return file as FileHandleWithMethods;
    }
  } else {
    // Browser environment
    if (file instanceof Blob || file instanceof ArrayBuffer) {
      return file as Buffer;
    }
  }
  throw new Error('Invalid file type');
}

export async function getFileSizeFromFileHandle(fileHandle: TFileHandle): Promise<number> {
  if (typeof fileHandle === 'number') {
    const stats = await new Promise<FileSystemModule['Stats']>((resolve, reject) => {
      fs!.fstat(fileHandle, (err, stats) => err ? reject(err) : resolve(stats));
    });
    return stats.size;
  } else if (fileHandle instanceof Buffer) {
    return fileHandle.length;
  } else if ('stat' in fileHandle) {
    return (await fileHandle.stat()).size;
  }
  throw new Error('Invalid file handle');
}

export function getMimeType(file: TUploadableMedia, type?: TUploadTypeV1 | string, mimeType?: EUploadMimeType | string) {
  if (typeof mimeType === 'string') {
    return mimeType;
  } else if (typeof file === 'string' && !type) {
    return getMimeByName(file);
  } else if (typeof type === 'string') {
    return getMimeByType(type);
  }

  throw new Error('You must specify type if file is a file handle or Buffer.');
}

function getMimeByName(name: string) {
  if (name.endsWith('.jpeg') || name.endsWith('.jpg')) return EUploadMimeType.Jpeg;
  if (name.endsWith('.png')) return EUploadMimeType.Png;
  if (name.endsWith('.webp')) return EUploadMimeType.Webp;
  if (name.endsWith('.gif')) return EUploadMimeType.Gif;
  if (name.endsWith('.mpeg4') || name.endsWith('.mp4')) return EUploadMimeType.Mp4;
  if (name.endsWith('.mov') || name.endsWith('.mov')) return EUploadMimeType.Mov;
  if (name.endsWith('.srt')) return EUploadMimeType.Srt;

  safeDeprecationWarning({
    instance: 'TwitterApiv1ReadWrite',
    method: 'uploadMedia',
    problem: 'options.mimeType is missing and filename couldn\'t help to resolve MIME type, so it will fallback to image/jpeg',
    resolution: 'If you except to give filenames without extensions, please specify explicitlty the MIME type using options.mimeType',
  });

  return EUploadMimeType.Jpeg;
}

function getMimeByType(type: TUploadTypeV1 | string) {
  safeDeprecationWarning({
    instance: 'TwitterApiv1ReadWrite',
    method: 'uploadMedia',
    problem: 'you\'re using options.type',
    resolution: 'Remove options.type argument and migrate to options.mimeType which takes the real MIME type. ' +
      'If you\'re using type=longmp4, add options.longVideo alongside of mimeType=EUploadMimeType.Mp4',
  });

  if (type === 'gif') return EUploadMimeType.Gif;
  if (type === 'jpg') return EUploadMimeType.Jpeg;
  if (type === 'png') return EUploadMimeType.Png;
  if (type === 'webp') return EUploadMimeType.Webp;
  if (type === 'srt') return EUploadMimeType.Srt;
  if (type === 'mp4' || type === 'longmp4') return EUploadMimeType.Mp4;
  if (type === 'mov') return EUploadMimeType.Mov;

  return type;
}

export function getMediaCategoryByMime(name: string, target: 'tweet' | 'dm') {
  if (name === EUploadMimeType.Mp4 || name === EUploadMimeType.Mov) return target === 'tweet' ? 'TweetVideo' : 'DmVideo';
  if (name === EUploadMimeType.Gif) return target === 'tweet' ? 'TweetGif' : 'DmGif';
  if (name === EUploadMimeType.Srt) return 'Subtitles';
  else return target === 'tweet' ? 'TweetImage' : 'DmImage';
}

export function sleepSecs(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export async function readNextPartOf(file: TFileHandle, chunkLength: number, bufferOffset = 0, buffer?: Buffer): Promise<[Buffer, number]> {
  const actualBuffer: Buffer = buffer || Buffer.alloc(chunkLength);
  let bytesRead: number;

  if (typeof file === 'number') {
    bytesRead = await new Promise<number>((resolve, reject) => {
      fs!.read(file, actualBuffer, 0, chunkLength, bufferOffset, (err, nread) => err ? reject(err) : resolve(nread));
    });
  } else if (file instanceof Buffer) {
    const rt = file.slice(bufferOffset, bufferOffset + chunkLength);
    rt.copy(actualBuffer);
    bytesRead = rt.length;
  } else if ('read' in file) {
    const { bytesRead: nread } = await file.read(actualBuffer, 0, chunkLength, bufferOffset);
    bytesRead = nread;
  } else {
    throw new Error('Invalid file handle');
  }

  return [actualBuffer.slice(0, bytesRead), bytesRead];
}
