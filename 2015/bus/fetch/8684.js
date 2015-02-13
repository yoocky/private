/**
 *@fiveOverview 8684抓取模块 
 *@author zhoumengyan
 *@The original website <http://changtu.huoche.com.cn/>
 *
 */

var cheerio = require("cheerio");
var fetch = require('./fetch');
var ajax = fetch.ajax;
var fs = require('fs');
var Q = require('q');

//8684
var bus = {};
bus.rootUrl = "http://changtu.8684.cn/";
bus.filePath = "./data/8684/";
bus.initItem =function(){
    var data = {
      from: {
        provence_name: '', 
        provence_pinyin: '',
        city_name: '',
        city_pinyin: '',
        station_name:'',
        location:''
      },
      to:{
        provence_name: '',
        provence_pinyin: '',
        city_name: '',
        city_pinyin: '',
        station_name:'',
        location:''
      },
      info :{
        distance:'',
        departure_time: [],
        price :'',
        models:'',
        telephone: '',
        Pass_by:''
      }
    };
    return data;
};

//获取城市区域链接列表
bus.getProvince = function(url){
    fetch.get(url, function (data) {
        if(data) {
            var $ = cheerio.load(data);
            var province_sel = ".pro_title span";
            var provinces = [];
            var pl = $(province_sel).length;
            var count = 0;
            $(province_sel).each(function(i, item){
              (function(i, item){
                    var province = {
                        name : $(item).text().trim(),
                        pinyin : '',
                        city : []
                    }
                    console.log(province);
                    var url = bus.rootUrl + 'ajax.php';
                    var params = {
                        act : 'findcity',
                        value : province.name
                    };
                    var cl = province.name.length == 3 ? 46 : 37;
                    ajax.post(url, params, cl, function(data){
                        count++;
                        var $ = cheerio.load(data);
                        $('a').each(function(){
                            var city = {
                                name : $(this).text(),
                                pinyin: '',
                                url : $(this).attr('href')
                            }
                            province.city.push(city);
                        })
                        provinces[i] = province;
                        if(count == pl){
                            getCity(5);
                        }
                    })
                })(i, item)
            })
            var getCity = function(i){
                bus.getCity(provinces[i]).then(function(){
                    i++;
                    if(provinces[i+1]){
                        console.log(provinces[i].name);
                        getCity(i);
                    }
                })
            }
        } else
            console.log("error");
    });
}

//获取区域房源信息
bus.getCity = function(province){
    var deferred = Q.defer();
    var city = province.city;
    var fileName = bus.filePath + province.name + '.json';
    var out = fs.createWriteStream(fileName, { encoding: "utf8" });
    var count = 0;
    for(var i = 0, l = city.length; i < l; i++){
         var url = bus.rootUrl + city[i].url;
         //抓取城市
         (function(i){fetch.get(url, function(data){
            if(data){   
                count++;
                if(count == l){
                    //返回完成的promise
                    deferred.resolve('end');
                }
                var $ = cheerio.load(data);
                var city_sel = ".letter_con a";
                $(city_sel).each(function(){
                    var url = bus.rootUrl + $(this).attr('href');
                    fetch.get(url, function(data){
                        var $ = cheerio.load(data);
                        $('table tr .wf_moreinfo').each(function(){
                            var url = bus.rootUrl + 'ajax.php';
                            var lineId = $(this).attr('lineid');
                            //发车时间
                            var time = $(this).parents('tr').find('.wf_time').text();
                            console.log('loadline ' + lineId);
                            var params = {
                                act : 'loadline',
                                lineId : lineId
                            }
                            var cl = 20 + lineId.length;
                            ajax.post(url, params, cl, function(data){
                                var $ = cheerio.load(data);
                                var val = [];

                                $('li').each(function(){
                                    var value = $(this).text().trim().split('：')[1];
                                    val.push(value);
                                    console.log(value);
                                })
                                var item = {
                                  from: {
                                    province_name:  province.name, 
                                    province_pinyin:  province.pinyin,
                                    city_name: val[0],
                                    city_pinyin: '',
                                    station_name: val[1],
                                    location:''
                                  },
                                  to:{
                                    province_name: '',
                                    province_pinyin: '',
                                    city_name: val[2],
                                    city_pinyin: '',
                                    station_name: val[3],
                                    location:''
                                  },
                                  info :{
                                    distance:val[4],
                                    departure_time: [time],
                                    price :val[5],
                                    models:val[6],
                                    telephone: val[10],
                                    Pass_by:val[9]
                                  }
                                }
                                var txt = JSON.stringify(item); 
                                out.write(txt+',');
                            })
                        });
                    })
                })
            } 
        })}(i))
    }
    return deferred.promise;
}

bus.fetch = function(){
    bus.getProvince(bus.rootUrl);
}

bus.fetch();