/**
 *@fiveOverview 核心抓取模块 
 *@author zhoumengyan
 */
var http = require("http");
var ng = require("nodegrass");
//ua 伪装
var headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36'
};

//抓取函数
exports.get = function(url, callback){
    ng.get(url, function(data,status,headers){ 
        callback(data);
    },headers,'utf8').on('error', function(e) {
      console.log("Got error: " + e.message); 
    });
}

//下载文件
exports.getFile = function(url, path, callback){
    ng.getFile(url, path, function(e){
        if(e){
        console.log(e);
        }
        console.log('download success!');
    });
}

//ajax方法集合
exports.ajax = {};

//post 方法
exports.ajax.post = function(url, params, length, callback){
    headers['Content-Length'] = length;
    ng.post(url,
    function (data, status, headers) {
      callback(data);
    },
    headers,
    params,
    'utf8').
    on('error', function (e) {
      console.log("Got error: " + e.message);
    });
}

