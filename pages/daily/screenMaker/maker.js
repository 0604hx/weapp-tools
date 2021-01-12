const util = require("../../../utils/util")
const app = getApp()

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
        model: 'iphone',                          //基准样式
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
    toCreate (){
        let ps = buildParams()
        util.copyTo(ps, this.data)
        console.debug(`参数：`, ps)

        this.setData({ working: true })
        app.callCloud(
            'screen-maker', 
            ps,
            imgData=>{
                this.setData({ working: false, hasImg: true, imgData })
            },
            e=> {
                console.debug(e)
                this.setData({ working: false })
            }
        )
    }
})