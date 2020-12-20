// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

let TABLE = "issue"
let PAGE_SIZE = 50

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const formatDateOrTime = (date, type = 0) => {
    if(typeof(date) == 'number')
        date = new Date(date)
    
    if (type == 0) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return [year, month, day].map(formatNumber).join('-')
    } else {
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return [hour, minute, second].map(formatNumber).join(':')
    }
}

const getDateTime = (date = new Date())=>{
    return formatDateOrTime(date) + " " + formatDateOrTime(date, 1)
}

// 云函数入口函数
exports.main = async (event, context) => {
    let { action } = event
    let { OPENID, APPID } = cloud.getWXContext()

    //录入新意见
    if(action === "save"){
        let { title, detail } = event
        console.log("录入新反馈：", title, detail)
        
        //内容安全检查
        try{
            const msgCheckRe = await cloud.openapi.security.msgSecCheck({
                content: title+detail
            })
            console.debug("内容检测结果：", msgCheckRe)
            if(msgCheckRe.errCode == 0){
                let data = {
                    openId: OPENID,
                    title,
                    detail,
                    createOn: getDateTime(),
                    reply: "",
                    replyOn:""
                }
                const insertRe = await db.collection(TABLE).add({ data })
                console.log(insertRe)
                return insertRe
            }
            return msgCheckRe
        } catch (err){
            return err
        }
    }
    //查看历史数据
    else if(action === 'history') {
        return await db.collection(TABLE).where({openId: OPENID}).orderBy("createOn", "desc").limit(PAGE_SIZE).get()
    }
    else
        return {
            errCode: -1,
            errMsg:"无效的操作"
        }
}