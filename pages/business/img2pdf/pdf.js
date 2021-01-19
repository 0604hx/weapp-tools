const util = require("../../../utils/util")
const store = require(".././../../utils/store")

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
    toWork (){
        let { img } = this.data
        if(!img) return util.warn(`请先选择图片`)

        wx.getFileSystemManager().readFile({
            filePath: img,
            encoding:'base64',
            success: res=>{
                console.debug(`图片读取成功`, res.data.substr(0, 100))
                
                let ps = { imgData: res.data, action:"img2pdf" }
                //构建元数据
                let { title, subject, keywod, creator } = this.data
                ps.metadata = { title, subject, creator, keywod }

                this.setData({ working: true })
                getApp().callCloud("tools", ps, result=>{
                    console.debug(result)
                    this.setData({ working: false })
                })
            }
        })
    }
})