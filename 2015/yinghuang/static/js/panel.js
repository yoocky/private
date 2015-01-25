(function(W){
	'use strict';

	var $ = W.$;

	var defaultOpts = {
		title: '温馨提示',
		content: '',
		width: '460',
		height: 'auto',
		closeSelector: '.panel-close',
		titleSelector: '.panel-title',
		contentSelector: '.panel-bd',
		closeRemove: true,
		showMask: true,
		fixed: true,
		tpl:
			'<div class="panel wrapper">' +
				'<div class="panel-hd">' +
				'<div class="panel-title">{title}</div>' +
				'<a href="#" class="panel-close">&times;</a>' +
				'</div>' +
				'<div class="panel-bd">{content}</div>' +
				'<!--[if lte IE 6]><iframe class="ie6-iframe" src="about:blank" border="0" frameborder="0"></iframe><![endif]-->' +
				'</div>',
		maskTpl:
			'<div class="mask mask-panel">' +
				'<!--[if lte IE 6]>' +
				'<iframe class="ie6-iframe" src="about:blank" border="0" frameborder="0"></iframe>' +
				'<div class="mask-inner"></div>' +
				'<![endif]-->' +
				'</div>'
	};

	var Panel = function(opt) {
		this.opt = $.extend({}, defaultOpts, opt);
		this._init();
		this._initEvent();
	};

	$.extend(Panel.prototype, {
		_init : function() {
			var opt = this.opt,
				tpl = opt.tpl;
			/* 使用传入标题、内容替换模板中对应变量 */
			if(opt.title){
				tpl = tpl.replace('{title}', opt.title);
			}
			if(opt.content){
				tpl = tpl.replace('{content}', opt.content);
			}

			this.$el = $(tpl);
			this.$hd = this.$el.find(opt.titleSelector);
			this.$bd = this.$el.find(opt.contentSelector);

		},
		_initEvent : function() {
			var self = this;
			this.$el.on('click', this.opt.closeSelector, function(e) {
				e.preventDefault();
				self.hide();
				$(self).triggerHandler('close');
			});

			var adjustPosition = W.utils.throttle(self.adjustPosition, 10, true);
			this._adjustPosition = function() {
				adjustPosition.apply(self);
			};

			var $win = $(window);
			$win.on('resize', this._adjustPosition);

			if (this.opt.fixed && !W.utils.support.fixed) {
				$win.on('scroll', this._adjustPosition);
			}

			this.$el.on('DOMNodeInserted DOMNodeRemoved', this._adjustPosition);

		},
		/**
		 * 显示遮罩层
		 * @returns {Panel}
		 */
		setMask : function() {
			if (this.opt.showMask) {
				this.$mask = this.$mask || $(this.opt.maskTpl);
				$(document.body).append(this.$mask);
				if (!W.utils.support.fixed) {
					var $body = $(document.body);
					this.$mask.css({height: $body.outerHeight(true), width: $body.outerWidth(true)});
				}
			}
			return this;
		},
		/**
		 * 删掉遮罩层
		 * @returns {Panel}
		 */
		removeMask : function() {
			if (this.opt.showMask && this.$mask) {
				this.$mask.remove();
			}
			return this;
		},
		/**
		 * 删除遮罩层
		 * @returns {Panel}
		 */
		removeClose : function() {
			this.$el.find(this.opt.closeSelector).remove();
			return this;
		},
		/**
		 * 设置标题
		 * @param title {String|Element} 标题 html或element或文字
		 * @returns {Panel}
		 */
		setTitle : function(title) {
			if ($.type(title) == 'string' && $.trim(title).substr(0,1) != '<') {
				this.$hd.html(title);
			} else {
				this.$hd.empty().append($(title));
			}
			return this;
		},
		/**
		 * 设置内容
		 * @param content {String|Element} 正文 html或element
		 * @returns {Panel}
		 */
		setContent : function(content) {
			var $content = $(content);
			this.$bd.empty().append($content);
			this.adjustPosition();
			return this;
		},
		/**
		 * 设置正文区域大小
		 * @param [width] {Number} 宽
		 * @param [height] {Number} 高
		 * @returns {Panel}
		 */
		setSize : function(width, height) {
			width && this.$el.width(width);
			height && this.$bd.height(height);
			this.adjustPosition();
			return this;
		},
		/**
		 * 调整浮层显示位置
		 * @param [top=center] {String|Number} 上边边距 center时剧中
		 * @param [left=center] {String|Number} 左边边距 center时剧中
		 * @returns {Panel}
		 */
		adjustPosition : function(top, left) {
			var $window = $(window),
			// 如果panel高度小于window高度，强制不启用fixed
				useFixed = this.opt.fixed && this.$el.outerHeight(true) <= $window.height(),
				supportFixed = W.utils.support.fixed;

			if (this.$el.parents('body').length == 0) {
				return this;
			}

			if (!top || top == 'center') {
				top = ($window.height() - this.$el.outerHeight(true)) / 2;
				top = top < 0 ? 0 : top;
			} else {
				top = parseInt(top, 10);
			}

			if (!left || left == 'center') {
				left = ($window.width() - this.$el.outerWidth(true)) / 2;
				left = left < 0 ? 0 : left;
			} else {
				left = parseInt(left, 10);
			}

			if (!useFixed || !supportFixed) {
				top += $window.scrollTop();
				left += $window.scrollLeft();
			}

			this.$el.css({top: top, left: left});

			if (supportFixed) {
				this.$el.css('position', useFixed ? 'fixed' : 'absolute');
			} else {
				$window.off('scroll', this._adjustPosition);
				useFixed && $window.on('scroll', this._adjustPosition);
				if (this.opt.showMask) {
					var $body = $(document.body);
					this.$mask.css({height: $body.outerHeight(true), width: $body.outerWidth(true)});
				}
			}
			return this;
		},
		/**
		 * 显示浮层
		 * @returns {Panel}
		 */
		show : function() {
			this.setMask();
			if (this.$el.parent().length == 0) {
				this.$el.appendTo(document.body);
			}
			this.$el.show();
			this.adjustPosition();
			return this;
		},
		/**
		 * 隐藏浮层
		 * @param [remove] {Boolean} 是否删掉元素
		 * @returns {Panel}
		 */
		hide : function(remove) {
			this.removeMask();
			if (remove === true || this.opt.closeRemove) {
				this.remove();
			} else if (remove === false || !this.opt.closeRemove) {
				this.$el.hide();
			}
			return this;
		},
		/**
		 * 删除浮层，移除所有事件
		 * @returns {Panel}
		 */
		remove : function() {
			this.$hd.detach();
			this.$bd.detach();
			this.$el.remove();
			$(window).off('resize', this._adjustPosition);
			return this;
		}
	});

	W.Panel = Panel;
})(window);