/**
 * 备份及还原工具
 */
const util = require("./util")
const configure = require("./configure")
const oss = require("./oss/oss")

wx.oss = oss

let BACKUP = "BACKUP"

let updateBackupTime = (id, server) => {
    let times = wx.getStorageSync(BACKUP) || {}
    if (!times[id]) times[id] = {}
    times[id][server] = util.getDateTime()

    wx.setStorage({
        data: times,
        key: BACKUP,
        success: () => console.debug(`备份历史更新成功...`)
    })
}

let onFail = res =>{
    util.error(res.errMsg? res.errMsg: res)
}

module.exports = {
    onDataChange(id, type = 0) {
        // 判断是否为定义好的数据对象
        let data = configure.dateBeans().find(d => d.id == id && d.type == type)

        // 判断用户是否开启自动备份
        if (!!data && configure.isEnable(data)) {
            console.debug(`用户已开启<${data.name}>自动备份，即将执行备份作业...`)

            this.doBackup(id, type)
        } else
            console.debug(`未找到配置项${id} 或者用户未开启自动备份...`)
    },
    /**
     * 为了不让开发环境跟实际环境数据混淆，在开发环境下备份目录加上了 -DEV 的标识
     * @param {*} id 
     * @param {*} type 
     */
    doBackup(id, type = 0) {
        let file = ""
        if (type == 0) {
            file = util.buildPath(`${id}.storage.txt`)
            //保存数据到本地
            wx.getFileSystemManager().writeFileSync(file, wx.getStorageSync(id), 'utf8')
        } else {
            file = util.buildPath(id.indexOf(util.JSON) > 0 ? id : `${id}${util.JSON}`)
        }
        let dir = "backup" + (getApp().globalData.isDev ? "-dev" : "")
        oss.Aliyun.upload(file, `${dir}/${util.filename(file)}`)
            .then(res => {
                console.debug(`OSS-ALI upload 成功....`, res)
                if (type == 0) {
                    wx.getFileSystemManager().unlinkSync(file)
                }
                //记录最新的备份日期
                updateBackupTime(id, "aliyun")
            })
            .catch(e => {
                console.error(`OSS-ALI upload 失败：`, e)
                util.error(`阿里云OSS备份失败: ${e.message}`)
            })
    },
    /**
     * 还原到本地数据，流程如下：
     * 1、下载远程文件到本地（保存名称为 restore-xxx.json）
     * 2、写入到本地或者 storage
     * 3、删除步骤一的文件
     * 
     * @param {*} bean 
     * @param {*} onOk 
     */
    restore(bean, onOk = () => {}) {
        //计算远程目录
        let dir = "backup" + (getApp().globalData.isDev ? "-dev" : "")
        let suffix = bean.type == 0? '.storage.txt' : util.JSON
        let file = `${dir}/${bean.id + suffix}`
        console.debug(`尝试还原远程文件 `, file)
        oss.Aliyun.buildUrl([file], 120).then(urls => {
            let url = urls[0]
            console.debug(`下载地址：`, url)

            wx.downloadFile({
                url,
                success: res => {
                    console.debug(`文件下载成功:`, res)
                    let filePath = res.tempFilePath
                    //判断是否为合法的格式
                    let index = filePath.lastIndexOf(".")
                    if (filePath.substr(index+1) != util.suffix(file)) {
                        return onFail(`文件格式有误，请确认OSS是否存在对应的备份文件‘${file}’`)
                    }

                    let success = _res=>{
                        console.debug(`数据还原成功：`, _res)
                        onOk()
                        //导入成功后删除本地文件
                        wx.getFileSystemManager().unlink({ 
                            filePath, 
                            fail: unlinkE=> console.debug(`临时文件删除失败`, unlinkE) 
                        })
                    }

                    if(bean.type == 0){
                        wx.getFileSystemManager().readFile({
                            filePath,
                            encoding: "UTF-8",
                            success: fileRes=>{
                                console.debug(`文件读取：`, fileRes.data)
                                // let jsonData = util.bufferToString(fileRes.data)
                                // if(jsonData[0] != "["){
                                //     return onFail(`备份文件内容有误（${jsonData[0]}不是合法的数据格式）`)
                                // }

                                wx.setStorage({ data: fileRes.data,  key: bean.id,  success, fail: onFail })
                            },
                            fail: onFail
                        })
                    }
                    // 对于文件型直接覆盖到用户文件下即可
                    else {
                        let destPath = util.buildPath(bean.id+util.JSON)
                        wx.getFileSystemManager().copyFile({ srcPath: filePath, destPath, success, fail: onFail })
                    }
                }
            })
        })
    }
}