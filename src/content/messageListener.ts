/**
 * 健壮的剪贴板复制函数
 * 包含焦点获取和降级机制
 */
async function copyToClipboardRobust(text: string): Promise<void> {
  // 尝试获取焦点
  try {
    window.focus();
    if (document.body) {
      document.body.focus();
    }
    // 给一点时间让焦点生效
    await new Promise((resolve) => setTimeout(resolve, 10));
  } catch (e) {
    // 忽略焦点错误，继续尝试复制
    console.warn("获取焦点失败:", e);
  }

  // 首先尝试现代剪贴板API
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch (clipboardError) {
    console.warn("现代剪贴板API失败，尝试降级方案:", clipboardError);

    // 降级到传统方法
    return fallbackCopyToClipboard(text);
  }
}

/**
 * 传统的剪贴板复制降级方案
 */
function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        resolve();
      } else {
        reject(new Error("传统复制方法失败"));
      }
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

chrome.runtime.onMessage.addListener(
  (
    message,
    _sender,
    sendResponse: (res: { success: boolean; error?: string }) => void
  ) => {
    if (message.type === "COPY_TO_CLIPBOARD") {
      copyToClipboardRobust(message.url)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("复制到剪贴板失败:", error);
          sendResponse({ success: false, error: error.message || "复制失败" });
        });
      return true;
    }
    return false;
  }
);
