// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

let TABLE_ACCOUNT = "account"

// 云函数入口函数
exports.main = async (data, context) => {
    console.debug(`来自客户端的调用：`, data)
    let { action } = data
    let { OPENID,CLIENTIP } = cloud.getWXContext()

    let time = new Date().getTime()

    if(action === 'login'){
        delete data.action

        data.openId = OPENID
        data.ip     = CLIENTIP
        let query = {openId: OPENID}
        const counter = await db.collection(TABLE_ACCOUNT).where(query).count()
        let isNew = counter.total <= 0
        // 新注册用户
        if(isNew){
            data.createOn     = time
            data.count          = 0
        }else{
            data.count          = _.inc(1)
        }
        const dbResult = await (isNew ? db.collection(TABLE_ACCOUNT).add({ data }) : db.collection(TABLE_ACCOUNT).where(query).update({ data }) )
        console.debug(`更新数据`, query, dbResult)
        return Object.assign(query, {
            admin: false,           //是否为管理员，目前均为 false            
        })
    }
    else
        return { errCode: -1, errMsg:"无效的操作" }
}