const util = require("./util")
const backup = require("./backup")

// 方便调试，将 backup 赋值到 wx 对象下
// wx.backup = backup

/**
 * 默认执行错误时弹出对话框提示
 * @param {*} e 
 */
let defFailAct = e=>{
    console.debug("执行读取数据出错",  e)
    // util.confirm("执行失败", e?(e.errMsg? e.errMsg: e):"操作执行失败，请检查后重试或联系管理员")
}

/**
 * 构建本地文件名
 * @param {*} name 
 */
let buildFilePath = name=>{
    return util.buildPath(`${util.buildUrlKey(name)}.json`)
}

module.exports = {
    /**
     * 将数据保存到 storage
     * @param {*} key       若为空则自动根据当前页计算，命名方式为：{当前页名称}.{key}
     * @param {*} data      待保存的数据
     * @param {*} onOk      
     * @param {*} onFail 
     */
    toStorage (key, data, onOk, onFail=defFailAct){
        key = !!key? key: util.buildUrlKey(key)
        console.debug(`保存到 Storage, key=`, key)
        wx.setStorage({ 
            data, 
            key, 
            success: res=>{
                !onOk || onOk(res)
                //触发自动备份
                backup.onDataChange(key, 0)
            }, 
            fail: onFail 
        })
    },
    /**
     * 从 storage 加载数据
     * @param {*} key 
     * @param {*} onOk  注意：若storage不存在，不执行该方法
     */
    fromStorage (key, onOk){
        key = !!key? key: util.buildUrlKey(key)
        wx.getStorage({key, success:res=> !onOk || onOk(res.data)})
    },
    /**
     * 获取当前存储信息，返回结果为：
     *  keys	    Array.<string>	当前 storage 中所有的 key
        currentSize	number	        当前占用的空间大小, 单位 KB
        limitSize	number	        限制的空间大小，单位 KB
     * @param {*} onOk 
     */
    storageInfo (onOk){
        wx.getStorageInfo({
          success: d => !onOk || onOk(d),
        })
    },
    /**
     * 将数据写入到文件（将转换为 JSON 格式）
     * @param {*} name      如果传递的文件名以 .json 结尾则自动删除该字样作为 key
     * @param {*} data 
     * @param {*} onOk 
     * @param {*} onFail 
     */
    toFile (name, data, onOk, onFail=defFailAct){
        let key = !!name? name: util.buildUrlKey(name)
        if(key.endsWith(util.JSON)) key = key.substr(0, key.length - 5)

        let filePath = util.buildPath(key+util.JSON)
        console.debug(`保存到文件，name=`, filePath,"key=", key)
        wx.getFileSystemManager().writeFile({
            filePath,
            data: JSON.stringify(data),
            success: d=>{
                console.debug(`文件写入成功`, d)
                !onOk || onOk(d)
                //触发自动备份
                backup.onDataChange(key, 1)
            },
            fail: onFail
        })
    },
    /**
     * 从文件中读取内容
     * @param {*} name      默认会以当前url
     * @param {*} onOk 
     * @param {*} onFail 
     */
    fromFile (name, onOk, onFail=defFailAct){
        let filePath = !!name? util.buildPath(name): buildFilePath(name)
        wx.getFileSystemManager().readFile({
            filePath,
            encoding:"utf8",
            success: res=>{
                !onOk || onOk(JSON.parse(res.data))
            },
            fail: onFail
        })
    },
    /**
     * 获取当前已保存的文件列表
     * 返回结果为 FileList 数组，元素结构如下：
     *  filePath	string	文件路径 (本地路径)
        size	    number	本地文件大小，以字节为单位
        createTime	number	文件保存时的时间戳，从1970/01/01 08:00:00 到当前时间的秒数
     * @param {*} onOk 
     * @param {*} force 当 getSavedFileList 无数据时是否使用 readdir 遍历用户文件
     */
    fileList (onOk, force=false){
        let fs = wx.getFileSystemManager()
        fs.getSavedFileList({
            success: d=> {
                let files = d.fileList
                if(files.length == 0 && force===true){
                    console.debug(`通过 wx.getFileSystemManager().getSavedFileList 接口获取到数据为空，即将使用 readdir 遍历用户文件...`)
                    //尝试通过 readdir 方法获取，此时返回的 createTime 为最后修改时间
                    fs.readdir({
                        dirPath: wx.env.USER_DATA_PATH,
                        success: readD=>{
                            let fileInfos = readD.files.filter(f=>f!="miniprogramLog").map(f=>{
                                let stat = fs.statSync(`${wx.env.USER_DATA_PATH}/${f}`)
                                return {
                                    filePath    : f,
                                    size        : stat.size,
                                    createTime  : stat.lastModifiedTime
                                }
                            })
                            !onOk || onOk(fileInfos)
                        }
                    })
                }
                else
                    !onOk || onOk(files)
            }
        })
    }
}