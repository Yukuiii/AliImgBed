import { backgroundUploadService } from "./uploadService";

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "uploadImage",
    title: "上传图片到图床",
    contexts: ["image"],
  });
  console.log("右键菜单已创建");
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("菜单被点击", info);

  if (info.menuItemId === "uploadImage" && info.srcUrl && tab?.id) {
    try {
      // 确保messageListener已注入
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["messageListener/messageListener.js"],
      });

      // 使用上传服务上传图片
      const uploadResult = await backgroundUploadService.uploadFromUrl(
        info.srcUrl
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "上传失败");
      }

      // 复制链接到剪贴板
      const copySuccess = await backgroundUploadService.copyToClipboard(
        tab.id,
        uploadResult.url!
      );

      if (!copySuccess) {
        throw new Error("上传过程中请勿进行操作");
      }

      // 显示成功通知
      backgroundUploadService.showNotification(
        "上传成功",
        "图片已上传，链接已复制到剪贴板",
        "success",
        1000
      );
    } catch (error) {
      console.error("上传过程出错:", error);

      // 显示错误通知
      backgroundUploadService.showNotification(
        "上传失败",
        (error as Error).message || "图片上传失败，请重试",
        "error",
        0 // 不自动关闭错误通知
      );
    }
  }
});

// 原有的点击扩展图标打开页面的代码
chrome.action.onClicked.addListener(function () {
  chrome.tabs.create({
    url: "https://filebroker.aliexpress.com/AliImgUpload",
  });
});
