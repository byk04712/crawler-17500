const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

// 网页爬虫，爬取乐彩网彩票开奖数据
request({
  url: 'https://tools.17500.cn/tb/zj61/hmfb',
  method: 'GET'
}, (error, response, body) => {
  if (error || !body) {
    return
  }
  if (response.statusCode === 200) {
    try {
      parseHtmlData(body)
    } catch (error) {
      console.log('爬取数据异常', error)
    }
  }
})

// body为网页上数据
function parseHtmlData (body) {
  // cheerio.load 返回类似jquery的一个对象
  const $ = cheerio.load(body)
  // 找到数据
  const scriptText = $('script').eq(4).html()
  // 正则匹配需要的数据
  const reg = /unescape\( \"(.*)\" \)\)/
  // 匹配到的数据
  let data = scriptText.match(reg)[1]
  if (data) {
    // 替换双引号
    data = data.replace(/\&quot\;/g, '"')
    const jsonData = JSON.parse(data)
    if (Array.isArray(jsonData.data)) {
      const result = jsonData.data.map(item => ({
        [item.issue]: item.nums
      }))
      fs.writeFileSync('./output.txt', JSON.stringify(result, null, 2))
    }
  }
}
