// 云函数入口文件
const cloud = require('wx-server-sdk')
const configs = require("./maker.json")

const fs = require('fs')

const { registerFont, createCanvas, loadImage } = require('canvas')

let LEFT    = "left"
let TOP     = "top"
let CENTER  = "center"
let START   = "start"

let SAVE_TO_LOCAL = process.env.saveToLocal || false
let TABLE = "screen-maker"


cloud.init()

let spaceLetter = text=> text.split("").join(String.fromCharCode(8202))

/**
 * 文件保存到本地
 * @param {*} canvas 
 * @param {*} name 
 */
let saveToLocal = (canvas, name)=>{
    if(SAVE_TO_LOCAL){
        const out = fs.createWriteStream(__dirname + `/output/${name}-${new Date().getTime()}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.debug(`图片保存到 ${out.path}`))
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
 * 生成微信支付截图
 * 模板文件为 iPhone X（iOS 14.2）截图
 * @param {*} ps 
 */
let createWechatPay = async (ps)=>{
	let family = `MicrosoftYaHeiUI`
	registerFont('MicrosoftYaHeiUI.ttc', { family:'MicrosoftYaHeiUI' })
	
    let model = ps.model || 'iphone'
    let config = configs.wechat.pay[model]
    if(!config) throw Error(`找不到${model}相关配置`)

    let canvas = createCanvas(config.width, config.height)
    let ctx = canvas.getContext('2d')
    ctx.textBaseline = TOP
	//canvas.style.letterSpacing = '10px'
    console.debug(`canvas 环境设置完成...`)

    // 先画背景图
    let bgImg = await loadImage(`screen/wechat-pay-${model}.png`)
    ctx.drawImage(bgImg, 0, 0, config.width, config.height)

    let hasWifi = false
	
	let keys = Object.keys(config.texts)
    for(let i=0;i<keys.length;i++){
		let key = keys[i]
        if(ps[key] != undefined){
            let v = config.texts[key]
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
				let font = `${v[6]?(v[6]+" "):''}${v[3]}px "${family}"`
				console.debug(`${key} 使用字体：${font}`)
                ctx.font = font
                ctx.textAlign = v[4] || START
				ctx.fillStyle = v[5] || "#010101"
				if(key == 'uuid' && ps[key].length>26){
                    //对于 UUID 的绘制需要分两行
                    drawText(ctx, font, ps[key].substr(0,26), v[0], v[1], v[2])
                    drawText(ctx, font, ps[key].substr(26), v[0], v[1]+v[3]+10, v[2])
				}
                else
                    drawText(ctx, font, ps[key], v[0], v[1], v[2], v[6]===true)
            }
        }
    }
    //如果没有 wifi 则画上 4G 字样（位置为 wifi 所在区域）
    if(!hasWifi){
        let network = ps['network'] || "4G"     //默认显示 4G
        let v = config.texts['wifi']
        if(v){
            console.debug(`[文本填充] network=${network} (${v})`)
            ctx.textAlign = TOP
            drawText(ctx, `22px "${family}"`, network, v[0]+2, v[1]-2, v[2], true)
        }
    }

    saveToLocal(canvas, `wechat-pay-${model}`)

    //返回 BASE64 URI 数据
    return canvas.toDataURL()
}

// createWechatPay({
// 	action:`wechat-pay`,
//     model: `iphone`,
//     target: `扫二维码付款-给万科物业`,
//     money: "-5000.00",
//     time: "10:25",
//     wifi: false,
//     network: "4G",
//     battery: 80,
//     summary: "二维码收款",
//     date: "2021-01-11 13:38:45",
//     pay: "兴业银行信用卡(5094)",
//     uuid: "10001073012021011101546893348529"
// })

// 云函数入口函数
exports.main = async (ps, context) => {
    let { OPENID,CLIENTIP } = cloud.getWXContext()

    ps.createOn = new Date().getTime()
    ps.openId   = OPENID
    ps.ip       = CLIENTIP

    let result = undefined

    if(ps.action == 'wechat-pay'){
        result = await createWechatPay(ps)
    }

    ps.doneOn = new Date().getTime()

    if(result != undefined){
        saveToDb(ps)
        return result
    }
        
    return {
        errCode: -1,
        errMsg:"无效的操作"
    }
}