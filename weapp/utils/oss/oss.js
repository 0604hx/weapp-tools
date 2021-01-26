/**
 * 对象存储服务（Object Storage Service，OSS）是一种海量、安全、低成本、高可靠的云存储服务，适合存放任意类型的文件。容量和处理能力弹性扩展，多种存储类型供选择，全面优化存储成本。
 * 集成阿里云OSS、七牛云OSS（未完成）
 * 
 * 注意：
 * 1、本工具默认使用 Promise 对象
 * 2、目前 ali-oss 库还不支持微信小程序，故此处使用的是官方推荐的直传模式
 */
const Base64 = require('../plugins/tool/Base64')
require('../plugins/tool/hmac.js')
require('../plugins/tool/sha1.js')
const Crypto = require('../plugins/tool/crypto.js')

let SETTING_PAGE = "pages/system/setting/setting"

/**
 * 
 * @param {*} names 需要加载的配置项
 * @param {*} onOk   回调函数
 * @param {*} modal  配置项缺失时是否弹出前往配置页面的对话框
 * @param {*} prefix   配置项前缀，默认为空
 */
let withSetting = (names, onOk, modal = false, prefix = "") => {
    let {
        config
    } = getApp().globalData
    let fields = names.map(n => config[`${prefix}${n}`])
    //检查为空
    let fieldSize = fields.filter(f => !!f).length
    if (fieldSize == fields.length) {
        onOk(...fields)
    } else if (modal) {
        wx.showModal({
            title: '未配置OSS',
            content: '请先到设置页面填写对象存储服务（Object Storage Service，OSS）相关参数才可使用该功能',
            confirmText: "前往设置",
            cancelText: "下次再说",
            confirmColor: "red",
            success: res => {
                if (res.confirm) {
                    let pages = getCurrentPages()
                    if (pages[pages.length - 1].route != SETTING_PAGE)
                        this.jumpTo(SETTING_PAGE)
                }
            }
        })
    } else
        console.debug(`[OSS] 配置项缺失，需要 ${names} 只找到 ${fieldSize} 个有效值...`)
}

/**
 * 阿里云 OSS 模块
 */
let Aliyun = {
    keys: ["OSS_ALI_ID", 'OSS_ALI_SECRET', 'OSS_ALI_REGION'],

    config: {
        host: `https://weapp-tools.oss-cn-#region#.aliyuncs.com`,
        agent: "aliyun-sdk-js/6.9.0 Chrome 87.0.4280.67 on OS X 10.14.2 64-bit",
        timeout: 87600,                     // 文件失效时间
        region: "oss-cn-#region#",
        bucket: "weapp-tools",
        maxSize: 10 * 1024 * 1024       // 设置上传文件的大小限制（此处使用10M）
    },
    /**
     * 构建相关策略
     */
    getPolicy() {
        let date = new Date();
        date.setHours(date.getHours() + this.config.timeout);
        let expire = date.toISOString();
        const policy = {
            "expiration": expire, // 设置该Policy的失效时间
            "conditions": [
                ["content-length-range", 0,  this.config.maxSize] 
            ]
        }

        return Base64.encode(JSON.stringify(policy));
    },
    // 用密钥对数据进行加密
    getSignature(policyBase64, secretKey) {
        const bytes = Crypto.HMAC(
            Crypto.SHA1, policyBase64,
            secretKey, {
                asBytes: true
            }
        )
        return Crypto.util.bytesToBase64(bytes)
    },

    upload(filePath, targetPath, silent=true) {
        return new Promise((resolve, reject) => {
            withSetting(
                this.keys, 
                (accessKeyId, accessKeySecret, region) => {
                    let policy = this.getPolicy()
                    console.debug(`[OSS Aliyun] 保存到 ${targetPath} policy=${policy}`)
                    wx.uploadFile({
                        url:    this.config.host.replace("#region#", region),
                        filePath,
                        name: 'file',
                        formData: {
                            'key':  targetPath, // 服务利用key找到文件
                            'policy': policy,
                            'OSSAccessKeyId': accessKeyId,
                            'signature': this.getSignature(policy, accessKeySecret),
                            'success_action_status': '200',
                        },
                        success: function (res) {
                            if (res.statusCode != 200) {
                                res.message = /<Message>(.+)<\/Message>/.exec(res.data)[1]
                                reject(res)
                                return
                            }
                            resolve({name: targetPath, server:"aliyun"}, res)
                        },
                        fail: err=> {
                            err.wxaddinfo = this.config.host
                            err.message = "微信接口 uploadFile 调用失败"
                            reject(err)
                        }
                    })
                }, 
                !silent
            )
        })
    },
    buildUrl(names) {
        return new Promise((resolve, reject) => {
            withSetting(this.keys, (idKey, secretKey) => {
                let urls = names.map(n => `http://oss-cn-shenzhen.aliyuncs.com/${n}`)
                resolve(urls)
            })
        })
    },
    /**
     *  * 加密字符串：
    * DELETE

        image/jpeg
        Sun, 29 Nov 2020 04:26:00 GMT
        x-oss-date:Sun, 29 Nov 2020 04:26:00 GMT
        x-oss-user-agent:aliyun-sdk-js/6.9.0 Chrome 87.0.4280.67 on OS X 10.14.2 64-bit
        /weapp-tools/A32.jpg
    * 
    * OSS 调用成功返回内容：
    *  { errMsg:"request:0k", statusCode:204}
    * 失败返回：
    * 
     * @param {*} name 
     */
    delete (name){
        return new Promise((resolve, reject)=>{
            withSetting(this.keys, (idKey, secretKey)=> {

            })
        })
    }
}

module.exports = {
    Aliyun
}