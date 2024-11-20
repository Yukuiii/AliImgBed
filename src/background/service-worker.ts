// 设置请求头
// const RULE_ID = 1;
// const HEADER_RULE = {
//     id: RULE_ID,
//     priority: 1,
//     action: {
//         type: "modifyHeaders",
//         requestHeaders: [
//             {
//                 header: "Origin",
//                 operation: "set",
//                 value: "https://www.aliexpress.com"
//             },
//             {
//                 header: "Referer",
//                 operation: "set",
//                 value: "https://filebroker.aliexpress.com/AliImgUpload"
//             },
//             {
//                 header: "Sec-Ch-Ua",
//                 operation: "set",
//                 value: '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"'
//             },
//             {
//                 header: "Sec-Ch-Ua-Mobile",
//                 operation: "set",
//                 value: "?0"
//             },
//             {
//                 header: "Sec-Ch-Ua-Platform",
//                 operation: "set",
//                 value: '"Windows"'
//             },
//             {
//                 header: "Sec-Fetch-Dest",
//                 operation: "set",
//                 value: "empty"
//             },
//             {
//                 header: "Sec-Fetch-Mode",
//                 operation: "set",
//                 value: "cors"
//             },
//             {
//                 header: "Sec-Fetch-Site",
//                 operation: "set",
//                 value: "same-origin"
//             }
//         ]
//     },
//     condition: {
//         urlFilter: "https://filebroker.aliexpress.com/*",
//         resourceTypes: ["xmlhttprequest"]
//     }
// } as chrome.declarativeNetRequest.Rule;

// async function setupHeaderRules() {
//     try {
//         await chrome.declarativeNetRequest.updateDynamicRules({
//             removeRuleIds: [RULE_ID],
//             addRules: [HEADER_RULE]
//         });
//         console.log('Header rules updated successfully');
//     } catch (error) {
//         console.error('Failed to update header rules:', error);
//     }
// }


// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "uploadImage",
        title: "上传图片到图床",
        contexts: ["image"]
    });
    console.log('右键菜单已创建');
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('菜单被点击', info);
    
    if (info.menuItemId === "uploadImage" && info.srcUrl && tab?.id) {
        try {
            // // 在上传前确保规则已设置
            // await setupHeaderRules();
            
            // 等待一小段时间确保规则生效
            // await new Promise(resolve => setTimeout(resolve, 100));
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['messageListener/messageListener.js']
            });

            // 获取图片数据
            const response = await fetch(info.srcUrl);
            if (!response.ok) throw new Error('获取图片失败');
            
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('file', blob, 'image.png');
            formData.append('bizCode','ae_profile_avatar_upload')
            // qq图床
            // const uploadResponse = await fetch('https://pic.2xb.cn/uppic.php?type=qq', {
            //     method: 'POST',
            //     body: formData,
            // });

            // const data = await uploadResponse.json();
            // if (data.code !== 200) {
            //     throw new Error(data.message);
            // }
            
            
            // 更改图片接口
            const uploadResponse = await fetch('https://filebroker.aliexpress.com/x/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await uploadResponse.json();
            if(data.code!=0){
                throw new Error("上传失败")
            }
            // 发送消息给 content script 处理复制
            const copyResponse = await chrome.tabs.sendMessage(tab.id, {
                type: 'COPY_TO_CLIPBOARD',
                url: data.url
            });
            // 等待复制操作完成的响应
            if (!copyResponse || copyResponse.success === false) {
                throw new Error('上传过程中请勿进行操作');
            }

            // 显示成功通知
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '/icons/icon.png',
                title: '上传成功',
                message: '图片已上传，链接已复制到剪贴板'
            }, (createdId) => {
                setTimeout(() => {
                    if (createdId) {
                        chrome.notifications.clear(createdId);
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('上传过程出错:', error);
            
            // 显示错误通知
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '/icons/icon.png',
                title: '上传失败',
                message: (error as Error).message || '图片上传失败，请重试'
            });
        }
    }
});

// 原有的点击扩展图标打开页面的代码
chrome.action.onClicked.addListener(function () {
    chrome.tabs.create({
        url: "https://filebroker.aliexpress.com/AliImgUpload"
    });
});