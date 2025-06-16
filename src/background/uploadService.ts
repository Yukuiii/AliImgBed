/**
 * 后台上传服务 - 专门用于Service Worker环境
 */

// 上传结果接口
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  code?: number;
}

// 支持的图片格式
const SUPPORTED_FORMATS = ["png", "jpg", "jpeg", "gif", "webp"];

// 阿里图床上传接口
const UPLOAD_URL = "https://filebroker.aliexpress.com/x/upload";
const BIZ_CODE = "ae_profile_avatar_upload";

/**
 * 验证文件格式（通过文件名）
 */
export const validateFileFormat = (
  fileName: string
): { isValid: boolean; error?: string } => {
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
export const createFormData = (
  blob: Blob,
  fileName: string = "image.png"
): FormData => {
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("bizCode", BIZ_CODE);
  return formData;
};

/**
 * 从URL获取图片数据
 */
export const fetchImageFromUrl = async (
  url: string
): Promise<{ blob: Blob; fileName: string }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("获取图片失败");
  }

  const blob = await response.blob();

  // 尝试从URL中提取文件名
  const urlPath = new URL(url).pathname;
  const fileName = urlPath.split("/").pop() || "image.png";

  return { blob, fileName };
};

/**
 * 核心上传函数 - 适用于Service Worker
 */
export const uploadToAliImgBed = async (
  blob: Blob,
  fileName: string = "image.png"
): Promise<UploadResult> => {
  try {
    // 验证文件格式
    const formatCheck = validateFileFormat(fileName);
    if (!formatCheck.isValid) {
      const error = formatCheck.error || "文件格式不支持";
      return { success: false, error };
    }

    // 创建表单数据
    const formData = createFormData(blob, fileName);

    // 开始上传
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const result = await response.json();

    // 处理响应结果
    if (result.code === 0) {
      return {
        success: true,
        url: result.url,
        code: result.code,
      };
    } else if (result.code === 5) {
      const error = "cookie过期,请重新登录Aliexpress速卖通获取cookie";
      return {
        success: false,
        error,
        code: result.code,
      };
    } else {
      const error = result.message || "上传失败";
      return {
        success: false,
        error,
        code: result.code,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "上传过程中出错";
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * 从URL上传图片 - Service Worker专用
 */
export const uploadImageFromUrl = async (
  imageUrl: string
): Promise<UploadResult> => {
  try {
    // 获取图片数据
    const { blob, fileName } = await fetchImageFromUrl(imageUrl);

    // 上传图片
    return await uploadToAliImgBed(blob, fileName);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "获取图片失败";
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * 后台上传服务类
 */
export class BackgroundUploadService {
  /**
   * 上传Blob数据
   */
  static async uploadBlob(
    blob: Blob,
    fileName: string = "image.png"
  ): Promise<UploadResult> {
    return uploadToAliImgBed(blob, fileName);
  }

  /**
   * 从URL上传图片
   */
  static async uploadFromUrl(imageUrl: string): Promise<UploadResult> {
    return uploadImageFromUrl(imageUrl);
  }

  /**
   * 验证文件格式
   */
  static validateFile(fileName: string) {
    return validateFileFormat(fileName);
  }

  /**
   * 发送复制消息到content script
   */
  static async copyToClipboard(tabId: number, text: string): Promise<boolean> {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: "COPY_TO_CLIPBOARD",
        url: text,
      });

      return response && response.success === true;
    } catch (error) {
      console.error("发送复制消息失败:", error);
      return false;
    }
  }

  /**
   * 显示通知
   */
  static showNotification(
    title: string,
    message: string,
    _type: "success" | "error" = "success",
    autoClose: number = 1000
  ): void {
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "/icons/icon.png",
        title,
        message,
      },
      (createdId) => {
        if (autoClose > 0) {
          setTimeout(() => {
            if (createdId) {
              chrome.notifications.clear(createdId);
            }
          }, autoClose);
        }
      }
    );
  }
}

// 导出默认实例
export const backgroundUploadService = BackgroundUploadService;
