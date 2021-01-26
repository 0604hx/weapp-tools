const util = require("../../../utils/util")

const app = getApp()

Page({
    data: {
        border: true,
        img:"",
        imgSize: 0,

        title:"",
        subject:"",
        creator:"",
        keywod:""
    },
    onLoad (){
        
    },
    toSelectImg (e){
        console.debug(e)
        wx.chooseImage({
            success: res=>{
                let f = res.tempFiles[0]
                let data = { img: f.path, imgSize: f.size}
                
                this.setData(data)
            }
        })
    },
    onFail (e, fileList){
        if(e){
            console.debug(`操作失败`, e)
            util.error(e.errMsg)
        }
        this.setData({ working: false })
        if(fileList && fileList.length)
            wx.cloud.deleteFile({ fileList , success: delRes=> console.debug(`文件删除成功`, delRes)})
    },
    toWork (){
        let { img } = this.data
        if(!img) return util.warn(`请先选择图片`)

        this.setData({ working: true })
        //由于微信限制了数据包大小（实测上限100Kb）
        app.initCloud()
        wx.cloud.uploadFile({
            filePath: img,
            cloudPath: `tools/pdf/${util.random(16, 2)}.${util.suffix(img)}`,
            success: res=>{
                console.debug(`文件上传成功`, res)
                let fileList = [res.fileID]

                let ps = { fileId: res.fileID, action:"imgToPDF", module:"pdf" }
                //构建元数据
                let { title, subject, keywod, creator } = this.data
                ps.metadata = { title, subject, creator, keywod }

                getApp().callCloud("tools", ps, result=>{
                    console.debug(result)
                    if(result.errCode==-1)  return this.onFail(result)

                    // fileList.push(result)    //无法删除云函数上传的文件

                    wx.cloud.downloadFile({
                        fileID: result,
                        success: res2=>{
                            console.debug(`文件下载成功：`, res2.tempFilePath)

                            this.onFail(undefined, fileList)
                            util.openFile(res2.tempFilePath, "pdf")
                            util.ok(`PDF已生成`)
                            this.setData({ img: "" })
                        },
                        fail: downloadE=>this.onFail(downloadE, fileList)
                    })
                }, apiE=>this.onFail(apiE, fileList))
            },
            fail: this.onFail
        })
    }
})