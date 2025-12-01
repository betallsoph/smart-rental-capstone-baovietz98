import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('cccd/:tenantId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Upload ảnh CCCD 2 mặt',
    description: 'Upload ảnh mặt trước và mặt sau CCCD cho khách thuê',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'tenantId', type: Number, description: 'ID khách thuê' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        front: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh mặt trước CCCD',
        },
        back: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh mặt sau CCCD',
        },
      },
      required: ['front', 'back'],
    },
  })
  @ApiResponse({ status: 201, description: 'Upload thành công' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  async uploadCccd(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @UploadedFiles()
    files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] },
  ) {
    if (!files.front?.[0] || !files.back?.[0]) {
      throw new BadRequestException('Cần upload cả 2 mặt CCCD');
    }

    const result = await this.uploadService.uploadCccdImages(
      files.front[0],
      files.back[0],
      tenantId,
    );

    return {
      message: 'Upload CCCD thành công',
      data: {
        cccdFront: result.front.url,
        cccdBack: result.back.url,
        cccdFrontPublicId: result.front.publicId,
        cccdBackPublicId: result.back.publicId,
      },
    };
  }

  @Post('image/:folder')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload một ảnh đơn',
    description: 'Upload một ảnh vào folder chỉ định',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'folder',
    type: String,
    description: 'Tên folder (vd: issues, rooms)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Upload thành công' })
  async uploadImage(
    @Param('folder') folder: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadSingleImage(file, folder);

    return {
      message: 'Upload thành công',
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    };
  }

  @Post('images/:folder')
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files
  @ApiOperation({
    summary: 'Upload nhiều ảnh',
    description: 'Upload nhiều ảnh (tối đa 5) vào folder chỉ định',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'folder',
    type: String,
    description: 'Tên folder (vd: issues, rooms)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Các file ảnh (tối đa 5)',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 201, description: 'Upload thành công' })
  async uploadImages(
    @Param('folder') folder: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file để upload');
    }

    const results = await Promise.all(
      files.map((file) => this.uploadService.uploadSingleImage(file, folder)),
    );

    return {
      message: `Upload thành công ${results.length} ảnh`,
      data: results.map((r) => ({
        url: r.url,
        publicId: r.publicId,
      })),
    };
  }
}
