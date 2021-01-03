/**
 * 备份及还原工具
 */
const util = require("./util")
const configure = require("./configure")
const oss = require("./oss/oss")

let BACKUP = "BACKUP"

let updateBackupTime =  (id, server)=> {
    let times = wx.getStorageSync(BACKUP) || {}
    if(!times[id])  times[id] = {}
    times[id][server] = util.getDateTime()

    wx.setStorage({ data: times, key: BACKUP , success: ()=> console.debug(`备份历史更新成功...`)})
}

module.exports = {
    onDataChange (id, type=0){
        // 判断是否为定义好的数据对象
        let data = configure.dateBeans().find(d=> d.id==id && d.type == type)

        // 判断用户是否开启自动备份
        if(!!data && configure.isEnable(data)){
            console.debug(`用户已开启<${data.name}>自动备份，即将执行备份作业...`)

            this.doBackup(id, type)
        }
    },
    /**
     * 为了不让开发环境跟实际环境数据混淆，在开发环境下备份目录加上了 -DEV 的标识
     * @param {*} id 
     * @param {*} type 
     */
    doBackup (id, type=0){
        let file = ""
        if(type == 0){
            file = util.buildPath(`${id}.storage.txt`)
            //保存数据到本地
            wx.getFileSystemManager().writeFileSync(file, wx.getStorageSync(id), 'utf8')
        }else{
            file = id
        }
        let dir = "backup"+(getApp().globalData.isDev? "-dev":"")
        oss.Aliyun.upload(file, `${dir}/${util.filename(file)}`)
            .then(res=>{
                console.debug(`OSS-ALI upload 成功....`, res)
                if(type == 0){
                    wx.getFileSystemManager().unlinkSync(file)
                }
                //记录最新的备份日期
                updateBackupTime(id, "aliyun")
            })
            .catch(e=> {
                console.error(`OSS-ALI upload 失败：`, e)
                util.error(`阿里云OSS备份失败: ${e.message}`)
            })
    }
}