import { Card, CardBody, Code, Button, Tooltip } from "@nextui-org/react";
import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Copy, Upload } from './svg';
import { useImageStore } from '../store/useImageStore';

// 上传逻辑
const uploadFile = async (file: File, addImage: (url: string) => void, setAns: React.Dispatch<React.SetStateAction<string[]>>) => {
    const cookies = document.cookie;
    const user = cookies.split("; ").find(row => row.startsWith("xman_us_t="))?.split("=")[1];
    if (!user) {
        toast.error("🦄请先登录Aliexpress速卖通获取cookie");
        return;
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    if (!['png', 'jpg', 'jpeg'].includes(fileExt || '')) {
        toast.error("🦄只支持png、jpg、jpeg格式的图片");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bizCode', "ae_profile_avatar_upload");

    try {
        const res = await toast.promise(
            fetch("https://filebroker.aliexpress.com/x/upload", {
                method: "POST",
                body: formData
            }),
            {
                pending: "🦄上传中...",
                success: "🦄上传成功",
                error: "🦄上传失败,请先登录Aliexpress速卖通获取cookie"
            }
        );
        const resJson = await res.json();
        if (resJson.code === 0) {
            addImage(resJson.url);
            setAns(prevAns => [...prevAns, resJson.url]);
            copyToClip(resJson.url);
        } else if (resJson.code === 5) {
            toast.error("🦄cookie过期,请重新登录Aliexpress速卖通获取cookie");
        }
    } catch (error) {
        console.error("上传过程中出错:", error);
    }
};

const UploadPage = () => {
    const { images, addImage } = useImageStore();
    const [ans, setAns] = useState<string[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            uploadFile(acceptedFiles[0], addImage, setAns);
        }
    }, [addImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.kind === 'file' && item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                            onDrop([file]);
                        }
                    }
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [onDrop]);

    return (
        <>
            <div className="w-full mt-2">
                <Card>
                    <CardBody>
                        <div
                            {...getRootProps()}
                            className="h-[160px] border-dashed border-1 flex flex-col justify-center items-center border-gray-400 p-6 text-center hover:border-cyan-500 hover:bg-gray-100 transition duration-500 ease-in-out"
                        >
                            <Upload fontSize={64} />
                            <input {...getInputProps()} />
                            <p className="select-none">
                                {isDragActive ? "拖动文件到这里，或粘贴图片或点击选择图片" : "拖动文件到这里，或粘贴图片或点击选择图片"}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 结果展示 */}
            {images.length > 0 && (
                <div className="mt-6">
                    {ans.map((url, index) => (
                        <Card key={index} className="mt-2 transition duration-500 ease-in-out">
                            <CardBody className="flex flex-row items-center">
                                <img src={url} alt={`图片缩略图 ${index + 1}`} className="w-16 h-16 object-cover mr-4" />
                                <Code color="primary" className="mr-4">
                                    {url}
                                </Code>
                                <Tooltip content="复制" closeDelay={0}>
                                    <Button
                                        className="mr-2"
                                        isIconOnly
                                        color="primary"
                                        variant="flat"
                                        onPress={() => {
                                            copyToClip(url);
                                            toast("🦄复制成功");
                                        }}
                                        size="sm"
                                    >
                                        <Copy fontSize={20} />
                                    </Button>
                                </Tooltip>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

const copyToClip = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log('文本已成功复制到剪贴板');
    }).catch(err => {
        console.error('复制文本时出错:', err);
    });
};

export default UploadPage;
