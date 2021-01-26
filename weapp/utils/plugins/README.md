# 插件库

## CryptoJS
> 来源：https://www.cnblogs.com/memphis-f/p/10109027.html

```java
public class Aes {
    /**
     * AES128 算法
     *
     * CBC 模式
     *
     * PKCS7Padding 填充模式
     *
     * CBC模式需要添加偏移量参数iv，必须16位
     * 密钥 sessionKey，必须16位
     *
     * 介于java 不支持PKCS7Padding，只支持PKCS5Padding 但是PKCS7Padding 和 PKCS5Padding 没有什么区别
     * 要实现在java端用PKCS7Padding填充，需要用到bouncycastle组件来实现
     */
    private final String sessionKey = "0102030405060708";
    // 偏移量 16位
    private final String iv = "0102030405060708";

    // 算法名称
    final String KEY_ALGORITHM = "AES";
    // 加解密算法/模式/填充方式
    final String algorithmStr = "AES/CBC/PKCS7Padding";
    // 加解密 密钥 16位

    byte[] ivByte;
    byte[] keybytes;
    private Key key;
    private Cipher cipher;
    boolean isInited = false;

    public void init() {
        // 如果密钥不足16位，那么就补足.  这个if 中的内容很重要
        keybytes = sessionKey.getBytes();
        ivByte = iv.getBytes();
        // 初始化
        Security.addProvider(new BouncyCastleProvider());
        // 转化成JAVA的密钥格式
        key = new SecretKeySpec(keybytes, KEY_ALGORITHM);
        try {
            cipher = Cipher.getInstance(algorithmStr, "BC");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (NoSuchPaddingException e) {
            e.printStackTrace();
        } catch (NoSuchProviderException e) {
            e.printStackTrace();
        }
    }

    public String encrypt(String content) {
        byte[] encryptedText = null;
        byte[] contentByte = content.getBytes();
        init();
        try {
            cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(ivByte));
            encryptedText = cipher.doFinal(contentByte);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return new String(Hex.encode(encryptedText));
    }

    public String decrypt(String encryptedData) {
        byte[] encryptedText = null;
        byte[] encryptedDataByte = Hex.decode(encryptedData);
        init();
        try {
            cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(ivByte));
            encryptedText = cipher.doFinal(encryptedDataByte);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new String(encryptedText);
    }

    public static void main(String[] args) {
        Aes aes = new Aes();

        String content = "孟飞快跑";
        System.out.println("加密前的：" + content);
        String enc = aes.encrypt(content);
        System.out.println("加密后的内容：" + enc);

        String dec = aes.decrypt(enc);
        System.out.println("解密后的内容：" + dec);
    }
}
```

## md5.min.js

引入后直接 md5 调用，示例：

```javascript
const md5 = require("./md5.min.js")
let hashText = md5(`123456`)
//e10adc3949ba59abbe56e057f20f883e
```