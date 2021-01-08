const util = require("../../../utils/util")

// 来源：https://digitalfortress.tech/tricks/top-15-commonly-used-regex/
const regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
let isIp = ip=>{
    return regex.test(ip)
}
let noData = ip=>{
    return {country:"", province:"", city:"", isp:"", asn:"", ip}
}

let apis = {
    //纯真IP库接口未成功
    // cz88 : {    
    //     name:"纯真IP库",
    //     method: "POST",
    //     getUrl: ip=>{
    //         return `https://www.cz88.net/czapi/ip?ip=${ip}`
    //     },
    //     getHeader: ()=>{
    //         return {
    //             'token': 1389917694908,
    //         }
    //     },
    //     parse: (ip, res)=>{
    //         if(res.code && res.code==200){
    //             let d = res.data
    //             return {country:d.country_zh, province:d.province_cn, city: d.city_zh, isp:d.isp, ip}
    //         }
    //         util.warn(res.msg)
    //         return noData(ip)
    //     }
    // },
    huomao : {
        name:"火猫直播",
        method:"GET",
        getUrl: ip=>{
            return `https://ip.huomao.com/ip?ip=${ip}`
        },
        parse: (ip, res)=>{
            if(res.ip && res.ip == ip){
                return res
            }
            return noData(ip)
        }
    },
    'ip-sb': {
        name:"IP.SB Free API",
        getUrl :ip=>{
            return `https://api.ip.sb/geoip/${ip}`
        },
        parse: (ip, res)=>{
            if(res.ip && res.ip == ip){
                let d = res.data
                return {country:d.country, province:d.region, city: d.city, isp:d.isp, ip}
            }
            return noData(ip)
        }
    }
}

let query = (ip, api, onOk, onFail)=>{
    if(!ip) return util.warn(`请输入IP地址`)
    if(!isIp(ip))   return util.warn(`IP地址有误`)

    api = apis[api]
    if(!api)    return util.warn(`无效的查询方式`)

    let header = Object.assign({ 'content-type': 'application/json'}, api.getHeader ? api.getHeader():{})
    console.debug(`使用 ${api.name} 查询 IP ${ip}`, header)
    wx.request({
        url: api.getUrl(ip),
        method: api.method || "GET",
        header,
        success: res=>{
            console.debug(res)
            if(res.statusCode == 200)
                !onOk || onOk(api.parse(ip, res.data), JSON.stringify(res.data, null, 4))
            else
                util.warn(`网络请求失败`)
        }
    })
}

Page({
    data: {
        color: getApp().globalData.color,
        apis: Object.keys(apis).map(value=>{
            return { name: apis[value].name, value }
        }),
        ip:"",
        region: {},
        response: undefined,
        api:"huomao"
    },
    onSearch (e){
        if(e.type == 'search'){
            this.queryDo()
        }
    },
    queryDo (){
        let { ip, api } = this.data
        query(ip, api, (region, response)=>this.setData({ region, response }))
    },
    onApiChange (e){
        let api = e.detail.value
        this.setData({ api })
        if(!!this.data.ip)
            this.queryDo()
    }
})