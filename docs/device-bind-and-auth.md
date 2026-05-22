# 设备登录认证 API 调用流程

流程为如下步骤：

- App 登录
- App 刷新令牌
- App 创建虚拟设备
- App 申请临时的 User Access Token
- App 与 设备通信
- Device 初始化
- Device 刷新 token

![设备初始化流程](./assets/device-bind-and-auth.jpg)

## App 登录

平台登录接口

- login: 用户名或者 Email

```sh
POST /sessions/@login
Content-Type: application/json

{
  "login": "admin",
  "password": "eeE4#Sew%"
}
```

登录成功后，服务器返回 session

```json
{
  "expireAt": "2024-10-17T04:53:35.285Z",
  "key": "9hrVv6gMAcjnWUWzjxjfY",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTg1MTU1ZDgwNWNiZjE2YTNkMTRjOWUiLCJpYXQiOjE3MDMyMjA4MTUsImV4cCI6MTQ0NDAyMDgxNX0.alBSisTPmR0c42JLAU4RI4aIXai_RzGqL35aUMJ_ch-cS8klLpnhqreIzuJo3n--OtJ5pd9Olc8xIHthjRmS_hyFvxf8ZNk1B4BL6NX-n2s6cJihMJyIcsu1LgDkgHP2Cgtyq5WmmUB9KzfH4ACqoiabIyxT8_psIZ9_H-EidYmeYJ1b0Etg1BA7VxQ0AMQDKuE0qZpZp_VEpFdTUjL_Tr-ZX7jZhyLwlWeo5j0NXPtAjjGrGF2wRfNTEhqCMxyUWwekwF1yRxyzpJ6Tpxtck5QswlYx45PMrH7fEMKQwufNMD9KP_x8kVsXB4w5R9Di7cJsxjIWKAmwIE0J6lOvQQ",
  "tokenExpireAt": "2023-12-25T04:53:35.286Z",
  "subject": "6585155d805cbf16a3d14c9e",
  "createAt": "2023-12-22T04:53:35.296Z",
  "updateAt": "2023-12-22T04:53:35.296Z",
  "id": "6585164f3b00c66eb50f9b8a"
}
```

- key: 长效授权令牌，可以用于刷新 token
- expireAt: 会话过期的时间，会话过期后 key 将失效
- token: 后续 API 访问的凭证
- tokenExpireAt: token 过期时间

## App 刷新令牌

App 需要定期刷新令牌，确保自身可以持续访问 api 资源

- key: 长效授权令牌

```sh
POST /sessions/@refresh
Content-Type: application/json

{
  "key": "9hrVv6gMAcjnWUWzjxjfY"
}
```

登录成功后，服务器返回 session，其中包含新的 token 和 token 的过期时间

```json
{
  "expireAt": "2024-10-17T04:53:35.285Z",
  "key": "9hrVv6gMAcjnWUWzjxjfY",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTg1MTU1ZDgwNWNiZjE2YTNkMTRjOWUiLCJpYXQiOjE3MDMyMjEyMzAsImV4cCI6MTc4OTYyMTIzMH0.bObkQ_sHB7gDZ1PQ0GHE8DuxyiLfbFz7OFbFEQoq4uwvkaaow60sy1znY4tldr49FxZeHI2YQL5O37xppmF2N9T9KoCkfNsYdmQbkTly1SJG-zXs8tWd86h3qWixij0IB-VkZvpaW34cg_-5vlC6-fi4QmYqDVTfWp1uIe1YXMWysqylxjGKKJXnmHeNH0qX_KqCaergcmWdnYSty_yupAcwbOcqdzcv9yrZhLGTsjPvzyqvGpGgF3lKVO5P2yTFkqlCwMl1pt4nqZcAkdtI-wdKqFvMWjblNBHuLwRdT_n8457AgHi555LPGYErCycxAb1XFmDcCrIKSFm7FNYszQ",
  "tokenExpireAt": "2023-12-23T05:00:30.472Z",
  "subject": "6585155d805cbf16a3d14c9e",
  "createAt": "2023-12-22T04:53:35.296Z",
  "updateAt": "2023-12-22T05:00:30.473Z",
  "id": "6585164f3b00c66eb50f9b8a"
}
```

- key: 长效授权令牌，可以用于刷新 token
- expireAt: 会话过期的时间，会话过期后 key 将失效
- token: 后续 API 访问的凭证
- tokenExpireAt: token 过期时间

## App 创建虚拟设备

App 调用如下 api 创建一个虚拟设备

```sh
POST /virtual-devices
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user": "123456",
  "name": "kitty"
}
```

服务器返回：

```json
{
  "name": "kitty",
  "user": "123456",
  "createAt": "2023-12-21T03:11:50.339Z",
  "updateAt": "2023-12-21T03:11:50.339Z",
  "id": "6583acf6c5668d0eb2a1b30f"
}
```

## App 申请临时的 User Access Token

App 调用如下 api 创建临时访问凭证

```sh
POST /sessions/@restrictToken
Authorization: Bearer {{token}}
Content-Type: application/json

{
	"expiresIn": "10minutes"
}
```

服务器返回：

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0MTIzNCIsImlhdCI6MTcwMzEzMDA0NiwiZXhwIjo3NTE1NzY1MzJ9.OsIO1Kpd9-9g96Uj4Ily0qaXPuXKpwWXeIv4-x6EckGhmqUAkIwFAPKV0cyVdFDfaVHHfJf_bG46Lyg6FUL53qgZwRQ6UlEvfqXCHehunS6QJ0LfrWulODYWV8PmlqDyF5IqpD_wilxh40d-YGwknH9eriPBtMFcy0teddef5sBR-N7vQnoKY-Yd4lq_rgVch13Fq0wD_k1pRUsGrw63mQHF91lrmzmlo60OiDFLEqW-5_qd-0gxxMy89cTr9F0EI1qMwzhAVGqSw5VJxomzXwsOfMvb2MGaMhyudYJah_mkumwouWu3oYbPfZXyPlDP2X9tAEzT25rAogJbtNFjXg",
  "tokenExpireAt": "2024-01-01T04:00:00.000Z"
}
```

## App 与 设备通信

这个过程在 App 与 设备的本地网络完成

App 将获取到的 Token 和 虚拟设备 ID 传递给物理设备

## Device 初始化

Device 调用如下 api 申请将虚拟设备和设备进行绑定

- vid: 虚拟设备的 ID
- eid: 设备 id
- token: 前面步骤申请的临时凭证

```sh
POST /device-auth/setup
Authorization: Bearer {{token}}
Content-Type: application/json

{
	"vid": "1111111111111",
	"eid": "333333333333"
}
```

服务器返回：

- key_id: 为 Token 的 sub 字段
- key: 为设备获取 Token 用的 Key
- token: 为设备连接 MQTT 服务器使用的 Token，格式为 JWT
- token_expiration_time: token 过期时间, unix 时间戳

```json
{
  "key_id": "adg",
  "key": "12345678",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMTExMTExIiwiaWF0IjoxNzAzMTI4NTMzLCJleHAiOjE2MTY3Mjg1MzN9.jDKLZ5rZgbzK5I-XG6lxECltq0qTzx_Wg2CLgZQzlCV62K7rJxYjeW2judJH5xHRR38EqUIBfYTr1cH5JzmVKxIpRTHd26HRsdMF6rTwSQSkqHQKhNgBKJVKF459BY1xdS5ws55inH8kYDM3uH--bDrysPL2aq2_nMnkgKIHkC-Vyq1wkbLw7E4ArahHRxV3PEgjFctQvAY5EeekaAd3n-7mrr0_aetXYMTikgF22vXY3r6fd9sWsDyh0_ilvlGNw_Pm2wN-8Ukzp1OLDHh4wK29xKyATBIu_Db6olzvzlorc0WJybQ4GL8hPhNavjrZbKQFoQLZklLNk0sB6_cLsQ",
  "token_expiration_time": 1703340891
}
```

## Device 刷新 token

Device 调用如下 api 刷新访问凭证

- key: 设备保存的长效授权令牌

```sh
POST /device-auth/refresh-token
Content-Type: application/json

{
	"key": "12345678"
}
```

服务器返回：

- key_id: 为 Token 的 sub 字段
- key: 为设备获取 Token 用的 Key
- token: 为设备连接 MQTT 服务器使用的 Token，格式为 JWT
- token_expiration_time: token 过期时间, unix 时间戳

```json
{
  "key": "12345678",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMTExMTExIiwiaWF0IjoxNzAzMTI4NTMzLCJleHAiOjE2MTY3Mjg1MzN9.jDKLZ5rZgbzK5I-XG6lxECltq0qTzx_Wg2CLgZQzlCV62K7rJxYjeW2judJH5xHRR38EqUIBfYTr1cH5JzmVKxIpRTHd26HRsdMF6rTwSQSkqHQKhNgBKJVKF459BY1xdS5ws55inH8kYDM3uH--bDrysPL2aq2_nMnkgKIHkC-Vyq1wkbLw7E4ArahHRxV3PEgjFctQvAY5EeekaAd3n-7mrr0_aetXYMTikgF22vXY3r6fd9sWsDyh0_ilvlGNw_Pm2wN-8Ukzp1OLDHh4wK29xKyATBIu_Db6olzvzlorc0WJybQ4GL8hPhNavjrZbKQFoQLZklLNk0sB6_cLsQ",
  "token_expiration_time": 1703340891
}
```
