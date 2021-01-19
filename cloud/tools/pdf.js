/**
 * 如何生成字体文件
 * 1、安装 https://zhuanlan.zhihu.com/p/52903224 教程生成包含字体的 JS 文件
 * 2、将上述文件中的 base64 文本复制到 txt 即可
 * 
 * @param {*} pdfDoc 
 */
async function _downloadAndAddFont(pdfDoc){
    return new Promise(ok=>{
        let fontFile = 'MicrosoftYaHei.txt'
        let _fontExist = ()=>fs.existsSync(fontFile) && fs.statSync(fontFile).size > 1*1024*1024

        let _addFont = _ok=>{
            if(_fontExist()){
                console.debug(`[字体] 检测到字体文件，现在载入...`)
                let context = fs.readFileSync(fontFile,'utf-8')
                let font = fontFile.replace(".txt", "")
                pdfDoc.addFileToVFS('MicrosoftYaHei.ttf', context);
                pdfDoc.addFont('MicrosoftYaHei.ttf', font, 'normal');
                pdfDoc.setFont(font)
            }
            _ok()
        }

        if(_fontExist()){
            _addFont(ok)
        }
        else{
            let _file = fs.createWriteStream(fontFile)
            let url = `https://nerve-images.oss-cn-shenzhen.aliyuncs.com/public/raw/MicrosoftYaHei-jsPDF.txt`
            console.debug(`[字体] 检测到字体文件 ${fontFile} 不存在，现在从远程下载...`)
            require("request")({url, proxy: 'http://172.1.1.1:6565'}).pipe(_file).on('close', err=>{
                console.debug(`[字体] 字体文件 ${fontFile} 下载：`, !err? "成功": err)
                if(!err){
                    _addFont(ok)
                }
            })
        }
    })
}

/**
 * 
 * @param {*} ps > imgData      base64 格式的图片数据
 *                 metadata     元数据对象（title、subject、author、keywords、creator、producer）
 *                 orientation  页面方向，默认为纵向p，可选为横向 l
 */
async function imgToPDF(ps){
    if(!ps.imgData) throw new Error(`图片数据不能为空`)

    ps.metadata = Object.assign(
        {
            title: '图片转PDF工具-weapp-tools',
            subject: '工具源码地址：https://github.com/0604hx/weapp-tools',
            author: '0604hx',
            keywords: '0604hx,集成显卡',
            creator: 'weapp-tools',
            // producer: "PDF 创建者"
        },
        ps.metadata||{}
    )
    console.debug(`图片转PDF作业开始，元数据：`, ps.metadata)
    const doc = new jsPDF({ compress: true, orientation: ps.orientation||"portrait" });
    console.debug(`创建 PDF 文档...`)

    await _downloadAndAddFont(doc)
    let imgData = doc.getImageProperties(ps.imgData)
    console.debug(`图片参数：width=${imgData.width} height=${imgData.height}`, imgData.alias, imgData.palette, imgData.predictor)
    
    let widthRatio = doc.internal.pageSize.width / imgData.width
    let heightRatio = doc.internal.pageSize.height / imgData.height
    let ratio = Math.min(widthRatio, heightRatio)

    doc.addImage(ps.imgData, "png", 0, 0, imgData.width * ratio, imgData.height * ratio)
    console.debug(`图片插入成功，即将保存PDF...`)

    doc.save(`img2pdf-${new Date().getTime()}.pdf`)
}

module.exports = {
    imgToPDF
}