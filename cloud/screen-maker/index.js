// 云函数入口文件
const cloud = require('wx-server-sdk')
const configs = require("./maker.json")

const fs = require('fs')

const { registerFont, createCanvas, loadImage } = require('canvas')

let LEFT    = "left"
let TOP     = "top"
let CENTER  = "center"
let START   = "start"
let MIME_TYPES = {
    png: "image/png",
    jpg: "image/jpeg",
    pdf: "application/pdf"
}

let SAVE_TO_LOCAL   = process.env.saveToLocal || false  //是否保存数据到本地
let SAVE_TO_CLOUD   = process.env.saveToCloud || false  //是否保存到云存储
let MASK            = process.env.mask || false         //是否覆盖原来的图片信息（启用后将删除微信支付截图中的 当前状态、收款方备注 并全部用 canvas 绘制）
let MASK_COLOR      = process.env.maskColor ||"#ffffff" //遮罩层背景色

let TABLE = "screen-maker"


cloud.init()

let spaceLetter = text=> text.split("").join(String.fromCharCode(8202))
let _detectStream = (canvas, ps)=> ps.format == 'pdf'? canvas.createPDFStream(): ps.format=='jpg'? canvas.createJPEGStream(): canvas.createPNGStream()

/**
 * 文件保存到本地
 * @param {*} canvas 
 * @param {*} ps 
 */
let saveToLocal = (canvas, ps)=>{
    if(SAVE_TO_LOCAL){
        const out = fs.createWriteStream(__dirname + `/output/${ps.action}-${ps.model}-${new Date().getTime()}.${ps.format}`)
        const stream = _detectStream(canvas, ps)
        stream.pipe(out)
        out.on('finish', () =>  console.debug(`文件保存到 ${out.path}`))
    }
}

/**
 * 写入数据库
 * @param {*} ps 
 */
let saveToDb = async ps=>{
    const db = cloud.database()

    db.collection(TABLE).add({ data: ps }).then(res=> console.debug(`写入数据库成功`, res))
}

/**
 * 填充文字（兼容加粗处理），通过设置字体（ bold 14px '宋体'）无法达到加粗的效果
 * @param {*} ctx           
 * @param {*} font          字体
 * @param {*} text          文本
 * @param {*} x             横轴起始位置
 * @param {*} y             纵轴起始位置
 * @param {*} maxWidth      文本最大宽度
 * @param {*} isBold        是否加粗
 */
let drawText = (ctx, font, text, x, y, maxWidth, isBold=false)=>{
    ctx.font = font
    // 加粗字体的处理
    if(isBold){
        ctx.strokeStyle = ctx.fillStyle
        // linux 系统下线条更粗
        ctx.lineWidth = process.platform=='linux'? 1:0.5
        ctx.strokeText(text, x, y)
    }
    ctx.fillText(text, x, y, maxWidth)
}

/**
 * 带字符间隔的绘制（此方法不适用于绘制 textAlign = CENTER 的文本）
 * @param {*} ctx 
 * @param {*} font 
 * @param {*} text 
 * @param {*} x 
 * @param {*} y 
 * @param {*} fontSize 
 * @param {*} isBold 
 * @param {*} space 
 */
let drawTextWithSpace = (ctx, font, text, x, y, fontSize, isBold, space=1)=>{
    font = `${fontSize}px "${font}"`
	ctx.font = font
    for(let t of text){
        let width = ctx.measureText(t).width
        drawText(ctx, font, t, x, y, 2*width, isBold)
        x+=width+space
    }
}

/**
 * 生成微信支付截图
 * 模板文件为 iPhone X（iOS 14.2）截图
 * @param {*} ps 
 */
let createWechatPay = async (ps)=>{
	let family = `MicrosoftYaHei`
	registerFont('MicrosoftYaHei.ttf', { family:'MicrosoftYaHei' })
	
    let model = ps.model || 'iphone'
    let config = configs.wechat.pay[model]
    if(!config) throw Error(`找不到${model}相关配置`)

    let canvas = ps.format == 'pdf'? createCanvas(config.width, config.height, ps.format): createCanvas(config.width, config.height)
    let ctx = canvas.getContext('2d')
    ctx.textBaseline = TOP
	//canvas.style.letterSpacing = '10px'
    console.debug(`canvas 环境设置完成...`)

    // 先画背景图
    let bgImg = await loadImage(`screen/wechat-pay-${model}.png`)
    ctx.drawImage(bgImg, 0, 0, config.width, config.height)

    //绘制遮罩层
    if(MASK && config.mask){
        ctx.fillStyle = MASK_COLOR
        ctx.fillRect(config.mask[0],config.mask[1],config.mask[2],config.mask[3])

        //填充遮罩文字
        for(let i=0;i<config.texts.length;i++){
			let text = config.texts[i]
            ctx.fillStyle = text[5]
			drawTextWithSpace(ctx, family, text[0], text[1], text[2], text[4], false, 2)
        }
    }
    

    let hasWifi = false
	
	let keys = Object.keys(config.items)
    for(let i=0;i<keys.length;i++){
		let key = keys[i]
        if(ps[key] != undefined){
            let v = config.items[key]
            console.debug(`[填充] ${key}=${ps[key]} (${v})`)

            if(key == 'wifi'){
				if(ps[key] == true){
					let wifiImg = await loadImage(`screen/${model}-wifi.png`)
					ctx.drawImage(wifiImg, v[0], v[1], v[2], v[3])
					hasWifi = true
				}
            }
            else if(key == 'battery'){
                //计算电池宽度
                let battery = parseInt(ps[key])
                if(battery==NaN || battery<=20 || battery>100)    battery = 100

				battery = parseInt(v[2]*battery/100)
				ctx.fillStyle = "#090909"
                ctx.fillRect(v[0], v[1], battery, v[3])
            }
            else {
				let font = `${v[3]}px "${family}"`
				console.debug(`${key} 使用字体：${font}`)
                ctx.font = font
                ctx.textAlign = v[4] || START
				ctx.fillStyle = v[5] || "#010101"
				if(key == 'uuid' && ps[key].length>26){
                    //对于 UUID 的绘制需要分两行
                    drawTextWithSpace(ctx, family, ps[key].substr(0,26), v[0], v[1], v[3])
                    drawTextWithSpace(ctx, family, ps[key].substr(26), v[0], v[1]+v[3]+10, v[3])
                }
                //收款方、金额 两项不做间隔处理
                else if(key=='target' || key=='money')
					drawText(ctx, font, ps[key], v[0], v[1], v[2], v[6]===true)
				else
					drawTextWithSpace(ctx, family, ps[key], v[0],v[1],v[3], v[6]===true, 2)
            }
        }
    }
    //如果没有 wifi 则画上 4G 字样（位置为 wifi 所在区域）
    if(!hasWifi){
        let network = ps['network'] || "4G"     //默认显示 4G
        let v = config.items['wifi']
        if(v){
            console.debug(`[文本填充] network=${network} (${v})`)
            ctx.textAlign = TOP
            drawText(ctx, `22px "${family}"`, network, v[0]+2, v[1]-2, v[2], true)
        }
    }

    saveToLocal(canvas, ps)

    return _dealResult(canvas, ps)
}

let _dealResult = async (canvas, ps)=>{
    if(ps.resultType === 'cloud'){
        if(!SAVE_TO_CLOUD)  throw Error(`服务端未开启云端存储(saveToCloud=false)`)

        return await cloud.uploadFile({
            cloudPath: `maker/${ps.action}-${ps.model}-${new Date().getTime()}.${ps.format}`, 
            /*
            2021年01月13日 此处传入 ReadableStream 无法正常保存到文件
            猜测原因： fileContent 需要的是 fs.ReadStream，是 ReadableStream 的子类

            fileContent: _detectStream(canvas, ps)
            */
            fileContent: 
                ps.format == 'pdf'?
                    canvas.toBuffer(MIME_TYPES.pdf, {
                        title: `${ps.action}-${ps.model}`,
                        author: `0604hx/集成显卡`,
                        subject: `https://github.com/0604hx`
                    })
                    :
                    canvas.toBuffer(MIME_TYPES[ps.format])
        })
    }
    if(ps.format == 'pdf'){
        return canvas.toBuffer(MIME_TYPES.pdf, {
            title: `${ps.action}-${ps.model}`,
            author: `0604hx/集成显卡`,
            subject: `https://github.com/0604hx`
        })
    }
    else{
        return ps.resultType === 'base64'? canvas.toDataURL(MIME_TYPES[ps.format]): canvas.toBuffer(MIME_TYPES[ps.format])
    }
}

// createWechatPay({
//     "action": "wechat-pay",
//     "model": "iphone",
//     "target": "扫二维码付款-给万科物业",
//     "money": "-5000.00",
//     "time": "10:25",
//     "wifi": false,
//     "network": "4G",
//     "battery": 80,
//     "status":"支付成功",
//     "summary": "二维码收款",
//     "date": "2021-01-11 13:38:45",
//     "pay": "兴业银行信用卡(5094)",
//     "uuid": "10001073012021011101546893348529",
//     "format": "png",
//     "resultType": "cloud"
// })

// 云函数入口函数
exports.main = async (ps, context) => {
    let { OPENID,CLIENTIP } = cloud.getWXContext()

    ps.createOn = new Date().getTime()
    ps.openId   = OPENID
    ps.ip       = CLIENTIP
    if(!ps.format)
        ps.format   = "png"

    let result = undefined

    if(ps.action == 'wechat-pay'){
        result = await createWechatPay(ps)
    }

    ps.doneOn = new Date().getTime()

    if(result != undefined){
        // 不存储没有 openid 的请求
        if(ps.openId)
            saveToDb(ps)
        return result
    }
        
    return {
        errCode: -1,
        errMsg:"无效的操作"
    }
}