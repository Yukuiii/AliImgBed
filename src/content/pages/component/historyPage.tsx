import { useImageStore } from "../store/useImageStore";
import { toast } from "react-toastify";
import { Remove, Copy } from "./svg";
import { uploadService } from "../services/uploadService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { Code } from "../../../components/ui/code";

const HistoryPage = () => {
  const { images, clearImages, removeImage } = useImageStore();

  return (
    <div className="space-y-6">
      <Card className="monochrome-card">
        <CardHeader className="border-b border-border/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              上传历史
            </CardTitle>
            <Button
              variant="outline"
              onClick={clearImages}
              disabled={images.length === 0}
              className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              清空历史
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无上传历史</p>
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((url, index) => (
                <Card
                  key={index}
                  className="monochrome-card transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={url}
                          alt={`图片缩略图 ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md border shadow-sm group-hover:shadow-md transition-shadow"
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-t from-black/10 to-transparent"></div>
                      </div>
                      <Code
                        variant="default"
                        className="code-block flex-1 text-xs break-all"
                      >
                        {url}
                      </Code>
                      <div className="flex space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={async () => {
                                const success =
                                  await uploadService.copyToClipboard(url);
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                removeImage(url);
                                toast("🦄删除成功");
                              }}
                            >
                              <Remove fontSize={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>删除记录</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
