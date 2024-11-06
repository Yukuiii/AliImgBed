chrome.runtime.onMessage.addListener((message,_sender, sendResponse: (res: { success: boolean, error?: string }) => void) => {
    if (message.type === 'COPY_TO_CLIPBOARD') {
        try {
            navigator.clipboard.writeText(message.url).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                console.error(error);
                sendResponse({ success: false, error: error.message });
            });
            return true; 
        } catch (error) {
            sendResponse({ success: false, error: (error as Error).message });
        }
    }
    return false;
});