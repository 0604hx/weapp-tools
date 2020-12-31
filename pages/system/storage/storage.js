const store = require("../../../utils/store")
const util = require("../../../utils/util")
const app = getApp()

let TEXTS = ["txt", "json", "java", "js"]


Page({
    data: {
        color: app.globalData.color,
        
        storage:{},
        keySize:0,
        fileList:{},
        filesize:0,         //文件总大小

        fileMax: 190 * 1024 * 1024,

        //预览纯文本文件
        textShow: false,
        filename:"",
        fileContent:"",
        fileLoaded: false
    },
    refresh (){
        store.storageInfo(storage=> {
            let keySize = storage.keys.length
            this.setData({ storage, keySize })
        })
        store.fileList(fileList=>{
            let filesize = 0
            fileList.forEach(f=> {
                filesize+= f.size
                f.createTime = util.formatTimestamp(f.createTime)
            })
            this.setData({fileList, filesize})

            wx.stopPullDownRefresh()
        }, true)
    },
    onLoad: function () {
        this.refresh()
    },
    openFile (e){
        let filename = e.target.dataset.name
        let fileType = util.suffix(filename).toLowerCase()
        if(TEXTS.indexOf(fileType)>=0){
            this.openTextFile(filename)
        }
        else
            util.openFile(`${wx.env.USER_DATA_PATH}/${filename}`, fileType)
    },
    openTextFile (filename){
        let { textShow } = this.data
        if(textShow == true)    return this.setData({ textShow: false })

        textShow = true
        this.setData({ filename, textShow, fileLoaded: false })
        //加载文件
        wx.getFileSystemManager().readFile({
            filePath: `${wx.env.USER_DATA_PATH}/${filename}`,
            encoding:"utf8",
            success: d=>{
                this.setData({fileContent: d.data, fileLoaded: true})
            }
        })
    },
    onPullDownRefresh: function () {
        this.refresh()
    }
})