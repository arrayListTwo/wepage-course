const express = require('express')
const http = require('http')
const path = require('path')
const axios = require('axios')

//

const app = express()
const serve = http.createServer(app)
const PORT = 8080

serve.listen(PORT, () => {
  console.log(`正在监听 ${PORT} 端口...`)
})

app.get('/', (req, res) => {
  const query = req.query
  const isFromWechatServer = require('./checkSignature')(query)
  console.log(isFromWechatServer)

  if (isFromWechatServer) {
    res.send(query.echostr)
  } else {
    res.send('')
  }
})

app.get('/code/', async (req, res) => {
  console.log('/code/: ', req.query)
  axios.defaults.baseURL = 'https://api.weixin.qq.com'
  const ACCESS_TOKEN_RES = await axios({
    url: '/sns/oauth2/access_token',
    params: {
      appid: 'wx3ec10050b126c608',
      secret: '911623ec7de6176ae4ec7e83c1f7a0e0',
      code: req.query.code,
      grant_type: 'authorization_code'
    }
  })
  console.log(ACCESS_TOKEN_RES.data)
  const { access_token, openid } = ACCESS_TOKEN_RES.data

  const USERINFO_RES = await axios({
    url: '/sns/userinfo',
    params: {
      access_token,
      openid,
      lang: 'zh_CN'
    }
  })

  console.log(USERINFO_RES.data)

  const { headimgurl } = USERINFO_RES.data

  // res.end(`Code: ${req.query.code}`)
  // res.send(USERINFO_RES.data)
  res.send(`<img src="${headimgurl}">`)
})

app.use('/static', express.static(path.resolve(__dirname, 'static')))
