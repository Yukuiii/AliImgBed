import { useImageStore } from '../store/useImageStore'
import { Button, Tooltip, Card, CardBody, Code } from '@nextui-org/react'
import { toast } from 'react-toastify'
import { Remove, Copy } from './svg'

const HistoryPage = () => {
    const { images, clearImages, removeImage } = useImageStore()

    return (
        <div>
            <Card>
                <CardBody>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">上传历史</h1>
                        <Button
                            color="danger"
                            variant="flat"
                            onPress={clearImages}
                        >
                            清空历史
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {/* {images.map((url, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={url}
                                        alt={`历史图片 ${index + 1}`}
                                        className="w-16 h-16 object-cover"
                                    />
                                    <Code color="primary" className="mr-4">
                                        <span className="ml-4">{url}</span>
                                    </Code>
                                </div>
                                <Tooltip content="删除" closeDelay={0}>
                                    <Button
                                        isIconOnly
                                        color="danger"
                                        variant="flat"
                                        size="sm"
                                        onPress={() => {
                                            removeImage(url)
                                            toast("🦄删除成功")
                                        }}
                                    >
                                        <Remove fontSize={20} />
                                    </Button>
                                </Tooltip>
                            </div>
                        ))} */}
                        {images.map((url, index) => (
                            <Card key={index} className="mt-2 hover:shadow-lg transition duration-500 ease-in-out w-[70%]">
                                <CardBody className="flex flex-row items-center">
                                    <img src={url} alt={`图片缩略图 ${index + 1}`} className="w-16 h-16 object-cover mr-4" />
                                    <Code color="primary" className="mr-4">
                                        {url}
                                    </Code>
                                    <Tooltip content="复制" closeDelay={0} >
                                        <Button
                                            className="mr-2"
                                            isIconOnly
                                            color="primary"
                                            variant="flat"
                                            onPress={() => {
                                                copyToClip(url)
                                                toast("🦄复制成功")
                                            }}
                                            size="sm"
                                        >
                                            <Copy fontSize={20} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="删除" closeDelay={0}>
                                        <Button
                                            isIconOnly
                                            color="danger"
                                            variant="flat"
                                            size="sm"
                                            onPress={() => {
                                                removeImage(url)
                                                toast("🦄删除成功")
                                            }}
                                        >
                                            <Remove fontSize={20} />
                                        </Button>
                                    </Tooltip>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

const copyToClip = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log('文本已成功复制到剪贴板');
    }).catch(err => {
        console.error('复制文本时出错:', err);
    });
};


export default HistoryPage;