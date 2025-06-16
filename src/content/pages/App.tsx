import Head from "./component/head";
import UploadPage from "./component/uploadPage";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { TooltipProvider } from "../../components/ui/tooltip";
import HistoryPage from "./component/historyPage";

const App = () => {
  return (
    <TooltipProvider>
      <div className="w-full h-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Head />
          <Tabs defaultValue="upload" className="w-full max-w-4xl mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="upload"
                className="flex items-center space-x-2"
              >
                <span>上传图片</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center space-x-2"
              >
                <span>历史记录</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
              <UploadPage />
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <HistoryPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        limit={1}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        closeButton={false}
        transition={Zoom}
      />
    </TooltipProvider>
  );
};

export default App;
