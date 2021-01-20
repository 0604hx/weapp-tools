const cloud = require('wx-server-sdk')

// 引入工具类
// const { imgToPDF } = require("./imgToPDF")

cloud.init()

const exitWithMsg = errMsg=> {
    return {
        errCode: -1,
        errMsg
    }
}

// 云函数入口函数
exports.main = async (ps, context) => {
    let { OPENID,CLIENTIP } = cloud.getWXContext()

    ps.createOn = new Date().getTime()
    ps.openId   = OPENID
    ps.ip       = CLIENTIP

    let result = undefined

    //判断文件是否存在
    let actionMethod = undefined
    try{
        if(ps.module){
            const _module = require(ps.module)
            actionMethod = _module[ps.action]
        }
    }catch(moduleE){
        console.error(`模块加载错误`, moduleE)
        return exitWithMsg(`模块${ps.module}加载失败`)
    }

    if(!!actionMethod){
        if(typeof(actionMethod) == 'function')
            result = await actionMethod(ps, cloud)
        else
            result = actionMethod
    }
    
    ps.doneOn = new Date().getTime()

    if(result != undefined){
        return result
    }

    return exitWithMsg(`无效的操作`)
}