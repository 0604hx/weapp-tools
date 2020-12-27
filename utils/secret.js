/**
 * 数据加解密工具
 */
const CryptoJS = require("./plugins/CryptoJS")
const md5 = require("./plugins/md5.min")
wx.md5 = md5

const SALT = "WeappTools2020"                     //加密加盐

let aes = {
    iv: CryptoJS.enc.Utf8.parse('0604hxWeappTools'),
    buildKey (originText){
        let key = md5(`${originText}${SALT}`, SALT)
        return CryptoJS.enc.Utf8.parse(key)
    },
    encrypt (key, text, hex=false){
        let encrypted = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(text), 
            this.buildKey(key), 
            {
                iv: this.iv, 
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        )
        return encrypted.ciphertext.toString()
    },
    decrypt (key, encryptedText, hex=false){
        let encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedText)

        let decrypt = CryptoJS.AES.decrypt(
            CryptoJS.enc.Base64.stringify(encryptedHexStr), 
            this.buildKey(key), 
            {
                iv: this.iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        )
        return decrypt.toString(CryptoJS.enc.Utf8).toString()
    }
}

module.exports = {
    aes,
    md5
}