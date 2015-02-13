var http = require("http");
var ng = require("nodegrass");
var cheerio = require("cheerio");

//远程抓取的核心方法集合
var fetch = {};

//抓取函数
fetch.get = function(url, callback){
    ng.get(url, function(data,status,headers){ 
        callback(data);
    },'utf8').on('error', function(e) {
      console.log("Got error: " + e.message); 
    });
}

//下载文件
fetch.getFile = function(url, path, callback){
    ng.getFile(url, path, function(e){
        if(e){
        console.log(e);
        }
        console.log('download success!');
    });
}
//火车网
var huoche = {};
huoche.rootUrl = "http://changtu.huoche.com.cn/";

//获取城市区域链接列表
huoche.getAareList = function(url, end){
    fetch.get(url, function (data) {
        if(data) {
            var sel = ".provincelist a";
            var $ = cheerio.load(data);
            var list = [];
            $(sel).each(function(i, k){
                var $this = $(this);
                var item = {
                    href : $this.attr('href'),
                    name : $this.text()
                }
                list.push(item);
            })   
            //遍历获取房源信息
            for(var i = 0, l = list.length; i < l; i++){
                var url = huoche.rootUrl + list[i].href;
                console.log(list[i].name, url);
                if(end){
                    huoche.getRentInfo(url);
                }else{
                    huoche.getAareList(url, true);
                }
            }
        } else
            console.log("error");
    });
}

//获取区域房源信息
huoche.getRentInfo = function(url){
    fetch.get(url, function (data) {
        if(data) {
            var sel = "table";
            var $ = cheerio.load(data);
            console.log($(sel).text().trim());
            
        } else
            console.log("error");
    });
}

huoche.init = function(){
    huoche.getAareList(huoche.rootUrl);
}

huoche.init();



