/**
 * 对象存储服务（Object Storage Service，OSS）是一种海量、安全、低成本、高可靠的云存储服务，适合存放任意类型的文件。容量和处理能力弹性扩展，多种存储类型供选择，全面优化存储成本。
 * 集成阿里云OSS、七牛云OSS（未完成）
 * 
 * 本工具默认使用 Promise 对象
 */

let SETTING_PAGE = "pages/system/setting/setting"

let withSetting = (names, onOk, prefix="")=>{
    let { config } = getApp().globalData
    let fields = names.map(n=> config[`${prefix}${n}`])
    //检查为空
    if(fields.filter(f=> !!f).length != fields.length){
        onOk(...fields)
    }else{
        wx.showModal({
            title: '未配置OSS', 
            content: '请先到设置页面填写对象存储服务（Object Storage Service，OSS）相关参数才可使用该功能', 
            confirmText: "前往设置",
            cancelText: "下次再说",
            confirmColor: "red",
            success: res=>{
                if(res.confirm){
                    let pages = getCurrentPages()
                    if(pages[pages.length - 1].route != SETTING_PAGE)
                     this.jumpTo(SETTING_PAGE)
                }
            }
         })
    }
}

let Aliyun = {
    keys: ["OSS_ALI_ID",'OSS_ALI_SECRET'],
    upload (filePath, targetPath){
        return new Promise((resolve, reject)=>{
            withSetting(this.keys, (idKey, secretKey)=>{
                
            })
        })
    },
    buildUrl (names){
        return new Promise((resolve, reject)=>{
            withSetting(this.keys, (idKey, secretKey)=>{
                let urls = names.map(n=>`http://oss-cn-shenzhen.aliyuncs.com/${n}`)
                resolve(urls)
            })
        })
    }
}

module.exports = {

}