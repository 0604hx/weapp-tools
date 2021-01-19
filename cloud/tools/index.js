const cloud = require('wx-server-sdk')

// 引入工具类
const { imgToPDF } = require("./pdf")

cloud.init()

// 云函数入口函数
exports.main = async (ps, context) => {
    let { OPENID,CLIENTIP } = cloud.getWXContext()

    ps.createOn = new Date().getTime()
    ps.openId   = OPENID
    ps.ip       = CLIENTIP

    let result = undefined

    if(ps.action == 'img2PDF'){
        result = await imgToPDF(ps)
    }

    ps.doneOn = new Date().getTime()

    if(result != undefined){
        return result
    }

    return {
        errCode: -1,
        errMsg:"无效的操作"
    }
}