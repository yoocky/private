/**
 *@fiveOverview 火车网抓取模块 
 *@author zhoumengyan
 *@The original website <http://changtu.huoche.com.cn/>
 *
 */

var cheerio = require("cheerio");
var fetch = require('./fetch');
var fs = require('fs');
var Q = require('q');

//火车网
var huoche = {};
huoche.rootUrl = "http://changtu.huoche.com.cn";
huoche.filePath = "./data/huoche/";
huoche.initItem =function(){
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
huoche.getProvince = function(url){
    fetch.get(url, function (data) {
        if(data) {
            var $ = cheerio.load(data);
            var province_sel = ".provincelist";
            var provinces = [];
            $(province_sel).each(function(i, k){
                var province = {};
                var cityArr = [];
                var $city= $(this).find('.provincelist_content a');
                var $province = $(this).find('.provincelist_top a');
                $city.each(function(){
                    var item = {
                        name : $(this).text(),
                        pinyin: $(this).attr('href').replace('/c/', ''),
                        url : $(this).attr('href')
                    }
                    cityArr.push(item);
                })
                province = {
                    name : $province.text(),
                    pinyin : $province.attr('href').replace('/s/', ''),
                    city : cityArr
                }
                provinces.push(province);
            })
            var getCity = function(i){
                huoche.getCity(provinces[i]).then(function(){
                    i++;
                    if(provinces[i+1])
                    console.log(provinces[i].name);
                    getCity(i);
                })
            }
            getCity(8);
        } else
            console.log("error");
    });
}

//获取区域房源信息
huoche.getCity = function(province){
    var deferred = Q.defer();
    var city = province.city;
    var fileName = huoche.filePath + province.pinyin + '.json';
    var out = fs.createWriteStream(fileName, { encoding: "utf8" });
    var count = 0;
    for(var i = 0, l = city.length; i < l; i++){
         var url = huoche.rootUrl + city[i].url;
         (function(i){fetch.get(url, function(data){
            if(data){   
                count++;
                if(count == l){
                    //返回完成的promise
                    deferred.resolve('end');
                }
                var $ = cheerio.load(data);
                var city_sel = ".provincelist_content a";
                $(city_sel).each(function(){
                    var url = huoche.rootUrl + $(this).attr('href');
                    fetch.get(url, function(data){
                        var $ = cheerio.load(data);
                        $('table tr a').each(function(){
                            var url = $(this).attr('href');
                            if(url.indexOf('/cc/') > -1){
                                url = huoche.rootUrl + url;
                                console.log(url);
                                fetch.get(url, function(data){
                                    var $ = cheerio.load(data);
                                    var val = [];

                                    $('.coach_detail span').each(function(){
                                        val.push($(this).text().trim());
                                        console.log($(this).text().trim());
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
                                        station_name:'',
                                        location:''
                                      },
                                      info :{
                                        distance:val[8],
                                        departure_time: [val[3]],
                                        price :val[7],
                                        models:val[6],
                                        telephone: val[5],
                                        Pass_by:val[4]
                                      }
                                    }
                                    var txt = JSON.stringify(item); 
                                    out.write(txt+',');
                                })
                            }
                        });
                    })
                })
            } 
        })}(i))
    }
    return deferred.promise;
}

huoche.fetch = function(){
    huoche.getProvince(huoche.rootUrl);
}

huoche.fetch();


