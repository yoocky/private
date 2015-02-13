/**
 *@fiveOverview 火车网抓取模块 
 *@author zhoumengyan
 *@The original website <http://www.bus365.com/index/page>
 *
 */

var cheerio = require("cheerio");
var fetch = require('./fetch');
var fs = require('fs');
var Q = require('q');

//bus365
var bus365 = {};
bus365.rootUrl = "http://www.bus365.com/index/page";
bus365.filePath = "./data/bus365_station/";
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
            var province_sel = ".allStations a";
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
                var city_sel = ".city_station_div";
                $(city_sel).each(function(k , that){
                    var city = $('#rmxl_hotCity a').eq(k).text()
                    var $tops = $(that).find('.top');
                    $tops.each(function(){
                        var $text = $(this).find('.text');
                        var item = {
                            city_name: city,
                            station_name: $(this).find('a').attr('title'),
                            telephone: $text.eq(0).text().split('：')[1],
                            address : $text.eq(1).attr('title')
                        }
                        var txt = JSON.stringify(item); 
                        console.log(txt);
                        out.write(txt+',');
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


