const Head = () => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex justify-center items-center space-x-4">
        <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-primary-foreground">图</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          阿里图床
        </h1>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">简洁高效的图片上传工具</p>
        <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md border">
          接口来源网络，仅供学习交流使用
        </p>
      </div>
    </div>
  );
};

export default Head;
