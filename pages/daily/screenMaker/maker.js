const util = require("../../../utils/util")
const app = getApp()

const FORMAT = "png"

let buildUUID = ps=>{
    let uuid = ""
    if(ps.action == 'wechat-pay'){
        return `1000107301${ps.date.split(" ")[0].replace(/-/g,"")}${util.random(14)}`
    }

    return uuid
}

let buildTime = ()=>util.getTime().substr(0, 5)

let buildParams = (action='wechat-pay')=>{
    return {
        action,
        model: 'iphone',                         //基准样式
        target:'扫二维码付款-给',                 //收款方信息，如：扫二维码付款-给
        money:'-100.00',                         //支付金额
        time: buildTime(),                       //手机屏幕上方的时间（只显示时+分）
        wifi: true,                              //是否显示 wifi 图标
        network: "4G",                           //网络字样，苹果下 wifi 与 network 不共存
        battery: 100,                            //电池电量百分比
        summary:"二维码收款",                     //收款信息
        date: util.getDateTime(),                //支付日期
        pay:"零钱",                              //支付方式
        uuid:"",                                 //支付单号
        status:"支付成功",
        format: FORMAT,                          //文件格式，默认为 png，可选为 jpg、pdf
        resultType:"base64"                      //返回值，可选：空（返回 Buffer）、base64、cloud（返回云存储的文件ID）
    }
}

Page({
    data: {
        color: app.globalData.color,
        border: true,
        working: false,
        hasImg: false,
        imgData: ""
    },
    onLoad (e){
        let data = buildParams()
        data.uuid = buildUUID(data)
        console.debug(`默认参数`, data)
        this.setData( data )
    },
    onWifi (e){
        this.setData({ wifi: e.detail })
    },
    refreshUUID (){
        let { date } = this.data
        if(!date)   return util.warn(`请输入付款时间`)

        this.setData({ uuid: buildUUID(this.data) })
    },
    toView (){
        let { filePath } = this.data
        if(!!filePath)
            util.openFile(filePath, FORMAT)
    },
    toCreate (){
        let ps = buildParams()
        util.copyTo(ps, this.data)
        console.debug(`参数：`, ps)

        this.setData({ working: true })
        app.callCloud(
            'screen-maker', 
            ps,
            imgData=>{
                let filePath = util.buildPath(`${ps.action}-${ps.model}.png`)
                let isString = typeof(imgData) == 'string'
                let data = { working: false, filePath }
                if(isString){
                    data.hasImg = true
                    data.imgData = imgData
                }
                this.setData(data)

                if(app.globalData.isDev){
                    console.debug(`本地模式下，发现有无法保存图片文件的bug，故跳过...`)
                    return
                }

                //保存到本地
                wx.getFileSystemManager().writeFile({
                    filePath,
                    data: isString? wx.base64ToArrayBuffer(imgData.slice(22)) : imgData,
                    encoding: 'binary',
                    success: res=>{
                        this.toView()
                        setTimeout(()=> util.ok(`图片已生成`), 1000)
                    },
                    fail: fileE=> {
                        console.error(fileE)
                        util.error(fileE.errMsg)
                    }
                })
            },
            e=> {
                console.debug(e)
                this.setData({ working: false })
            }
        )
    }
})