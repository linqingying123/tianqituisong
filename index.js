/**
 * 配置
 * @type {{loveDay: string, tianxingKey: string, city: string, babyBirthday: string, appid: string, secret: string, templateId: string, myBirthday: string}}
 */
const cfg = {
    /**
     * 微信appid
     */
    appid: 'wxaa81ab1831865bff',
    /**
     *微信调用凭证
     */
    secret: '66716260e60a888833e4377f695f235e',
    /**
     * 微信消息推送模板id
     */
    templateId: 'gpSGxMuC-hikgvEzv28NVcXvoXLIwKmVdh0kimmbr3g',
    /**
     * 天行数据调用凭证 Key
     */
    tianxingKey: '55bd17042c9f7cccb8ca1be2b45c3170',
    /**
     * 需要获取的城市名
     */
    city: '北京市',
    /**
     * 自己的生日
     */
    myBirthday: '2002-08-24',
    /**
     * 女朋友的生日
     */
    babyBirthday: '2021-08-25',
    /**
     * 相恋的时间
     */
    loveDay: '2021-08-24',
}

//天行数据返回的数据格式
/*可以自行添加
*
* {
  area: '葫芦岛',
  date: '2022-08-24',
  week: '星期三',
  weather: '晴',
  weatherimg: 'qing.png',
  real: '27℃',
  lowest: '16℃',
  highest: '27℃',
  wind: '南风',
  winddeg: '180',
  windspeed: '16',
  windsc: '3-4级',
  sunrise: '05:15',
  sunset: '18:43',
  moonrise: '01:40',
  moondown: '17:26',
  pcpn: '0.0',
  pop: '25',
  uv_index: '4',
  vis: '25',
  humidity: '74',
  tips: '天气炎热，适宜着短衫、短裙、短裤、薄型T恤衫、敞领短袖棉衫等夏季服装。晴天紫外线等级较高，外出注意补水防晒。疫情防控不松懈，出门请佩戴罩。'
}

*
* */


let access_token = ''
let userlist = []

let tianqiObj = {}
let caihongpi = ''
let zaoanyu = ''


//消息模板
const template = {
    //早安语

    morning: {
        value: '',
        color: '#ff6666'
    },

    //日期
    dateAndWeek: {
        value: '',
        color: ''
    },
    //城市
    city: {
        value: '',
        color: '#9900ff'
    },
    //天气
    weather: {
        value: '',
        color: '#CD96CD'
    },
    // 最低气温
    lowest: {
        value: '',
        color: '#A4D3EE'
    },
    // 最高气温
    highest: {
        value: '',
        color: '#CD3333'
    },
    // 降水概率
    pop: {
        value: '',
        color: '#A4D3EE'
    },
    //今日建议
    tips: {
        value: '',
        color: '#FF7F24'
    },
    //相爱天数

    loveDay: {
        value: '',
        color: '#EE6AA7'
    },
    //我的生日

    myBirthday: {
        value: '',
        color: '#EE6AA7'
    },
    //宝贝生日

    babyBirthday: {
        value: '',
        color: '#EE6AA7'
    },
    //彩虹屁
    pipi: {
        value: '',
        color: '#E066FF'
    }
}

const axios = require('axios');

//api列表
const api = {
    //彩虹屁
    getCaiHongPi: () => {
        axios.get(`http://api.tianapi.com/caihongpi/index?key=${cfg.tianxingKey}`).then(res => {
            // console.log(res.data);
            caihongpi = res.data.newslist[0].content
        })
    },
//    早安语
    getZaoAnYu() {
        axios.get(`http://api.tianapi.com/zaoan/index?key=${cfg.tianxingKey}`).then(res => {
            // console.log(res.data);
            zaoanyu = res.data.newslist[0].content
        })
    },
//    天气
    getTianqi: () => {
        axios.get(`http://api.tianapi.com/tianqi/index?key=${cfg.tianxingKey}&city=${encodeURI(cfg.city)}`).then(res => {
            // console.log(res.data);
            tianqiObj = res.data.newslist[0]
        })


    },

//    获取access_token
    getAccessToken() {
        return axios.get(` https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${cfg.appid}&secret=${cfg.secret}`)
    },
//    获取用户列表
    getUserList() {
        this.getTianqi()
        this.getCaiHongPi()
        this.getZaoAnYu()
        this.getAccessToken().then(res => {
            access_token = res.data.access_token
            axios.get(`https://api.weixin.qq.com/cgi-bin/user/get?access_token=${access_token}`).then(res1 => {
                // console.log(res1.data);
                userlist = res1.data.data.openid
                /****************添加消息模板***************/
                //日期和星期
                template.dateAndWeek.value = util.getDate()
                //早安语
                template.morning.value = `宝贝 早安！\n${zaoanyu}`
                //天气
                template.weather.value = tianqiObj.weather
                //城市
                template.city.value = tianqiObj.area
                //最低气温
                template.lowest.value = tianqiObj.lowest
                //最高气温
                template.highest.value = tianqiObj.highest
                //降水概率
                template.pop.value = tianqiObj.pop + '%'
                //今日建议
                template.tips.value = tianqiObj.tips
                //相爱天数
                template.loveDay.value = util.getLoveDay(cfg.loveDay)
                //我的生日
                template.myBirthday.value = util.getBirthday(cfg.myBirthday)
                //宝贝生日
                template.babyBirthday.value = util.getBirthday(cfg.babyBirthday)
                //彩虹屁
                template.pipi.value = caihongpi

                // console.log(tianqiObj)
                // console.log(template)
                // 发送消息
                userlist.forEach(item => {
                    this.sendTemplateMessage(item, cfg.templateId, template)
                })

            })
        })
    },
//    发送模板消息
    sendTemplateMessage(openid, templateId, data) {
        return axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`, {
            touser: openid,
            template_id: templateId,
            data: data
        }).then(res => {
            if (res.data.errcode == 0) {
                console.log(`发送成功：${openid}`)
            }
        })
    }
}


const util = {
//    获取日期
    getDate() {


        //    返回格式 yyyy-mm-dd 星期几
        let date = new Date()


        let weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${weekDay[date.getDay()]}`


    },
//    计算相爱天数
    getLoveDay(loveDay) {
        let date = new Date().getTime()
        let loveDayDate = new Date(loveDay).getTime()
        let day = (date - loveDayDate) / (1000 * 60 * 60 * 24)
        return Math.floor(day)
    },
    // 计算距离生日天数
    getBirthday(birthday) {
        let date = new Date()
        let dateTime = date.getTime()
        let birthdayDate = new Date(birthday)
        birthdayDate.setFullYear(date.getFullYear())

        let birthdayTime = birthdayDate.getTime()

        if (dateTime > birthdayTime) {
            birthdayDate.setFullYear(date.getFullYear() + 1)
        }
        //    更改时分秒
        birthdayDate.setHours(date.getHours())
        birthdayDate.setMinutes(date.getMinutes())
        birthdayDate.setSeconds(date.getSeconds())
        let day = Math.ceil((birthdayDate.getTime() - dateTime) / (1000 * 60 * 60 * 24))
        return day


    }
}
//华为云
// exports.handler  = async (event, context) => {
//腾讯云
exports.main_handler = (event, context) => {
    api.getUserList()
}

