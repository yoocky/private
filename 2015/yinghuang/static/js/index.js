/**
 * @fileOverview 英皇盛典
 * @author zhoumengyan
 * @mail <me@yoocky.com> 
 */
 (function(){
 	'use strict';
 	function showTips(msg){
 		var panel = new Panel();
 		panel.setTitle('').setContent(msg).show();
 	}

 	//dom ready
 	$(function(){
 		$('.live-play').on('click', function(){
 			var html = $('#show_tips').html();
 			showTips(html);
 		})
 	})
 }())