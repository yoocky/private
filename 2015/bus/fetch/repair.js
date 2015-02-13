/* @fileOverview 遍历json文件修复格式
 * @author zhoumengyan
 */

//依赖模块
var path = require('path');
var fs = require('fs');

//基本配置
var config = {
  //默认路径
  basePath : './data/',
  //需要生成别名的路径列表
  PathArr : ['bus365_station'],
  //遍历深度
  deep : 1,
  //模式
  debug : true
}

//是不是js文件
function isJsonFile(file){
  var reg = /.json$/;
  return reg.test(file);
}

//遍历文件夹并生成别名
function explorer(path, deep){
  deep = deep || 0;
  fs.readdir(path, function(err, files){
      deep++;
      //err 为错误 , files 文件名列表包含文件夹与文件
      if(err){
          console.log('error:\n' + err);
          return;
      }
      files.forEach(function(file){
          fs.stat(path + '/' + file, function(err, stat){
              if(err){
                console.log(err); 
                return;
              }
              if(stat.isDirectory()){             
                  // 如果是文件夹遍历
                  if(deep <= config.deep){
                    explorer(path + '/' + file, deep);
                  }
              }else{
                  //输出
                  if(isJsonFile(file)){
                    var _file = path + '/' + file;
                    fs.readFile(_file, 'utf-8', function(err,data){  
                        if(err){  
                            console.log(err);  
                        }else{  
                            data = ('[' + data).replace(/,$/g, '') + ']';
                            fs.writeFile(_file, data, function(err){
                                if(err) {
                                  throw err;
                                }
                                console.log('has repair ' + file);
                            }); 
                        }  
                    })  
                  }
              }               
          });
      });
  });
}

//默认任务
function task(){
  config.PathArr.forEach(function(path){
       path = config.basePath + path;
       explorer(path);
  })
}

//执行
task();
