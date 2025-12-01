import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

// Type definition for Multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Cấu hình Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload một file lên Cloudinary
   */
  async uploadFile(
    file: MulterFile,
    folder: string = 'cccd',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Không có file để upload');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh: JPEG, PNG, WEBP');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File không được vượt quá 5MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `nha-tro/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Giới hạn kích thước
            { quality: 'auto:good' }, // Tự động tối ưu chất lượng
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(
              new BadRequestException(`Upload thất bại: ${error.message}`),
            );
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
            });
          }
        },
      );

      // Convert buffer to readable stream
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload ảnh CCCD (2 mặt)
   */
  async uploadCccdImages(
    frontImage: MulterFile,
    backImage: MulterFile,
    tenantId: number,
  ): Promise<{ front: UploadResult; back: UploadResult }> {
    const folder = `cccd/tenant-${tenantId}`;

    const [front, back] = await Promise.all([
      this.uploadFile(frontImage, folder),
      this.uploadFile(backImage, folder),
    ]);

    return { front, back };
  }

  /**
   * Upload một ảnh đơn (dùng cho các trường hợp khác)
   */
  async uploadSingleImage(
    file: MulterFile,
    folder: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, folder);
  }

  /**
   * Xóa ảnh trên Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Lỗi khi xóa ảnh:', error);
    }
  }

  /**
   * Xóa nhiều ảnh
   */
  async deleteImages(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;

    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Lỗi khi xóa nhiều ảnh:', error);
    }
  }
}
