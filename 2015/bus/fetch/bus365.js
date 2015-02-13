/**
 *@fiveOverview 火车网抓取模块 
 *@author zhoumengyan
 *@The original website <http://fj.bus365.com/bus/>
 *
 */

var cheerio = require("cheerio");
var fetch = require('./fetch');
var fs = require('fs');
var Q = require('q');

//bus365
var bus365 = {};
bus365.rootUrl = "http://fj.bus365.com/bus";
bus365.filePath = "./data/bus365/";
bus365.initItem =function(){
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
bus365.getProvince = function(url){
    fetch.get(url, function (data) {
        if(data) {
            var $ = cheerio.load(data);
            var province_sel = ".new_01 a";
            var provinces = [];
            $(province_sel).each(function(i, k){
                var province = {};
                var cityArr = [];
                var item = {
                    name : $(this).text(),
                    pinyin: '',
                    url : $(this).attr('href')
                }
                cityArr.push(item);
                province = {
                    name : $(this).text(),
                    pinyin : '',
                    city : cityArr
                }
                provinces.push(province);
            })
            var getCity = function(i){
                bus365.getCity(provinces[i]).then(function(){
                    i++;
                    if(provinces[i+1])
                    console.log(provinces[i].name);
                    getCity(i);
                })
            }
            getCity(0);
        } else
            console.log("error");
    });
}

//获取区域房源信息
bus365.getCity = function(province){
    var deferred = Q.defer();
    var city = province.city;
    var fileName = bus365.filePath + province.name + '.json';
    var out = fs.createWriteStream(fileName, { encoding: "utf8" });
    var count = 0;
    for(var i = 0, l = city.length; i < l; i++){
         var url = city[i].url;
         (function(i){fetch.get(url, function(data){
            if(data){   
                count++;
                if(count == l){
                    //返回完成的promise
                    deferred.resolve('end');
                }
                var $ = cheerio.load(data);
                var city_sel = ".set_m a";
                $(city_sel).each(function(){
                    var url =  city[i].url.split('/city/')[0] + $(this).attr('href');
                    var cityNames = $(this).text().trim().split('-');
                    fetch.get(url, function(data){
                        var $ = cheerio.load(data);
                        $('#itemContainer li').each(function(k, that){
                             var $div = $(that).find('div');
                             var idx = i + 1;
                             var item = {
                              from: {
                                province_name:  '', 
                                province_pinyin:  '',
                                city_name: cityNames[0],
                                city_pinyin: '',
                                station_name: $(that).find('#sf_' + idx).text().trim(),
                                location:''
                              },
                              to:{
                                province_name: '',
                                province_pinyin: '',
                                city_name: cityNames[1],
                                city_pinyin: '',
                                station_name:$div.eq(2).text().trim(),
                                location:''
                              },
                              info :{
                                distance: $div.eq(4).text().trim(),
                                departure_time: [$div.eq(0).text()],
                                price : $div.eq(5).text().trim(),
                                models: $div.eq(3).text().trim(),
                                telephone: '',
                                Pass_by: $(that).find('#tjzd' + '_' + idx).text().trim()
                              }
                            }
                            var txt = JSON.stringify(item); 
                            out.write(txt+',');
                           
                        });
                    })
                })
            } 
        })}(i))
    }
    return deferred.promise;
}

bus365.fetch = function(){
    bus365.getProvince(bus365.rootUrl);
}

bus365.fetch();


