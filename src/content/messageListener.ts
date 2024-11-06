chrome.runtime.onMessage.addListener((message,_sender, sendResponse: (res: { success: boolean, error?: string }) => void) => {
    if (message.type === 'COPY_TO_CLIPBOARD') {
        try {
            // 复制到剪贴板的代码
            navigator.clipboard.writeText(message.url).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                console.error(error);
                sendResponse({ success: false, error: error.message });
            });
            return true; // 表明我们会异步发送响应
        } catch (error) {
            sendResponse({ success: false, error: (error as Error).message });
        }
    }
    return false;
});