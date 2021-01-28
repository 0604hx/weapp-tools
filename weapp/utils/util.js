let NEW_LINE = "\n"

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

const getFullDate = (date = new Date()) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${formatNumber(month)}月${formatNumber(day)}日`
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const getFullTime = (date = new Date())=>{
    return [date.getHours(), date.getMinutes(), date.getSeconds(),date.getMilliseconds()].map(formatNumber).join(":")
}

/**
 * 根据当前页面 url 构建名称（去除 pages/ 字符后按 / 分割并去重）
 * @param {*} key 
 * @param {*} joinStr 
 */
let buildUrlKey = (key, joinStr=".") =>{
    let pages = getCurrentPages()
    let page = pages[pages.length-1]
    let names = {}
    page.route.substr(6).split("/").forEach(v=> names[v]=0)
    let tmp = Object.keys(names)
    if(!!key)
        tmp.push(key)
    return tmp.join(joinStr)
}

let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
/**
 * 生成随机字符
 * @param {*} len 
 * @param {*} type 
 */
let random = (len=6, type=0)=>{
    let max = type==0? 10: type==2? 36: 62
    let v = ""
    for(let i=0;i<len;i++)
        v += chars[Math.floor(Math.random()*max)]
    return v
}

module.exports = {
    /**
     * 获取格式化后的日期字符串（yyyy-MM-dd）
     * @param {*} date 
     */
    getDate(date = new Date()) {
        return formatDateOrTime(date)
    },
    /**
     * 获取格式化后的时间字符串（HH:mm:ss）
     * @param {*} date 
     */
    getTime(date = new Date()) {
        return formatDateOrTime(date, 1)
    },
    getDateTime(date = new Date()) {
        return formatDateOrTime(date) + " " + formatDateOrTime(date, 1)
    },
    formatTimestamp(timestamp){
        if(!timestamp)  return ""
        return this.getDateTime(new Date(timestamp>10**12? timestamp : timestamp*1000))
    },
    /**
     * 日期格式为 yyyy年MM月dd日
     */
    getFullDate,
    formatNumber,
    buildUrlKey,
    random,
    JSON: ".json",
    splitByLine (s){
        return s.split(NEW_LINE)
    },
    toLine (s){
        return s.join(NEW_LINE)
    },
    /**
     * debug 输出日志信息（附件当前时间）
     * @param {*} msg 
     * @param {*} obj 
     */
    debug (){
        console.debug(`[${getFullTime()}]`, ...arguments)
    },
    /**
     * 计算平均值
     * @param {*} items 
     */
    avg (items, key, parser=parseInt){
        if(typeof(items) == 'object' && items.forEach){
            let amount = parseInt(0.0)
            items.forEach(i=> amount+= parser(key? i[key]: i))
            return (amount / items.length).toFixed(2)
        }
        return items
    },
    /**
     * 获取文件后缀名
     * @param {*} filename 
     */
    suffix (filename){
        let pos = filename.lastIndexOf('.')
        return pos!=-1? filename.substring(pos+1): ""
    },
    /**
     * 判断 text 是否为 JSON 数组
     * @param {*} text 
     */
    isJSONArrayText (text){
        return  !!text && text[0] == '[' && text[text.length-1]==']'
    },
    /**
     * 将 source 数据覆盖到 target 中（只覆盖 target 有的属性）
     * @param {*} target 
     * @param {*} source 
     */
    copyTo (target, source){
        Object.keys(target).forEach(k=>{
            target[k] = source[k]
        })
    },
    isImageType (fileType){
        return ["png", "jpg", "jpeg", "gif", "bmp"].indexOf(fileType)>=0
    },
    /**
     * 构建本地文件路径
     * @param {*} name 
     */
    buildPath (name){
        return `${wx.env.USER_DATA_PATH}/${name}`
    },
    filename (path){
        return path.split('/').pop()
    },
    /**
     * 打开文档
     * 如果是图片则使用 wx.previewImage （不支持带中文的图片预览=.=）
     * 否则尝试使用 wx.openDocument
     * 
     * @param {*} filePath 
     */
    openFile (filePath, fileType){
        console.debug(`打开文件`, filePath)
        fileType = fileType || this.suffix(filePath).toLowerCase()
        if(this.isImageType(fileType)){
            wx.previewImage({
              urls: [encodeURI(filePath)],
              fail: e=> console.error(`预览图片失败：`, e)
            })
            return
        }
        
        wx.openDocument({
            fileType,
            filePath,
            fail: e=>{
                console.debug(`打开文件(${filePath})失败：`, e)
                let msg = e.errMsg
                if(msg.indexOf("filetype not supported")){
                    msg = `不支持查看${fileType}类型的文件`
                }
                this.error(msg, "文件预览失败")
            }
        })
    },

    /**
     * 显示普通的提示信息
     * @param {*} title 
     * @param {*} duration 
     * @param {*} image 
     */
    warn (title, duration=2500, showCancel=true, image=""){
        wx.showToast({
            title: title,
            icon:"none",
            duration,
            image,
            showCancel
        })
    },
    /**
     * 显示普通的提示信息，目前使用的是微信自带的功能
     * @param {*} title 
     */
    ok (title){
        wx.showToast({
            title: title,
        })
    },
    modal (title, content, onOk=()=>{}, onCancel){
        wx.showModal({
            title,
            content,
            showCancel: !!onCancel,
            success (res) {
              if (res.confirm) {
                onOk()
              } else if (res.cancel) {
                onCancel()
              }
            }
          })
    },
    error (content, title, onOk=()=>{}){
        wx.showModal({
            title: title||"操作失败",
            content,
            showCancel: false,
            confirmColor: "#ed4014",
            success (res) {
              if (res.confirm) {
                onOk()
              }
            }
        })
    },
    /**
     * 弹出咨询对话框
     * @param {*} title 
     * @param {*} content 
     * @param {*} onOk 
     * @param {*} onCancel 
     */
    confirm (title, content, onOk=()=>{}, onCancel=()=>{}){
        wx.showModal({
            title,
            content,
            success (res) {
                if (res.confirm) {
                    onOk()
                } else if (res.cancel) {
                    onCancel()
                }
            }
        })
    }
}