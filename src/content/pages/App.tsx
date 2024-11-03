import Head from "./component/head";
import UploadPage from "./component/uploadPage";
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tabs, Tab } from "@nextui-org/react";  
import HistoryPage from "./component/historyPage";




const App = () => {
  return (
    <>
      <div className="w-full h-full">
        <div className="mx-auto px-4 flex flex-col items-center justify-center">
          <Head />
          <Tabs className="mt-2" color="primary" variant="bordered">
            <Tab className="w-[60%]" key="upload" title={
              <div className="flex items-center space-x-2">
                <span>上传图片</span>
              </div>
            }>
              <UploadPage />
            </Tab>
            <Tab className="w-full" key="history" title={
              <div className="flex items-center space-x-2">
                <span>历史记录</span>
              </div>
            }>
              <HistoryPage />
            </Tab>
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
    </>
  )
}

export default App
