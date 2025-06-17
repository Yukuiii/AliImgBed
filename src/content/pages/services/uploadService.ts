/**
 * 上传服务 - 统一管理图片上传逻辑
 */

// 上传结果接口
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  code?: number;
}

// 上传配置接口
export interface UploadConfig {
  showToast?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

// 支持的图片格式
const SUPPORTED_FORMATS = ["png", "jpg", "jpeg", "gif", "webp"];

// 阿里图床上传接口
const UPLOAD_URL = "https://filebroker.aliexpress.com/x/upload";
const BIZ_CODE = "ae_profile_avatar_upload";

/**
 * 检查用户是否已登录（通过cookie检查）
 */
export const checkUserLogin = (): { isLoggedIn: boolean; error?: string } => {
  const cookies = document.cookie;
  const user = cookies
    .split("; ")
    .find((row) => row.startsWith("xman_us_t="))
    ?.split("=")[1];

  if (!user) {
    return {
      isLoggedIn: false,
      error: "请先登录Aliexpress速卖通获取cookie",
    };
  }

  return { isLoggedIn: true };
};

/**
 * 验证文件格式
 */
export const validateFileFormat = (
  file: File
): { isValid: boolean; error?: string } => {
  const fileName = file.name;
  const fileExt = fileName.split(".").pop()?.toLowerCase();

  if (!fileExt || !SUPPORTED_FORMATS.includes(fileExt)) {
    return {
      isValid: false,
      error: `只支持${SUPPORTED_FORMATS.join("、")}格式的图片`,
    };
  }

  return { isValid: true };
};

/**
 * 创建上传表单数据
 */
export const createFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bizCode", BIZ_CODE);
  return formData;
};

/**
 * 核心上传函数
 */
export const uploadToAliImgBed = async (
  file: File,
  config: UploadConfig = {}
): Promise<UploadResult> => {
  try {
    // 检查登录状态
    const loginCheck = checkUserLogin();
    if (!loginCheck.isLoggedIn) {
      const error = loginCheck.error || "用户未登录";
      config.onError?.(error);
      return { success: false, error };
    }

    // 验证文件格式
    const formatCheck = validateFileFormat(file);
    if (!formatCheck.isValid) {
      const error = formatCheck.error || "文件格式不支持";
      config.onError?.(error);
      return { success: false, error };
    }

    // 创建表单数据
    const formData = createFormData(file);

    // 开始上传
    config.onProgress?.(0);

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    config.onProgress?.(50);

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const result = await response.json();
    config.onProgress?.(100);

    // 处理响应结果
    if (result.code === 0) {
      config.onSuccess?.(result.url);
      return {
        success: true,
        url: result.url,
        code: result.code,
      };
    } else if (result.code === 5) {
      const error = "cookie过期,请重新登录Aliexpress速卖通获取cookie";
      config.onError?.(error);
      return {
        success: false,
        error,
        code: result.code,
      };
    } else {
      const error = result.message || "上传失败";
      config.onError?.(error);
      return {
        success: false,
        error,
        code: result.code,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "上传过程中出错";
    config.onError?.(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * 复制文本到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("文本已成功复制到剪贴板");
    return true;
  } catch (err) {
    console.error("复制文本时出错:", err);
    return false;
  }
};

/**
 * 上传服务主类
 */
export class UploadService {
  /**
   * 上传单个文件
   */
  static async uploadFile(
    file: File,
    config: UploadConfig = {}
  ): Promise<UploadResult> {
    return uploadToAliImgBed(file, config);
  }

  /**
   * 批量上传文件
   */
  static async uploadFiles(
    files: File[],
    config: UploadConfig = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileConfig = {
        ...config,
        onProgress: (progress: number) => {
          const totalProgress = (i * 100 + progress) / files.length;
          config.onProgress?.(totalProgress);
        },
      };

      const result = await this.uploadFile(file, fileConfig);
      results.push(result);

      // 如果上传失败且配置了错误处理，可以选择继续或停止
      if (!result.success && config.onError) {
        // 这里可以根据需要决定是否继续上传其他文件
      }
    }

    return results;
  }

  /**
   * 检查用户登录状态
   */
  static checkLogin() {
    return checkUserLogin();
  }

  /**
   * 验证文件
   */
  static validateFile(file: File) {
    return validateFileFormat(file);
  }

  /**
   * 复制到剪贴板
   */
  static async copyToClipboard(text: string) {
    return copyToClipboard(text);
  }
}

// 导出默认实例
export const uploadService = UploadService;
