# IP查询
> 简单的 IP 归属地查询

目前支持查询`纯真IP库`、`火猫直播接口`，流程如下：

1. 用户输入 IP 地址
2. 选择接口类型（默认使用纯真IP库）
3. 调用接口得到结果，封装到本地 Bean（国家、省份、城市、运营商、asn 等字段）
4. 将上述结果显示到页面

## 接口说明

免费 IP 查询接口：

网站名|GET|HTTPS|限制|备注
-----|-----|-----|-----|-----|-----
淘宝IP地址库|✅||<1qps|国家、省份、城市、运营商
纯真IP库||✅|不详|省份、城市、运营商
火猫直播|✅|✅|不详|国家、省份、城市、运营商


### 淘宝IP地址库
> http://ip.taobao.com/outGetIpInfo?ip={IP}&accessKey=alibaba-inc

**返回示例**

```json
{"data":{"area":"","country":"中国","isp_id":"100017","queryIp":"119.75.217.109","city":"北京","ip":"119.75.217.109","isp":"电信","county":"","region_id":"110000","area_id":"","county_id":null,"region":"北京","country_id":"CN","city_id":"110100"},"msg":"query success","code":0}
```

### 纯真IP库
> https://www.cz88.net/czapi/ip?ip={IP}

**返回示例**

```json
{"code":200,"msg":"success","data":{"ip":"119.75.217.109","country_zh":null,"province_zh":"北京市","city_zh":"北京市","area_zh":null,"isp":"北京百度网讯科技有限公司BGP节点","latlngs":null,"timezone":null,"provinceISO":null,"cityPinYin":null,"cityDivisionCode":null,"areaDivisionCode":null,"china":false}}
```

### 火猫直播
> https://ip.huomao.com/ip?ip={IP}

**返回示例**

```json
{"country":"中国","province":"北京","city":"北京","isp":"电信","ip":"119.75.217.109"}
```

**接口地址示例**

- `淘宝IP地址库`: http://ip.taobao.com/outGetIpInfo?ip={IP}&accessKey=alibaba-inc
- `纯真`:https://www.cz88.net/czapi/ip?ip={IP}
- `火猫直播`:https://ip.huomao.com/ip?ip={IP}