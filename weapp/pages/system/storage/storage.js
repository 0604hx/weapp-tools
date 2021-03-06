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

        fileMax: 200 * 1024 * 1024,

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
        let { filename, size}  = e.target.dataset
        let fileType = util.suffix(filename).toLowerCase()
        if(TEXTS.indexOf(fileType)>=0){
            if(size > 1024*1024){
                return util.error(`不支持预览超 1M 的文件`)
            }
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
    toDelete (e){
        let index = e.target.dataset.index
        let { fileList } = this.data
        let file = fileList[index]

        util.confirm(`删除文件`, file.filePath, ()=>{
            wx.getFileSystemManager().unlink({
                filePath: util.buildPath(file.filePath),
                success: ()=>{
                    util.ok(`删除成功`)
                    fileList.splice(index, 1)
                    this.setData({ fileList })
                }
            })
        })
    },
    onPullDownRefresh: function () {
        this.refresh()
    }
})