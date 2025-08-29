import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

class ObjectStorageService {
  constructor() {
    // 네이버 클라우드 플랫폼 Object Storage 설정
    this.s3 = new AWS.S3({
      endpoint: new AWS.Endpoint(process.env.NCP_ENDPOINT),
      region: process.env.NCP_REGION,
      credentials: {
        accessKeyId: process.env.NCP_ACCESS_KEY_ID,
        secretAccessKey: process.env.NCP_SECRET_ACCESS_KEY
      }
    });

    this.bucketName = process.env.NCP_BUCKET_NAME;
  }

  async uploadReceipt(imageBuffer, originalFilename) {
    try {
      if (!this.bucketName || !process.env.NCP_ACCESS_KEY_ID) {
        console.log('Object Storage 설정이 없어서 로컬 처리합니다.');
        return {
          success: false,
          url: null,
          key: null,
          message: 'Object Storage 설정 없음'
        };
      }

      // 고유한 파일명 생성
      const fileExtension = this.getFileExtension(originalFilename);
      const uniqueKey = `receipts/${Date.now()}-${uuidv4()}.${fileExtension}`;

      console.log('Object Storage 업로드 시작:', {
        bucket: this.bucketName,
        key: uniqueKey,
        size: imageBuffer.length
      });

      // Object Storage에 업로드
      const uploadParams = {
        Bucket: this.bucketName,
        Key: uniqueKey,
        Body: imageBuffer,
        ContentType: this.getContentType(fileExtension),
        ACL: 'public-read' // OCR API가 접근할 수 있도록 public으로 설정
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      console.log('Object Storage 업로드 완료:', {
        location: result.Location,
        key: result.Key
      });

      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: this.bucketName
      };

    } catch (error) {
      console.error('Object Storage 업로드 에러:', error);
      return {
        success: false,
        url: null,
        key: null,
        error: error.message
      };
    }
  }

  async deleteReceipt(key) {
    try {
      if (!this.bucketName || !process.env.NCP_ACCESS_KEY_ID) {
        return { success: false, message: 'Object Storage 설정 없음' };
      }

      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(deleteParams).promise();
      console.log('Object Storage 파일 삭제 완료:', key);

      return { success: true };

    } catch (error) {
      console.error('Object Storage 삭제 에러:', error);
      return { success: false, error: error.message };
    }
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  getContentType(extension) {
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp'
    };

    return contentTypes[extension] || 'image/jpeg';
  }

  // 버킷 존재 여부 확인 및 생성
  async ensureBucketExists() {
    try {
      if (!this.bucketName || !process.env.NCP_ACCESS_KEY_ID) {
        return { success: false, message: 'Object Storage 설정 없음' };
      }

      // 버킷 존재 여부 확인
      try {
        await this.s3.headBucket({ Bucket: this.bucketName }).promise();
        console.log('버킷이 이미 존재합니다:', this.bucketName);
        return { success: true, exists: true };
      } catch (error) {
        if (error.statusCode === 404) {
          // 버킷이 없으면 생성
          console.log('버킷을 생성합니다:', this.bucketName);
          await this.s3.createBucket({ Bucket: this.bucketName }).promise();
          console.log('버킷 생성 완료:', this.bucketName);
          return { success: true, exists: false, created: true };
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('버킷 확인/생성 에러:', error);
      return { success: false, error: error.message };
    }
  }
}

export const objectStorageService = new ObjectStorageService();