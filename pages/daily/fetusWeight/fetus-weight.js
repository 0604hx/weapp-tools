/**
 * 体重与周数预测关系
Gestational Weeks	EFW	10th%	90th%
16	146g (5oz)	121	171
17	181g (6oz)	150	212
18	223g (7oz)	185	261
19	273g (9oz)	227	319
20	331g (11oz)	275	387
21	399g (14oz)	331	467
22	478g (1lb)	398	559
23	568g (1lb 5oz)	471	665
24	670g (1lb 7oz)	556	784
25	785g (1lb 11oz)	652	918
26	913g (2lb)	758	1068
27	1055g (2lb 5oz)	876	1234
28	1210g (2lb 10oz)	1004	1416
29	1379g (3lb)	1145	1613
30	1559g (3lb 7oz)	1294	1824
31	1751g (3lb 13oz)	1453	2049
32	1953g (4lb 4oz)	1621	2285
33	2162g (4lb 12oz)	1794	2530
34	2377g (5lb 3oz)	1973	2781
35	2595g (5lb 11oz)	2154	3036
36	2813g (6lb 3oz)	2335	3291
37	3028g (6lb 10oz)	2513	3543
38	3236g (7lb 2oz)	2686	3786
39	3435g (7lb 9oz)	2851	4019
40	3619g (7lb 15oz)	3004	4234
 */
let util = require("../../../utils/util")
//从16周开始开始大概率体重，来源 https://www.baby2see.com/medical/charts.html#Fetal_Growth_Percentile
let weekWeights = [171, 212, 261, 319, 387, 467, 559, 665, 784, 918, 1068, 1234, 1416, 1613, 1824, 2049, 2285, 2530, 2781, 3036, 3291, 3543, 3786, 4019, 4234]

let guessWeek = w=>{
    let diffs = weekWeights.map(v=> Math.abs(v-w))
    let index = diffs.indexOf(Math.min(...diffs))
    return index==-1? "<16": (16+index)
}
Page({
    data: {
        resultShow: false,
        methodShow: false,

        subjects: [
            { key:"bpd", text:"双顶径/BPD" },
            { key:"ac", text:"腹围/AC"},
            { key:"fl", text:"股骨长/FL"}
        ],
        inputs: {},
        //算法类别
        methods: [
            { 
                name:"双顶径算法", summary:"仅使用双顶径 BPD 进行计算，公式为：900*BPD-5200g",
                func: (bpd)=> 900*bpd - 5200,
                input: ['bpd']
            },
            {
                name:"多元算法", summary:"双顶径、腹围、股骨长多参数计算，公式为：1.07*BPD^3+0.3*AC^2*FL",
                input: ['bpd', 'ac', 'fl'],
                func: (bpd, ac, fl)=> 1.07*bpd**3 + 0.3*ac**2*fl
            }
        ],
        method: {},
        weight: 0,
        week:"31"
    },
    onLoad (options){
        this.setData({method: this.data.methods[1]})
    },
    onMethodShow (){
        this.setData({methodShow: !this.data.methodShow})
    },
    onMethodSelect (e){
        this.onMethodShow()
        let method = e.detail
        this.setData({method})
    },
    onInput (e){
        let inputs = this.data.inputs
        inputs[e.target.dataset.key] = e.detail
        this.setData({inputs})
    },
    configure (e){
        if(this.data.resultShow===true) return this.setData({resultShow: false})

        let { method } = this.data
        if(!method || !method.func) return util.warn(`请选择计算方式`)

        let userInputs = method.input.map(k=> this.data.inputs[k])
        //检测 bpd 输入，应在 0 到 12cm之间
        if(method.input.indexOf("bpd")>-1){
            let { bpd } = this.data.inputs
            if(!bpd || bpd<0 || bpd>12) return util.error(`双顶径应在0到12厘米之间`, '输入错误')
        }
        
        let weight = method.func(...userInputs).toFixed(1)
        let week = guessWeek(weight)

        console.debug(`${method.name} 计算结果：${weight} 孕周${week}`)
        this.setData({resultShow: true, weight, week})
    }
})