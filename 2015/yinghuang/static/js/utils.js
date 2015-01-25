(function(W){
	'use strict';

	var utils = {};

	/**
	 * 设置Cookie
	 * @param {String} key
	 * @param {String} value
	 * @param {Number} [expiresDays=2]
	 */
	utils.setCookie = function(key, value, expiresDays){
		var expires = new Date();
		expiresDays = expiresDays !== undefined ? expiresDays : 2;
		expires.setTime(expires.getTime() + 864e5/*24*60*60*1000*/ * expiresDays);
		document.cookie =  key + "=" + encodeURIComponent(value) + ";expires=" + expires.toGMTString()+ ";path=/";
	};

	/**
	 * 获取Cookie值
	 * @param {String} key
	 * @return {String}
	 */
	utils.getCookie = function(key){
		var val = null,
			reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)"),
			result = document.cookie.match(reg);
		if (result) {
			val = decodeURIComponent(result[2]);
		}
		return val;
	};

	/**
	 * 空闲控制
	 * 控制函数的执行间隔不小于delay毫秒
	 * @param {Function} fn  请求关联函数，实际应用需要调用的函数
	 * @param {Number} delay 空闲时间，单位毫秒
	 * @param {Boolean} [immediate] 是否在尾部执行
	 * @param {Boolean} [debounce] 控制throttle or debounce
	 * @return {Function}
	 */
	utils.throttle = function (fn, delay, immediate, debounce) {
		var curr = +new Date(),
			lastCall = 0,
			lastExec = 0,
			timer = null,
			diff, //时间差
			context,//上下文
			args,
			exec = function () {
				lastExec = curr;
				fn.apply(context, args);
			};
		return function () {
			curr = +new Date();
			context = this;
			args = arguments;
			diff = curr - (debounce ? lastCall : lastExec) - delay;
			clearTimeout(timer);

			if (debounce) {
				if (immediate) {
					timer = setTimeout(exec, delay);
				} else if (diff >= 0) {
					exec();
				}
			} else {
				if (diff >= 0) {
					exec();
				} else if (immediate) {
					timer = setTimeout(exec, -diff);
				}
			}

			lastCall = curr;
		};
	};

	/**
	 * 频率控制
	 * 函数在空闲delay毫秒后才会执行
	 * @param {Function} fn 请求关联函数，实际应用需要调用的函数
	 * @param {Number} delay 延迟时间，单位毫秒
	 * @param {Boolean} [immediate] 是否在尾部用定时器补齐调用
	 * @return {Function} 返回客户调用函数
	 */
	utils.debounce = function (fn, delay, immediate) {
		return utils.throttle(fn, delay, immediate, true);
	};

	utils.support = $.extend({
		fixed: false
	}, $.support);

	/**
	 * 判断浏览器是否支持fixed属性，在页面加载完后执行
	 */
	$(function() {
		try{
			var $body = $(document.body),
				$container = $('<div>').height(3000),
				$el = $('<div>').css({position: 'fixed', top: 100}).html('x').appendTo($container);
			var originalScrollTop = $body.scrollTop();

			$container.appendTo($body);
			var extraTop = $(document.documentElement).position().top;
			extraTop = extraTop > 0 ? extraTop : 0;

			$body.scrollTop(500);

			var elementTop = $el[0].offsetTop;

			utils.support.fixed = (elementTop - extraTop) === 100;

			$container.remove();
			$body.scrollTop(originalScrollTop);
		} catch (e) {
		}
	});

	W.utils = utils;

})(window);