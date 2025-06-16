import { useDropzone } from "react-dropzone";
import { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Copy, Upload } from "./svg";
import { useImageStore } from "../store/useImageStore";
import { uploadService } from "../services/uploadService";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { Code } from "../../../components/ui/code";

// 上传逻辑
const uploadFile = async (
  file: File,
  addImage: (url: string) => void,
  setAns: React.Dispatch<React.SetStateAction<string[]>>
) => {
  // 创建一个真正会reject的Promise用于toast.promise
  const uploadPromise = new Promise<string>(async (resolve, reject) => {
    try {
      const result = await uploadService.uploadFile(file);

      if (result.success && result.url) {
        // 上传成功
        addImage(result.url);
        setAns((prevAns) => [...prevAns, result.url!]);
        uploadService.copyToClipboard(result.url);
        resolve(result.url);
      } else {
        // 上传失败，reject Promise
        reject(new Error(result.error || "上传失败"));
      }
    } catch (error) {
      reject(error);
    }
  });

  try {
    await toast.promise(uploadPromise, {
      pending: "🦄上传中...",
      success: "🦄上传成功",
      error: {
        render({ data }: { data: Error }) {
          return `🦄${data.message || "上传失败"}`;
        },
      },
    });
  } catch (error) {
    // toast.promise已经处理了错误显示
    console.error("上传失败:", error);
  }
};

const UploadPage = () => {
  const { addImage } = useImageStore();
  const [ans, setAns] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0], addImage, setAns);
      }
    },
    [addImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              onDrop([file]);
            }
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [onDrop]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`upload-zone h-40 border-2 border-dashed rounded-lg flex flex-col justify-center items-center p-6 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                : "border-muted-foreground/30 hover:border-primary hover:bg-accent/30"
            }`}
          >
            <Upload
              fontSize={64}
              className={`mb-4 ${
                isDragActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <input {...getInputProps()} />
            <p
              className={`text-sm select-none font-medium ${
                isDragActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {isDragActive
                ? "释放文件开始上传"
                : "拖拽图片到此处，或点击选择文件"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              支持 PNG、JPG、JPEG、GIF、WebP 格式
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 结果展示 */}
      {ans.length > 0 && (
        <div className="space-y-4">
          {ans.map((url, index) => (
            <Card
              key={index}
              className="monochrome-card transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={url}
                      alt={`图片缩略图 ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-md border shadow-sm"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                  <Code
                    variant="default"
                    className="code-block flex-1 text-xs break-all"
                  >
                    {url}
                  </Code>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          const success = await uploadService.copyToClipboard(
                            url
                          );
                          if (success) {
                            toast("🦄复制成功");
                          } else {
                            toast.error("🦄复制失败");
                          }
                        }}
                      >
                        <Copy fontSize={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>复制链接</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
