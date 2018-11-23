(function(XDK, $){
	XDK.register("ui.mousedown", function(){
		var INDEX = -1;
		function clsSelect(e){
			e = e || window.event;
			if('getSelection' in window){
				window.getSelection().removeAllRanges();
			}else{
				try {
					document.selection.empty();
				} catch (e) {};
			};
			if(e.preventDefault){
				 e.preventDefault();
			}else{
				 e.returnValue = false;
			};	
		};
		function _point(e){
			return {
				x : e.pageX,
				y : e.pageY
			};
		};
		var _class_ = XDK.Class.create({
			_init_ : function(options){
				 
				INDEX += 1;
				this.index = INDEX;
				var set = $.extend({
					container : null,
					events : {}
				}, options);
				set.events = $.extend({
					mousedown : function(e, _self, point){},
					mousemove : function(e, _self, point, pointData){},
					mouseup : function(e, _self, point){}
				}, set.events);
				this.set = set;
				this.container = null;
				this.handled = false;
				this.doc = $(document);
				this.win = $(window);
				this.startEventPoint = { x : 0, y : 0};
				this._setDOM(function(){
					this._bind();
				});
			},
			_initCancelSelect : function(){
				var doc = this.doc;
				doc.bind("mousemove", clsSelect);
				doc.bind("selectstart", clsSelect);
				doc.bind("mouseup", function(){
					doc.unbind("mousemove", clsSelect);
					doc.unbind("selectstart", clsSelect);
				});
			},
			_setDOM : function(callback){
				callback = callback || function(){};
				var container = null;
				if(this.set.container != null){
					var c = $(this.set.container); 
					if(c.size() > 0){
						c.addClass("xdkui-mousedown").addClass("xdkui-mousedown-" + this.index);
						c.data("mousedown", this);
						this.container = c;
						callback.call(this);
					};
				};
				
			},
			_c_mousedown_evt : function(e){
				e.preventDefault();
				var doc = this.doc;
				var p = _point(e);
				this.startEventPoint = p;
				var rs = this.set.events.mousedown.call(this, e, this, p) !== false;
				if(!rs){
					return;
				};
				 
				this._initCancelSelect();
				this.handled = true;
				
				doc.bind("mousemove", $.proxy(this._doc_mousemove_evt, this));
				doc.bind("mouseup", $.proxy(this._doc_mouseup_evt, this));
			},
			_doc_mouseup_evt : function(e){
				if(this.handled){
					this.handled = false;
					this.set.events.mouseup.call(this, e, this, _point(e));
					var doc = this.doc;
					doc.unbind("mousemove", this._doc_mousemove_evt);
					doc.unbind("mouseup", this._doc_mouseup_evt);
				};				
			},
			_doc_mousemove_evt : function(e){
				
				if(this.handled){
					var oldPoint = this.startEventPoint;
					var p = _point(e);
					var point = {x : p.x - oldPoint.x, y : p.y - oldPoint.y};
					this.set.events.mousemove.call(this, e, this, p, point);
				};				
			},
			_bind : function(){
				this.container.bind("mousedown", $.proxy(this._c_mousedown_evt, this));
			},
			_unbind : function(){
				this.container.unbind("mousedown", this._c_mousedown_evt);
			},
			destroy : function(){
				this._unbind();
				this.container.removeClass("xdkui-mousedown").removeClass("xdkui-mousedown-" + this.index);
			}			
		});
		return _class_;
	});
	
	XDK.register("ui.resizable", function(){
		if($.browser.msie && $.browser.version == "6.0"){
			try{document.execCommand("BackgroundImageCache",false,true)}catch(r){}
		};
		var INDEX = -1;
		var __mousedown__ = XDK.ui.mousedown;
		var _class_ = XDK.Class.create({
			_init_ : function(options){
				INDEX += 1;
				this.index = INDEX;
				var set = $.extend({
					container : null,
					minHeight: 10,
					minWidth: 10,
					maxWidth : null,
					maxHeight : null,
					resizingClass : "xdkui-resizable-resizing",
					events : {
					},
					handles : ["t", "r", "b", "l", "rt", "rb", "lb", "lt"],
					handleNodeZIndex : "1000"
				}, options);
				set.events = $.extend({
					resizestart : function(e, _self, handle, node){},
					beforeresize : function(e, _self, handle, node){},
					resize : function(e, _self, handle, node){},
					resizestop : function(e, _self, handle, node){}
				}, set.events);
				this.set = set;
				this.container = null;
				this.handleNodes = {};
				this.mousedownObj = null;
				this.offsetPostion = {};
				this.size = {};
				this.oldCursor = $("body").css("cursor");
				this._setDOM(function(){
					this._init();
				}); 
			},
			_setDOM : function(callback){
				callback = callback || function(){};
				var container = null;
				if(this.set.container != null){
					var c = $(this.set.container); 
					if(c.size() > 0){
						c.addClass("xdkui-resizable").addClass("xdkui-resizable-" + this.index);
						this.container = c;
						c.data("resizable", this);
						callback.call(this);
					};
				};
			},
			_init : function(){	
				this._setPosition();
				this._createResizeHandles();
			},	
			
			/**
			 * set container the default position, then resize-handles can used absolute-position
			*/
			_setPosition : function(){
				if(!(/^(?:r|a|f)/).test(this.container.css("position"))){
					this.container.css("position", "relative");
				};
			},
			_initHandleNode : function(node){
				var handle = node.data("handle");
				var _this = this;
				var $body = $("body");  
				var overflow = this.container.css("overflow");
				var oldPos = null; 
				this.offsetPostion = {};
				var container = this.container;
				var nodeMouseDownApp = __mousedown__.getInstance({
					container : node,
					events : {
						mousedown : function(e, _self, point){
							var rs = _this.set.events.resizestart.call(_this, e, _this, handle, node);
							if(rs === false){
								return false;
							};
							_this.size = _this._getContainerSize();
							
							//console.log(_this.size);
							oldPos = {left : e.pageX, top : e.pageY};
							var cssLeft = parseInt(container.css("left"));
							if(isNaN(cssLeft)){
								cssLeft = 0;
							};
							var cssTop = parseInt(container.css("top"));
							if(isNaN(cssTop)){
								cssTop = 0;
							};
							_this.offsetPostion = {left : cssLeft, top : cssTop};
							_this.updateHandleNodesSize();
							 
						},
						mousemove : function(e, _self, point, pointData){
							var beforeResizeRs = _this.set.events.beforeresize.call(_this, e, _this, handle, node);
							if(beforeResizeRs === false){
								return false;
							};
							$body.css({
								cursor : node.css("cursor")
							});
							var dx = pointData.x;
							var dy = pointData.y;
							var css = _this._getChangeStyleOnResize(handle, e, _this.size.width, _this.size.height, dx, dy, _this.offsetPostion);
							if(css === null){
								return;
							};
							var cssData = css();
							_this.container.css(cssData);
							_this.container.addClass(_this.set.resizingClass);
							_this.updateHandleNodesSize();
							_this.set.events.resize.call(_this, e, _this, handle, node);
							 
						},
						mouseup : function(e, _self, point){
							_this.container.removeClass(_this.set.resizingClass);
							_this.set.events.resizestop.call(_this, e, _this, handle, node);
							$body.css({
								cursor : _this.oldCursor
							});
							_this.updateHandleNodesSize();
						}
					}
				});
				node.data("mousedownobj", nodeMouseDownApp);
			},
			_getContainerSize : function(){
				var con = this.container;
				var _con = con[0];
				return {
					innerWidth : con.innerWidth(),
					innerHeight : con.innerHeight(),
					offsetWidth : _con.offsetWidth,
					offsetHeight : _con.offsetHeight,
					width : con.width(),
					height : con.height()
				};
			},

			_getChangeStyleOnResize : function(resize_type, e, start_width, start_height, dx, dy, nodeOffsetPositon){
				var _this = this;
				var set = _this.set;
				var minWidth = set.minWidth;
				var minHeight = set.minHeight;
				var maxWidth = set.maxWidth;
				var maxHeight = set.maxHeight;
				var dw = this.offsetPostion.left + this.size.width; 
				var dh = this.offsetPostion.top + this.size.height;	
				function getMinTop(){
					return dh - minHeight;
				};
				function getMinLeft(){
					return dw - minWidth;
				};
				function getMaxTop(){
					return dh - maxHeight;
				};
				function getMaxLeft(){
					return dw - maxWidth;
				};
				return ({
					t : function(){
						var pos = {
							top : nodeOffsetPositon.top + dy , 
							height : start_height - dy
						};
						if(minHeight != null){
							if(pos.height < minHeight){
								pos.height = minHeight;
								pos.top = getMinTop();
							};
						};
						if(maxHeight != null){
							if(pos.height > maxHeight){
								pos.height = maxHeight;
								pos.top = getMaxTop();
							};
						};
						return pos;
					},
					b : function(){
						var pos = {
							height: start_height + dy
						};
						if(minHeight != null){
							if(pos.height < minHeight){
								pos.height = minHeight;
							};
						};
						if(maxHeight != null){
							if(pos.height > maxHeight){
								pos.height = maxHeight;
							};
						};
						return pos;
					},
					r : function(){
						var pos = {
							width : start_width + dx
						};
						if(minWidth != null){
							if(pos.width < minWidth){
								pos.width = minWidth;
							};
						};
						if(maxWidth != null){
							if(pos.width > maxWidth){
								pos.width = maxWidth;
							};
						};
						return pos;
					},
					l : function(){
						var pos = {
							width : start_width - dx,
							left : nodeOffsetPositon.left + dx
						};
						if(minWidth != null){
							if(pos.width < minWidth){
								pos.width = minWidth;
								pos.left = getMinLeft();
							};
						};
						if(maxWidth != null){
							if(pos.width > maxWidth){
								pos.width = maxWidth;
								pos.left = getMaxLeft();
							};
						};
						return pos;
					},
					lt : function(){
						var pos = {
							width : start_width - dx,
							left : nodeOffsetPositon.left + dx,
							top: nodeOffsetPositon.top + dy, 
							height: start_height - dy
						};
						if(minWidth != null){
							if(pos.width < minWidth){
								pos.width = minWidth;
								pos.left = getMinLeft();
							};
						};
						if(maxWidth != null){
							if(pos.width > maxWidth){
								pos.width = maxWidth;
								pos.left = getMaxLeft();
							};
						};
						if(minHeight != null){
							if(pos.height < minHeight){
								pos.height = minHeight;
								pos.top = getMinTop();
							};
						};
						if(maxHeight != null){
							if(pos.height > maxHeight){
								pos.height = maxHeight;
								pos.top = getMaxTop();
							};
						};
						return pos;
					},
					rt : function(){
						var pos = {
							width : start_width + dx,
							top: nodeOffsetPositon.top + dy, 
							height: start_height - dy
						};
						if(minWidth != null){
							if(pos.width < minWidth){
								pos.width = minWidth;
							};
						};
						if(maxWidth != null){
							if(pos.width > maxWidth){
								pos.width = maxWidth;
							};
						};
						if(minHeight != null){
							if(pos.height < minHeight){
								pos.height = minHeight;
								pos.top = getMinTop();
							};
						};
						if(maxHeight != null){
							if(pos.height > maxHeight){
								pos.height = maxHeight;
								pos.top = getMaxTop();
							};
						};
						return pos;
					},
					lb : function(){
						var pos = {
							width : start_width - dx,
							left : nodeOffsetPositon.left + dx,
							height: start_height + dy
						};
						if(minWidth != null){
							if(pos.width < minWidth){
								pos.width = minWidth;
								pos.left = getMinLeft();
							};
						};
						if(maxWidth != null){
							if(pos.width > maxWidth){
								pos.width = maxWidth;
								pos.left = getMaxLeft();
							};
						};
						if(minHeight != null){
							if(pos.height < minHeight){
								pos.height = minHeight;
							};
						};
						if(maxHeight != null){
							if(pos.height > maxHeight){
								pos.height = maxHeight;
							};
						};
						return pos;
					},
					rb : function(){
						var pos = {
							width : start_width + dx,
							height: start_height + dy
						};
						if(minWidth != null){
							if(pos.width < minWidth){
								pos.width = minWidth;
							};
						};
						if(maxWidth != null){
							if(pos.width > maxWidth){
								pos.width = maxWidth;
							};
						};
						if(minHeight != null){
							if(pos.height < minHeight){
								pos.height = minHeight;
							};
						};
						if(maxHeight != null){
							if(pos.height > maxHeight){
								pos.height = maxHeight;
							};
						};
						return pos;
					}
				})[resize_type] || null;
			},
			
			_getHandleNodes : function(){
				return this.container.find(".xdkui-resizable-handle");
			},	
			updateHandleNodesSize : function(){
				 
				var _this = this;
				this._getHandleNodes().each(function(){
					var node = $(this);
					var handle = node.data("handle");
					if(handle == "l" || handle == "r"){
						node.css({
							height : _this.container.outerHeight()
						});
					};	
				});
			},
			hide : function(){
				this._getHandleNodes().hide();
			},
			show : function(){
				this.updateHandleNodesSize();
				this._getHandleNodes().show();
			},
			destroy : function(){
				this._getHandleNodes().each(function(){
					var node = $(this);
					node.data("mousedownobj").destroy();
					node.remove();
				});
				this.container.removeClass("xdkui-resizable").removeClass("xdkui-resizable-" + this.index);
			},
			_createResizeHandles : function(){
				var handles = this.set.handles;
				var tpl = "<div style='z-index:" + this.set.handleNodeZIndex + ";' class='xdkui-resizable-handle xdkui-resizable-{handle} xdkui-resizable-{handle}-" + this.index + "'>&nbsp;</div>";
				var _this = this;
				$.each(handles, function(a, b){
					var html = XDK.core.str.render(tpl, {
						handle : b
					});
					var node = $(html);
					_this.handleNodes[b] = node;
					node.data("handle", b);
					_this._initHandleNode(node);
					_this.container.append(node);
				});
				 
				
			}
		});
		return _class_;
	});
	
	XDK.register("ui.draggable", function(J){
		var __mousedown__ = XDK.ui.mousedown;	
		var ie6 = $.browser.msie && $.browser.version == "6.0";
		var instanceIndex = 1000;
		var DRAG_LIST = {};
		var cls = J.Class.create({
			_init_ : function(options){
				 
				instanceIndex += 1;
				var set = $.extend({
					container : null,
					handle : null,
					events : {},
					//move default
					cursor : null,
					iframeFix : false,
					xDrag: true,
					yDrag : true,
					startZIndex : null
				}, options);
				var events = {
					dragstart : function(_self, e, nodePos){
						
					},
					drag : function(_self, e, nodePos, pos){
						
					
					},
					dragstop : function(_self, e, nodePos){
						
					},
					updateindex : function(_self, index){
						this.zIndex(index);
					}
				};
				
				set.events = $.extend(events, set.events);
				this.index = instanceIndex;
				DRAG_LIST[this.index] = this;
				this.set = set;
				this.container = null;
				this.handle = null;
				 
				this.disabled = false;
				this.mousedownObj = null;
				this._setContainer();
				this._setHandle();
				if(!this.handle){
					console.log("Error : handle is null");
					return;
				};
				this.cur_handle	= "auto";		
				this.container.addClass("xdkui-draggable-" + this.index);
				this.handle.addClass("xdkui-draggable-handle-" + this.index);
				 
				this.set.iframeFix && ie6 && this.container.prepend("<iframe class='xdkui-draggable-iframe xdkui-draggable-iframe-" + this.index + "'   src='about:blank' frameborder='0' srcolling='no'></iframe>");
				this.container.append("<div style='display:none;' class='xdkui-draggable-alpha xdkui-draggable-alpha-" + this.index + "'></div>");
				this.alpha = this.container.find(".xdkui-draggable-alpha-" + this.index);
				this.iframe = this.set.iframeFix && ie6  ? this.container.find(".xdkui-draggable-iframe-" + this.index) : null;
 
				this.pos_old = {x : 0, y : 0};
				this.node_pos = {left : 0, top : 0};
				this.updateZIndex(this.set.startZIndex !== null ? this.set.startZIndex : this.index);
				
				this.alphaFix();
				this._setPosition();
				this._binds();
			 
			},
			_setPosition : function(){
				if(!(/^(?:r|a|f)/).test(this.container.css("position"))){
					this.container.css("position", "relative");
				};
			},
			_setContainer : function(){
				var set = this.set;
				var rs = null;
				if(set.container != null){
					var tmp = $(set.container);
					if(tmp.size() > 0){
						rs = tmp;
						
					};
				};
				if(rs){
					rs.data("draggable", this);
				};
				this.container = rs;
			},
			_getContainer : function(){
				return this.container;
			},
			_setHandle : function(){
				var set = this.set;
				var rs = null;
				if(this.container != null){
					if(set.handle != null){
						rs = this.container.find(set.handle);
					}else{
						rs = this.container;
					};
				};
				this.handle = rs;
			},
			_getHandle : function(){
				return this.handle;
			},
			_getPos : function(e){
				return{
					x : e.pageX,
					y : e.pageY
				};
			},
			_getNodePos : function(){
				var con = this.container;
				var left = con.css("left");
				left = left == "auto" ? 0 : parseInt(left);
				var top = con.css("top");
				top = top == "auto" ? 0 : parseInt(top);
				return {
					left : left,
					top : top
				};
			},
			alphaFix : function(){
				var con = this.container[0];
				var w = con.offsetWidth;
				var h = con.offsetHeight;
				var css = {
					width : w + "px",
					//height : h -this.handle[0].offsetHeight
					height : (h - (this.set.handle !== null ? this.handle[0].offsetHeight : 0)) + "px"
				};
				var css2 = {
					width : w + "px",
					height : h  + "px"
				};
				this.alpha.css(css);
				if(this.iframe){
					this.iframe.css(css2).show();
				};
			},
			updateZIndex : function(){
				instanceIndex += 1;
				this.set.events.updateindex.call(this, this, instanceIndex);
				
			},
			zIndex : function(a){
				this.container.css({
					"z-index" : a
				});
			},
			showAlpha : function(){
				this.alpha.show();
			},
			hideAlpha : function(){
				this.alpha.hide();
			},
			_binds : function(){
				var handle = this.handle;
				var container = this.container;
				var alpha = this.alpha;
				var doc = $(document);
				this.cur_handle = handle.css("cursor");
				var _this = this;
				if(!_this.set.xDrag && !_this.set.yDrag){
					return;
				};
				handle.addClass("xdkui-draggable-handle");
				if(_this.set.cursor){
					handle.css({cursor : _this.set.cursor});
				};
				container.addClass("xdkui-draggable");
				alpha.mousedown(function(){
					_this.hideAlpha();
					handle.trigger("mousedown"); 
				}); 
				container.bind("mousedown", $.proxy(this._containerMouseDownEvt, this));
				$(window).bind("resize", $.proxy(this.alphaFix, this));
				this.mousedownObj = __mousedown__.getInstance({
					container : _this.handle,
					events : {
						mousedown : function(e, _self, point){
							 
							var rs = _this.set.events.dragstart.call(_this, _this, e, _this._getNodePos());
							if(rs === false){
								return false;
							};
							if(_this.disabled ){
								return false;
							};
							
							e.stopPropagation();
							_this.updateZIndex();
							_this.showAlpha();
							_this.node_pos = _this._getNodePos();
							_this.pos_old = _this._getPos(e);
						},
						mousemove : function(e, _self, point, pointData){
							_this._move(e);
						},
						mouseup : function(e, _self, point){
							 
							_this.hideAlpha();
							_this.set.events.dragstop.call(_this, _this, e, _this._getNodePos());
						}
					}
				});
			},
			_move : function(e){
				 
				var _this = this;
				_this.alphaFix();
				var pos_new = _this._getPos(e);
				var node_pos = _this._getNodePos();	
				var pos = {x : 0, y : 0};
				if(_this.set.xDrag){
					pos.x = pos_new.x - _this.pos_old.x + _this.node_pos.left;
				}else{
					pos.x = node_pos.left;
				};
				if(_this.set.yDrag){
					pos.y = pos_new.y - _this.pos_old.y + _this.node_pos.top;
				}else{
					pos.y = node_pos.top;
				};
				_this.container.css({
					left : pos.x + "px",
					top :  pos.y + "px"
				});
				_this.set.events.drag.call(_this, _this, e, _this._getNodePos(), pos);
				 
			},
			_containerMouseDownEvt : function(e){
				this.updateZIndex();
			},
			
			disable : function(){
				this.disabled = true;
				this.handle.css({cursor : this.cur_handle});
			},
			removeDisable : function(){
				this.disabled = false;
				this.handle.css({cursor : this.set.cursor});
			},
			destroy : function(){
				var doc = $(document);
				this.container.unbind("mousedown", this._containerMouseDownEvt).removeClass("xdkui-draggable").removeClass("xdkui-draggable-" + this.index);
				this.handle.removeClass("xdkui-draggable-handle").removeClass("xdkui-draggable-handle-" + this.index).css({cursor : this.cur_handle});
				this.alpha.unbind().remove();
				if(this.mousedownObj){
					this.mousedownObj.destroy();
				};
				$(window).unbind("resize", this.alphaFix);
				if(this.iframe){
					var frame = this.iframe[0];
					frame.src = "";
					try{
						frame.contentWindow.document.write("");
						frame.contentWindow.close();
					}catch(e){
					
					};
					this.iframe.remove();
				};
				delete DRAG_LIST[this.index];
			}
		});
		cls.DRAG_LIST = DRAG_LIST;
		cls.INSTANCE_INDEX = instanceIndex;
		return cls;
	});
		
	/**
	 * XDK.ui.slider - 拖拽进度条
	*/
	XDK.register("ui.slider", function(J){
		var sliderIndex = -1;
		var SLIDER_LIST = {};
		var cls = J.Class.create({
			_init_ : function(options){
				sliderIndex += 1;
				var set = $.extend({
					slider : "#test-progress-bar",
					dir : "x",
					initToPercent : 0,// 1 - 100
					cursor : "auto",
					events : {
					}
				}, options);
				set.events = $.extend({
					 
					sliderInit : function(){
					
					},
					percent : function(){
					
					}
				}, set.events);
				this.sliderIndex = sliderIndex;
				SLIDER_LIST[this.sliderIndex] = this;
				this.slider = $(set.slider);
				this.btn = null;
				this.percentBar = null;
				this._setSliderDOM(set.dir);
				this.dir = set.dir;
				var _this = this;
				cls.baseConstructor.call(this, {
					cursor : set.cursor,
					container : this.btn,
					xDrag : this.dir == "x" ? true : false,
					yDrag : this.dir == "y" ? true : false,
					events : {
					 
						drag : function(_self, e, nodePos){
							var innerWidth = this.slider.innerWidth();
							var innerHeight = this.slider.innerHeight();
							var btn = this.handle; 
							var _btn = btn[0];
							var _container = this.slider[0];
							var offsetLeft = XDK.core.dom.offset.left(_btn);
							var parentOffsetLeft = XDK.core.dom.offset.left(_container);
							var offsetTop = XDK.core.dom.offset.top(_btn);
							var parentOffsetTop = XDK.core.dom.offset.top(_container);
							if(this.dir == "x"){
								if(offsetLeft < parentOffsetLeft || nodePos.left < 0){
									_this.to(0);
								}else if(nodePos.left + _btn.offsetWidth >  innerWidth){
									_this.to(100);
								}else{
									_this.to(nodePos.left / (innerWidth - _btn.offsetWidth) * 100);
								};
							}else if(this.dir == "y"){
								if(offsetTop < parentOffsetTop || nodePos.top < 0){
									_this.to(0);
								}else if(nodePos.top + _btn.offsetHeight >  innerHeight){
									_this.to(100);
								}else{
									_this.to(nodePos.top / (innerHeight - _btn.offsetHeight) * 100);
								};
							};
						}
					}
				});
				set.events = $.extend(this.set.events, set.events);
				this.set = $.extend(this.set, set);
				//console.log(this.set)
				this.percent = 0;
				this.to(this.set.initToPercent);
				this.set.events.sliderInit.call(this);
				this.initSliderEvet();
			},
			
			_setSliderDOM : function(dir){
				
				this.slider.addClass("xdkui-slider xdkui-slider-" + this.sliderIndex + " xdkui-slider xdkui-slider-" + dir);
				var tpl = "<div class='xdkui-slider-progress xdkui-slider-progress-{index} xdkui-slider-{dir}-progress'></div>" + 
				"<div class='xdkui-slider-btn xdkui-slider-btn-{index} xdkui-slider-{dir}-btn'></div>";
				var html = XDK.core.str.render(tpl, {
					dir : dir,
					index : this.sliderIndex
				});
				this.slider.html(html);
				this.btn = this.slider.find(".xdkui-slider-btn-" + this.sliderIndex);
				this.percentBar = this.slider.find(".xdkui-slider-progress-" + this.sliderIndex);
			},
			_resize : function(e){
				this.to(this.percent);
			},
			initSliderEvet : function(){
				var btn = this.handle; 
				var _btn = btn[0];
				var slider = this.slider;
				var _slider = slider[0];
				var _this = this;
				var doc = $(document);
				var win = $(window);
				var b = $("body");
				var cursor = b.css("cursor");
				win.bind("resize", $.proxy(this._resize, this));
				slider.bind("mousedown", function(e){
					var innerWidth = slider.innerWidth();
					var innerHeight = slider.innerHeight();
					var clientX = e.pageX;
					var sliderLeft = slider.offset().left;
					var left = clientX - sliderLeft;
					var clientY = e.pageY;
					var sliderTop = slider.offset().top;
					var top = clientY - sliderTop;
					var num = 0;
					var btn_w = _btn.offsetWidth;
					var btn_h = _btn.offsetHeight;
					if(_this.dir == "x"){
						num = ((left - btn_w / 2) / (innerWidth -  btn_w )) * 100;
					}else if(_this.dir == "y"){
						num = ((top - btn_h / 2) / (innerHeight -  btn_h )) * 100;
					};
					var rs_start = _this.set.events.dragstart.call(_this, _this, e, _this._getNodePos());
					if(rs_start !== false){
						_this.to(num);
						_this.handled = true;
						//console.log(_this.mousedownObj);
						_this.mousedownObj._initCancelSelect();
						_this.showAlpha();
						 
						_this.pos_old = _this._getPos(e);
						_this.node_pos = _this._getNodePos();
						//console.log(_this.pos_old, _this.node_pos);
						//console.log(_this.handled)
						b.css({cursor : _this.set.cursor});
						 
						doc.bind("mousemove", $.proxy(_this._move, _this));
						doc.bind("mouseup", function(e){
							if(_this.handled){
								_this.handled = false;
								_this.hideAlpha();
								doc.unbind("mousemove", _this._move);
								b.css({cursor : cursor});
								_this.set.events.dragstop.call(_this, _this, e, _this._getNodePos());
							};
						});
					};
				});
				btn.bind("mousedown", function(e){
					e.preventDefault();
					e.stopPropagation();
				});
			},
			barPercent : function(bar, num){
				if(num < 0){
					num = 0;
				}else if(num > 100){
					num = 100;
				};
				var innerWidth = this.slider.innerWidth();
				var innerHeight = this.slider.innerHeight();
				var btn = this.handle; 
				var _btn = btn[0];
				var btn_w = _btn.offsetWidth;
				var btn_h = _btn.offsetHeight;
				var percent = num / 100;
				if(this.dir == "x"){
					var nodePos = this._getNodePos();
					var w = percent * innerWidth;
					 
					if(btn_w + nodePos.left > w  && w > 0){
						w = btn_w + nodePos.left;
						
					};
					bar.css({
						width : w + "px"
					});
				}else if(this.dir == "y"){
					var nodePos = this._getNodePos();
					var h = percent * innerHeight;
					if(btn_h + nodePos.top > h ){
						h = btn_h + nodePos.top;
					};
					bar.css({
						height : h + "px"
					});
				};
				bar.attr({
					_percent : num
				});
			},
			//1 - 100
			to : function(num, to_call){
				to_call = typeof(to_call) == "undefined" ? true : to_call;
				if(num < 0){
					num = 0;
				}else if(num > 100){
					num = 100;
				};
				this.percent = num;
				var innerWidth = this.slider.innerWidth();
				var innerHeight = this.slider.innerHeight();
				var btn = this.handle; 
				var _btn = btn[0];
				var btn_w = _btn.offsetWidth;
				var btn_h = _btn.offsetHeight;
				var percent = num / 100;
				var percentBar = this.percentBar;
				this.slider.attr({
					_percent : percent
				});
				if(this.dir == "x"){
					btn.css({
						left : percent * (innerWidth - btn_w) + "px"
					});
					this.barPercent(percentBar, num);
				}else if(this.dir == "y"){
					btn.css({
						top : percent * (innerHeight - btn_h) + "px"
					});
				};
				this.barPercent(percentBar, num);
				if(to_call){
					this.set.events.percent.call(this, num);
				};
			}
		}, XDK.ui.draggable);	
		cls.SLIDER_LIST = SLIDER_LIST;
		return cls;
	});

	
	XDK.register("ui.dialog", function(J){
		var script_dir = (function(){
			var dir = null;
			var script = $(document).find("script[src]");
			script.each(function(){
				var src = $(this).attr("src");
				var pat = /(.*)xdk\.ui(.*)\.js/;
				var matchRs = src.match(pat);
				if(matchRs != null){
					dir = matchRs[1];
					return false;
				};
			});
			return dir;
		})();
		var mousedown = XDK.ui.mousedown;
		var resizable = XDK.ui.resizable;
		var draggable = XDK.ui.draggable;
		var render = XDK.core.str.render;
		var uid = XDK.core.str.guid;
		var getURL = XDK.core.router.getURL;
		var ie6 = $.browser.msie && $.browser.version == "6.0";
		var fixedClass = "xdkui-dialog-fixed";
		var IDINDEX = -1;
		var DIALOG_LIST = {};
		function _winSize(){
			var html = document.documentElement;
			var l = $.browser.msie ? html.scrollLeft: window.pageXOffset,
			t = $.browser.msie ? html.scrollTop: window.pageYOffset,
			window_w = $.browser.msie ? html.clientWidth: window.innerWidth,
			window_h = $.browser.msie ? html.clientHeight: window.innerHeight,
			scrollWidth = window_w + l,
			scrollHeight = window_h + t;
			return {
				l: l,
				t: t,
				scrollHeight: scrollHeight,
				scrollWidth : scrollWidth,
				window_w: window_w,
				window_h: window_h
			};
		};
	 
		var DIALOG_TPL = [
			"<div class='xdkui-dialog-alphafixed xdkui-dialog-alphafixed-{index}' style='display:none;background:{alpha_bg_color};opacity:{alpha_opacity_1};filter:alpha(opacity={alpha_opacity_2});' id='{id}-alpha'>&nbsp;</div>",
			"<div id='{id}' style='display:none;' class='xdkui-dialog xdkui-dialog-{index} {defaultskinclass}'>",
				"	<div class='xdkui-dialog-wraper xdkui-dialog-wraper-{index}'>",
				"		<table class='xdkui-dialog-tb xdkui-dialog-tb-border xdkui-dialog-tb-border-{index}'>",
				"			<tbody>",
				"				<tr>",
				"					<td class='xdkui-dialog-lt'></td>",
				"					<td class='xdkui-dialog-mt'></td>",
				"					<td class='xdkui-dialog-rt'></td>",
				"				</tr>",
				"				<tr>",
				"					<td class='xdkui-dialog-lm'></td>",
				"					<td class='xdkui-dialog-mm' >",
				"						<div class='xdkui-dialog-inner xdkui-dialog-inner-{index}'>",
				"							<table class='xdkui-dialog-tb'>",
				"								<tr>",
				"									<td class='xdkui-dialog-header xdkui-dialog-header-{index}'>",
				"										<div class='xdkui-dialog-handle xdkui-dialog-handle-{index}' style='display:{handle_bar_display};'>",
				"											<div class='xdkui-dialog-title xdkui-dialog-title-{index}'>{title}</div>",
				"											<div class='xdkui-dialog-act-bar xdkui-dialog-act-bar-{index}'>",
				"												<a href='#' style='display:{min_display};' title='最小化' hideFocus='true' class='xdkui-dialog-min xdkui-dialog-min-{index}'>&nbsp;</a>",
				"												<a href='#' style='display:{max_display};' title='最大化' hideFocus='true' class='xdkui-dialog-max xdkui-dialog-max-{index}'>&nbsp;</a>",
				"												<a style='display:none;' href='#' title='还原' hideFocus='true' class='xdkui-dialog-restore xdkui-dialog-restore-{index}'>&nbsp;</a>",
				"												<a href='#' style='display:{close_display};' title='关闭' hideFocus='true' class='xdkui-dialog-close xdkui-dialog-close-{index}'>&nbsp;</a>",
				"											</div>",
				"										</div>",
				"									</td>",
				"								</tr>",
				"								<tr>",
				"									<td class='xdkui-dialog-body xdkui-dialog-body-{index}' style='{width_css};{height_css};'>",
				"										<div class='xdkui-dialog-c xdkui-dialog-c-{index}'>",
				"											{content}",
				"										</div>",
				"									</td>",
				"								</tr>",
				"								<tr style='display:none' class='xdkui-dialog-footer-row xdkui-dialog-footer-row-{index}'>",
				"									<td class='xdkui-dialog-footer xdkui-dialog-footer-{index}'>",
				"										<div  style=''  class='xdkui-fix xdkui-dialog-btnbar xdkui-dialog-btnbar-{index}'>",
				"											<div class='xdkui-dialog-btnwraper xdkui-dialog-btnwraper-{index}'>",
				"											</div>",
				"										</div>",
				"									</td>",
				"								</tr>",
				"							</table>",
				"						</div>",
				"					</td>",
				"					<td class='xdkui-dialog-rm'></td>",
				"				</tr>",	
				"				<tr>",
				"					<td class='xdkui-dialog-lb'></td>",
				"					<td class='xdkui-dialog-mb'></td>",
				"					<td class='xdkui-dialog-rb'></td>",
				"				</tr>",	
				"			</tbody>",
				"		</table>",
				"	</div>",
			"</div>"
		].join("");
		
		var BTN_ITEM_TPL = "<button hideFocus='true' _text='{text}' {focus_class} {id_attr} {disabled_attr}>{text}</button>";
		
		var num = /^\d+$/;
		function is_num(str){
			str += "";
			return num.test(str);
		};
		var _class_ = XDK.Class.create({
			_DIALOG_LIST_ : DIALOG_LIST,
			_init_ : function(options){
				IDINDEX += 1;
				this.index = IDINDEX;
				var set = $.extend({
					//dialog default skin class
					defaultSkinClass : "",
					skin : "default",
					title : "标题",
					content : "文字",
					buttons : [],
					iframeURL : null,
					tpl : DIALOG_TPL,
					//add id to dialgo
					id : uid(),
					showHandleBar : true,
					//draggable control
					draggable : true,
					dragCursor : "move",
					//resize config
					resizable : true,
					forChangeResizeMinSize : false,
					minWidth : null,
					minHeight : null,
					maxWidth : null,
					maxHeight : null,
					//action btn config
					min : false,
					max : false,
					close : true,
					//size config
					width : "auto",
					height : "auto",
					autoPosition : true,
					//position config
					left : 0,
					top : 0,
					autoOpen : true,
					//alpha container config
					alphaFix : false,
					alphaOpacity : 0.4,
					alphaBgColor : "#000",
					alphaFadeInTime : 0,
					alphaFadeOutTime : 0,
					appendTo : "body",
					padding : "10px 20px",
					events : {},
					enterToClose : true
				}, options);
				set.events = $.extend({
					alphaCreated : function(_self){this.initAlphaEvt();},
					init : function(_self){},
					currentdialog : function(_self){},
					beforeopen : function(_self, getWindowSize){},
					open : function(_self){},
					show : function(_self){},
					beforeclose : function(_self){return true;},
					close : function(_self){},
					max : function(_self){},
					min : function(_self){},
					restore : function(_self){}
				}, set.events);
				 
				this.set = set; 
				this.id = set.id;
				this.initOpened = false;
				this.title = set.title;
				this.content = set.content;
				this.dataSize = null;
				this.dialog_id = "xdkui-dialog-" + this.id;
				this.addIe6PNGCss();
				this.dom = {};
				this.dragApp = null;
				this.resizeApp = null;
				this.tempDataBeforeMax = {};
				//normal hide max resore close	
				this.dialogState = "normal";
				this.render();
				DIALOG_LIST[this.id] = this;
			},
			_alphaFixWidthout_ : function(id){
				id = typeof(id) == "undefined" ? null : id;
				if(id === null){
					return;
				};
				$.each(DIALOG_LIST, function(a, b){
					if(b.id != id){
						if(b.dragApp){
							b.dragApp.showAlpha();
							b.dragApp.alphaFix();
						};
					};
				});
			},
			
			_hideAlphaWidthout_ : function(id){
				id = typeof(id) == "undefined" ? null : id;
				if(id === null){
					return;
				};
				$.each(DIALOG_LIST, function(a, b){
					if(b.id != id){
						if(b.dragApp){
							b.dragApp.hideAlpha();
						};
					};
				});
				
			},
			render : function(){
				var set = this.set;
				var html = render(set.tpl, {
					title : set.title,
					content : this._getContent(set.content),
					width_css : set.width === null ? "" : "width:" + (set.width == "auto" ? "auto" : is_num(set.width) ? set.width + "px" : set.width ) ,
					height_css : set.height === null ? "" : "height:" + (set.height == "auto" ? "auto" : is_num(set.height) ? set.height + "px" : set.height ) ,
					index : this.index,
					defaultskinclass : set.defaultSkinClass,
					id : this.dialog_id,
					min_display : set.min ? "block" : "none",
					max_display : set.max ? "block" : "none",
					close_display : set.close ? "block" : "none",
					handle_bar_display : set.showHandleBar ? "block" : "none",
					alpha_bg_color : set.alphaBgColor,
					alpha_opacity_1 : set.alphaOpacity,
					alpha_opacity_2 : Number(set.alphaOpacity) * 100
				});
				$(this.set.appendTo).append(html);
				
				this._setDOM();
				 
				this._createBtnBar(this.set.buttons);	
				 
				if(set.autoOpen){
					this.open();
				};
				this.set.events.init.call(this, this);
			},
			
			_createBtnBar : function(btn_list){
				var _this = this;
				var btnListHtml = "";
				$.each(btn_list, function(a, b){
					btnListHtml += _this._renderBtn(b);
				});
				if(btnListHtml != ""){
					this.dom.footerRow.show();
					this.dom.btnWraper.append(btnListHtml);
					$.each(btn_list, function(a, b){
						_this._initBtnEvt(b);
					});
				};
			},
			appendBtn : function(jBtn){
				this.dom.footerRow.show();
				this.dom.btnWraper.append(jBtn);
				this.updateContainerSize();
				var data = jBtn.data("data");
				data.init.call(data, data.id, jBtn);
			},
			_renderBtn : function(b, returnType){
				var _this = this;
				returnType = typeof(returnType) == "undefined" ? "html" : "jquery";
				if(returnType == "html"){
					b.id = b.id || XDK.core.str.guid();
					return render(BTN_ITEM_TPL, {
						text : b.text,
						focus_class : b.focusStyle ? "class='xdkui-dialog-btnwraper-current'" : "",
						id_attr : "_id='" + b.id + "'",
						disabled_attr : typeof(b.disabled) != "undefined" ? ((b.disabled == "disabled" || b.disabled == true ||  b.disabled == "true") ? "disabled='disabled'" : "") : "" 
					});
				}else if(returnType == "jquery"){
					 
					var data = $.extend({
						text : "按钮名称",
						focusStyle : false,
						click : function(btn, _self){},
						disabled : false,
						id : XDK.core.str.guid(),
						init : function(btnData, btnId, jBtn){
							_this._initBtnEvt(this, this.id);
						}
					}, b);
					
					var checkIsSetBtn = this.getBtnById(data.id);
					if(!checkIsSetBtn){
						var btn = $(this._renderBtn(data));
						btn.data("data", data);
						//this._initBtnEvt(data, data.id);
						console.log("按钮ID:" + data.id + " 已创建");
						return btn;
					}else{
						console.log("按钮ID:" + data.id + " 已存在");
						return null;
					}
				};
				
			},
			
			createBtn : function(data){
				return this._renderBtn(data, "jquery");
			},
			removeBtnById : function(id){
				this.removeBtn(this.getBtnById(id));
			},
			removeBtnByText : function(text){
				this.removeBtn(this.getBtnByText(text));
			},
			removeBtn : function(btn){
				if(btn){
					$(btn).unbind().remove();
				};
			},
			setBtnTextByText : function(btnText, text){
				this.setBtnText(this.getBtnByText(btnText), text);
			},
			setBtnTextById : function(btnId, text){
				this.setBtnText(this.getBtnById(btnId), text);
			},
			setBtnText : function(btn, text){
				$(btn).text(text);	
			},
			getBtnById : function(id){
				return this.getBtn(id, "id");
			},
			getBtnByText : function(text){
				return this.getBtn(text, "text");
			},
			getBtn : function(v, type){
				type = type || "text";
				var btn = null;
				this.getBtnsList().each(function(){
					if(type == "id"){
						if($(this).attr("_id") == v){
							btn = $(this);
							return false;
						};
					}else if(type == "text"){
						if($(this).text() == v){
							btn = $(this);
							return false;
						};
					};
				});
				return btn;
			},
			getBtnsList : function(){
				return this.dom.btnBar.find("button");
			},
			_initBtnEvt : function(b, type){
				type = typeof(type) == "undefined" ? "text" : type;
				var _this = this;
				b = $.extend({
					click : function(btn, _self){}
				}, b);
				var text = b.text;
				var btn = type == "text" ? this.getBtnByText(b.text) : ( b.id ? this.getBtnById(b.id) : null );
				if(btn){
					btn.bind("click", function(){
						var clickRs = b.click.call(this, this, _this);
						if(clickRs !== false){
							_this.close();
						};
					});
					if(b.focus){
						setTimeout(function(){
							try{
								btn.trigger("focus");
							}catch(e){
							};
						},0);
					};
				}
			},
			disableBtnByText : function(text){
				this.disableBtn(this.getBtnByText(text));
			},
			disableBtnById : function(id){
				this.disableBtn(this.getBtnById(id));
			},
			disableBtn : function(btn){
				if(btn){
					$(btn).attr({disabled : "disabled"});
				};
			},
			removeDisableBtn : function(btn){
				if(btn){
					$(btn).removeAttr("disabled");
				};
			},
			removeDisableBtnById : function(id){
				this.removeDisableBtn(this.getBtnById(id));
			},
			removeDisableBtnByText : function(text){
				this.removeDisableBtn(this.getBtnByText(text));
			},
		
			showAlphaContainer : function(){
				var set = this.set;
				this.dom.alpha.hide().css({
					background : set.alphaBgColor
				}).css({"z-index" : this.dragApp.index}).fadeTo(this.set.alphaFadeInTime, set.alphaOpacity);
				this._resizeAlpha();
			},
			hideAlphaContainer : function(call_back){
				var _this = this;
				call_back = call_back || function(){};
				this.dom.alpha.fadeTo(this.set.alphaFadeOutTime, 0, function(){
					$(this).hide();
					call_back.call(_this);
				});
			},
			initAlphaEvt : function(){
				this.dom.alpha.bind("dblclick", $.proxy(this.close, this));
			},
			_init : function(){
				if(this.initOpened){
					if(this.dom.restore.css("display") != "none"){
						this._unbindMax();
						this.restore();
						this.max();
						return;
					};
					return;
				};
				this.initOpened = true;
				this._initUpdateSize();
				
				if(this.set.autoPosition){
					this.autoPosition();
				}else{
					this.position(this.set.left, this.set.top);
				};
				this._binds();
			},
			addIe6PNGCss : function(){
				if(this.set.skin == "simple"){
					var style = [
						"<style id='xdkui-dialog-style-" + this.dialog_id + "' type='text/css'>",
						"#{id} .xdkui-dialog-close {_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{script_dir}skin/ui/" + this.set.skin + "/close-1.png')}",
						"#{id} .xdkui-dialog-close:hover {_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{script_dir}skin/ui/" + this.set.skin + "/close-2.png')}",
						"</style>"
					].join("\n");
					style = render(style, {
						id : this.dialog_id,
						script_dir : script_dir
					});
					$("head").append(style);
				}else if(this.set.skin == "demo"){
					var style = [
						"<style id='xdkui-dialog-style-" + this.dialog_id + "' type='text/css'>",
						"#{id} .xdkui-dialog-close {_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{script_dir}skin/ui/" + this.set.skin + "/close.png')}",
						"</style>"
					].join("\n");
					style = render(style, {
						id : this.dialog_id,
						script_dir : script_dir
					});
					$("head").append(style);
				};
			},
			_setDOM : function(){
				var index = this.index;
				var dom = {};
				dom.container = $("#" + this.dialog_id);
				dom.dialog = dom.container;
				dom.alpha = $("#" + this.dialog_id + "-alpha");
				dom.wraper = dom.container.find(".xdkui-dialog-wraper-" + index);
				dom.border = dom.container.find(".xdkui-dialog-tb-border-" + index);
				dom.inner = dom.container.find(".xdkui-dialog-inner-" + index);
				dom.header = dom.container.find(".xdkui-dialog-header-" + index);
				dom.handle = dom.container.find(".xdkui-dialog-title-" + index);
				dom.title = dom.handle;
				dom.actBar = dom.container.find(".xdkui-dialog-act-bar-" + index);
				dom.close = dom.container.find(".xdkui-dialog-close-" + index);
				dom.min = dom.container.find(".xdkui-dialog-min-" + index);
				dom.max = dom.container.find(".xdkui-dialog-max-" + index);
				dom.restore = dom.container.find(".xdkui-dialog-restore-" + index);
				dom.body = dom.container.find(".xdkui-dialog-body-" + index);
				dom.content = dom.container.find(".xdkui-dialog-c-" + index);
				dom.footer = dom.container.find(".xdkui-dialog-footer-" + index);
				dom.footerRow = dom.container.find(".xdkui-dialog-footer-row-" + index);
				dom.btnBar  = dom.container.find(".xdkui-dialog-btnbar-" + index);
				dom.btnWraper  = dom.container.find(".xdkui-dialog-btnwraper-" + index);
				this.dom = dom;
				
				
			},
			_getContent : function(){
				var content = "";
				var set = this.set;
				if(set.iframeURL){
					content = this._getIframeContent(set.iframeURL);
				}else{
					content = this._getDOMContent(set.content);
				};
				return content;
			},
			// dom content tpl
			_getDOMContent : function(code){
				var tpl = "<div class='xdkui-dialog-c-dom xdkui-dialog-c-dom-{index}' style='padding:{paddding_style};'>{code}</div>";
				return 	render(tpl, {
					code : code,
					index : this.index,
					paddding_style : this.set.padding
				});
			},
			// iframe content tpl
			_getIframeContent : function(url){
				url = getURL(url, {_ : Math.random()});
				return "<iframe class='xdkui-dialog-c-iframe xdkui-dialog-c-iframe-" + this.index + "' frameborder='0' src='" + url + "'></iframe>";
			},
			setTitle : function(title){
				this.dom.handle.html(title + "");
			},
			getTitle : function(){
				return this.dom.handle.html();
			},
			_getIframeDOM : function(){
				return this.dom.content.find(".xdkui-dialog-c-iframe-" + this.index);
			},
			_removeIframeDOM : function(){
				this._getIframeDOM().remove();
			},
			_getContentDOM : function(){
				return this.dom.content.find(".xdkui-dialog-c-dom-" + this.index);
			},
			_removeContentDOM : function(){
				this._getContentDOM().remove();
			},
			setContent : function(content){
				this.setDOMContent(content);
			},
			getContent : function(){
				return this._getIframeDOM().size() > 0 ? this.dom.content.html() : this._getContentDOM().html();
			},
			getSuperContent : function(){
				return this.dom.content.html();
			},
			_setContent : function(content){
				var c = this.dom.content;
				this._removeIframeDOM();
				this._removeContentDOM();
				c.append(content);
				this.updateContainerSize();
				this.autoPosition();
			},
			setDOMContent : function(code){
				this._setContent(this._getDOMContent(code));
			},
			setIframeContent : function(url){
				this._setContent(this._getIframeContent(url));
			},
			setContentIframeURL : function(url){
				this.setIframeContent(url);			
			},
			getContentIframeURL : function(){
				var iframe = this._getIframeDOM();
				return iframe.size() > 0 ? iframe.attr("src") : null;
			},
			_initUpdateSize : function(){
				var dom = this.dom;
				var wraper = dom.wraper;
				var w = wraper[0].offsetWidth;
				var h = wraper[0].offsetHeight;
				this.dataSize = {};
				this.dataSize.w = w - dom.inner.width();
				this.dataSize.h = h - dom.inner.height() + dom.footer.outerHeight() + dom.header.outerHeight() ;
				this.updateContainerSize(); 
			},
			updateContainerSize : function(){
				var dom = this.dom;
				var border = dom.border;
				dom.container.css({
					width : "",
					height : ""
				});
				var w = border[0].offsetWidth;
				var h = border[0].offsetHeight;
				dom.container.css({
					width : w,
					height : h	
				});
				//fix resizeApp minWidth minHeight
				if(this.set.forChangeResizeMinSize){
					this.set.minWidth =  Math.max(w, this.set.minWidth || 0);
					this.set.minHeight =  Math.max(h, this.set.minHeight || 0);
				};
				this.updateResizeApp();
			},
			mainSize : function(w, h){
				//this.show();
				this.size(w - this.dataSize.w, h - this.dataSize.h);
			},	
			/**
			 * set dom.body size
			*/
			size : function(w, h){
			
				var len = arguments.length;
				if(len == 0){
					var _dialog = this.dom.dialog[0];
					var _handle = this.dom.title[0];
					return {
						offsetWidth : _dialog.offsetWidth, 
						offsetHeight : _dialog.offsetHeight,
						innerWidth : this.dom.dialog.innerWidth(),
						innerHeight : this.dom.dialog.innerHeight(),
						mainWidth : this.dom.content.innerWidth(),
						mainHeight : this.dom.content.innerHeight()
					};	
				};			
				//this.show();
				w = Math.max(w, this.set.minWidth - this.dataSize.w );
				h = Math.max(h, this.set.minHeight - this.dataSize.h);
				var dom = this.dom;
				 
				dom.container.css({
					width : (w + this.dataSize.w),
					height : (h + this.dataSize.h + dom.footer.outerHeight())
				});	 
				var _body = dom.body;
				_body.css({
					width : w
				});
				_body.css({
					height : h
				});
				this.updateResizeApp();
			},
			
			updateResizeApp : function(){
				if(this.resizeApp){
					this.resizeApp.updateHandleNodesSize(); 
				};
			},
			_binds : function(){
				this._initDrag();
				this._initResize();
				this._initAlpha();
				this._initActionBar();
			},
			_unbinds : function(){
				var dom = this.dom;
				$(window).unbind("resize", this.win_resize_evt_alpha).unbind("scroll", this.win_scroll_evt_alpha);
				this._unbindMax();
				dom.min.unbind();
				dom.max.unbind();
				dom.restore.unbind();
				dom.close.unbind();
				dom.handle.unbind();
			},
			_initActionBar : function(){
				var _this = this;
				var dom = this.dom;
				dom.min.bind("mousedown", function(e){
					e.stopPropagation();
				}).bind("click", function(e){
					e.preventDefault();
					_this.min();
				});
				dom.max.bind("mousedown", function(e){
					e.stopPropagation();
				}).bind("click", function(e){
					e.preventDefault();
					_this.max();
				});
				dom.restore.bind("mousedown", function(e){
					e.stopPropagation();
				}).bind("click", function(e){
					e.preventDefault();
					_this.restore();
				});
				dom.close.bind("mousedown", function(e){
					e.stopPropagation();
				}).bind("click", function(e){
					e.preventDefault();
					_this.close();
				});
				dom.handle.bind("dblclick", function(e){	
					if(_this.set.max){
						if(_this.isMaxed()){
							_this.restore(); 
						}else{
							_this.max(); 
						};
					};
					 
				});
			},
			_removeAlphaExpression : function(){
				if(!ie6){
					return;
				};
				var style = this.dom.alpha[0].style;
				style.removeExpression('left');
				style.removeExpression('top');
			},
			_initShowAlpha : function(){
				if(this.set.alphaFix){
					this.showAlphaContainer();
				};
			},
			_resizeAlpha : function(){
				var set = this.set;
				var size = _winSize();
				this.dom.alpha.css({
					height : size.window_h + "px"
				});
			},
			_initAlpha : function(){
				this._initShowAlpha();
				$(window).bind("resize", $.proxy(this.win_resize_evt_alpha, this)).bind("scroll", $.proxy(this.win_scroll_evt_alpha, this));
				this.set.events.alphaCreated.call(this, this);
			},
			win_resize_evt_alpha : function(){
				this._resizeAlpha();
			},
			win_scroll_evt_alpha : function(){
				this._resizeAlpha();
			},
			_initDrag : function(){
				var _this = this;
				this.dragApp = draggable.getInstance({
					container : this.dom.container,
					handle : this.dom.header,
					iframeFix : true,
					xDrag : this.set.draggable,
					yDrag : this.set.draggable,
					cursor : this.set.dragCursor,
					events : {
							dragstart : function(){
								_this._fixCurrentDialog();						
							},
							dragstop : function(){
								//_this._removeSiblingsAlpha();
							}
					}
				});
			},
			_fixCurrentDialog : function(){
				this.dragApp.updateZIndex();
				var id = this.id;
				$.each(XDK.ui.dialog.DIALOG_LIST, function(a, b){
					if(this.id != id){
						this.dragApp.showAlpha();
						this.dragApp.alphaFix();
					};
				});
				this.set.events.currentdialog.call(this, this);
			},			
			_removeSiblingsAlpha : function(){
				var id = this.id;
				$.each(XDK.ui.dialog.DIALOG_LIST, function(a, b){
					if(this.id != id){
						this.dragApp.hideAlpha();
					};
				});
				
			},
			_getWindowSize_ : _winSize, 	
			containerResizeCallBack : function(){
				var dom = this.dom;
				var dataSize = this.dataSize;
				dom.body.css({
					width : 0,
					height : 0
				}).css({
					width : dom.container.width() - dataSize.w,
					height : dom.container.height() - dataSize.h
				});
			},
			_initResize : function(){
				var _this = this;
				var set = _this.set;
				var dom = this.dom;
				if(!set.resizable){
					return;
				};
				this.resizeApp = resizable.getInstance({
					container : dom.container,
					minWidth: set.minWidth,
					minHeight: set.minHeight,
					maxWidth: set.maxWidth,
					maxHeight: set.maxHeight,
					events : {
						resizestart : function(e, _self, type, node){
							this.set.minWidth = set.minWidth;
							this.set.minHeight = set.minHeight;
							_this.dragApp.showAlpha();
							_this.dragApp.alphaFix();
							_this._fixCurrentDialog();
							
						},
						beforeresize : function(e, _self, type, node){},
						resize : function(e, _self){
							_this.dragApp.alphaFix();
							_this.containerResizeCallBack();
							
						},
						resizestop : function(e, _self){
							_this.dragApp.hideAlpha();
							//_this._removeSiblingsAlpha();
						}
					}
				});
			},
			position : function(left, top){
				this._position({
					left : left,
					top : top
				});
			},
			_position : function(position){
				var pos = $.extend({
					left : "auto",
					top : "auto"
				}, position);
				position = this._getPositon(pos.left, pos.top);
				
				this.setContainerPosition(position.left, position.top);
			},
			setContainerPosition :  function(left, top){
				this.dom.container.css({
					left : left,
					top : top
				});
			},
			_getPositon : function(left, top){
				var pos = {
					left : 0,
					top : 0
				};	
				var size = _winSize();
				var container = this.dom.container;
				var dialog_width = container.outerWidth();
				var dialog_height = container.outerHeight();
				 
				if(left == "auto"){
					left = size.l + (size.window_w - dialog_width) / 2;
				}else{
					left = parseInt(left);
				};
				if(top == "auto"){
					top = size.t + (size.window_h - dialog_height) / 2;
				}else{
					top = parseInt(top);
				};
				
				var offset = $(this.set.appendTo).offset(); 
				 
				pos.left = left  - offset.left;
				pos.top = top  - offset.top;
				return pos;
			},
			autoPosition : function(){
				this.position("auto", "auto");
			},
			open : function(){
				if(this.initOpened){
					return;
				};
				var beforeOpenRs = this.set.events.beforeopen.call(this, this, _winSize);
				if(beforeOpenRs === false){
					return false;
				};
				this.show();
				this.set.events.open.call(this);
				
			},
			show : function(){
				this.dom.container.show();
				
				if(this.initOpened){
					this._initShowAlpha();
					this.dragApp.updateZIndex();
				};
				this._init();
				var dom = this.dom;
				if(this.set.enterToClose){
					setTimeout(function(){
						try{
							dom.close.trigger("focus");
						}catch(e){
						
						};
					}, 0);
				};
				this.set.events.show.call(this, this);
			},
			hide : function(){
				this.dialogState = "hide"; 
				this.dom.container.hide();
				this.hideAlphaContainer();
				this.set.events.min.call(this, this);
			},
			toggle : function(){
				if(this.dom.container.css("display") == "none"){
					this.show();
				}else{
					this.hide();
				};
				
			},
			isNormal : function(){
				return this.dialogState == "normal";
			},
			isHided : function(){
				return this.dialogState == "hide";
			},
			isMaxed : function(){
				return this.dialogState == "max";
			},
			isRestored : function(){
				return this.dialogState == "restore";
			},
			max : function(){
				var dom = this.dom;
				if(this.isMaxed() || dom.restore.css("display") != "none"){
					this.show();
					return;
				};
				if(this.isHided() && dom.restore.css("max") != "none"){
					this.show();
				};
				this.dialogState = "max";
				this.setTempDataBeforeMax();
				dom.max.hide();
				dom.restore.show();
				if(this.set.resizable){
					this.resizeApp.hide();
				};
				this.dragApp.disable();
				this.full();
				this.fixed();
				this._bindMax();
				this.set.events.max.call(this, this);
				 
			},
			_bindMax : function(){
				this._unbindMax();
				$(window).bind("resize", $.proxy(this._win_resize_evt_max, this));
				$(window).bind("scroll", $.proxy(this._win_scroll_evt_max, this));
			},
			_unbindMax : function(){
				$(window).unbind("resize", this._win_resize_evt_max);
				$(window).unbind("scroll", this._win_scroll_evt_max);
			},
			full : function(){
				var size = _winSize();
				this.mainSize(size.window_w, size.window_h);
			},
			_win_resize_evt_max : function(){
				if(this.isMaxed()){
					this.full();
				};
			},
			_win_scroll_evt_max : function(){
				if(this.isMaxed()){
					this.full();
				};
			},
			fixed : function(){
				var p = $(this.set.appendTo);
				var offset = p.offset();
				var size = _winSize();
				this.setContainerPosition(- offset.left + size.l, - offset.top);
				this.dom.container.addClass(fixedClass);
			},
			removeFixed : function(){
				if(this.set.appendTo == "body"){
					this.dom.container.removeClass(fixedClass).css({width : "", height : ""});
					if(ie6){	
						this._removeExpressionForDialog();
					};
				};
			}, 
			_removeExpressionForDialog : function(){
				//if(ie6){
					var style = this.dom.container[0].style;
					style.removeExpression('left');
					style.removeExpression('top');
				//};
			},
			setTempDataBeforeMax : function(){
				var data = {};
				var dom = this.dom;
				var _this = this;
				var container = dom.container;
				data.left = container.css("left");
				data.top = container.css("top");
				data.width = parseInt(container.css("width"));
				data.height = parseInt(container.css("height"));
				this.tempDataBeforeMax = data;
			},
			restore : function(){
				 
				this.dialogState = "restore";
				var dom = this.dom;
				this.removeFixed();
				this.setContainerPosition(this.tempDataBeforeMax.left, this.tempDataBeforeMax.top);
				this.mainSize(this.tempDataBeforeMax.width, this.tempDataBeforeMax.height); 
				dom.restore.hide();
				dom.max.show();
				if(this.set.resizable){
					this.resizeApp.show();
				};
				this.dragApp.removeDisable();
				if(this.dom.container.css("display") == "none"){
					this.show();
				};
				this.set.events.restore.call(this, this);
			},
			min : function(){
				this.hide();
			},
			close : function(){
				this.destroy();
			},
			destroy : function(){
				var beforeclosers = this.set.events.beforeclose.call(this, this);
				if(beforeclosers === false){
					return;
				};
				this.dialogState = "close";
				this.dragApp.destroy();
				if(this.resizeApp){
					this.resizeApp.destroy();
				};
				this._unbinds();
				this._removeAlphaExpression();
				this.dom.content.find("iframe").remove();
				this.dom.container.remove();
				this.hideAlphaContainer(function(){
					this.dom.alpha.remove();
				});
				delete DIALOG_LIST[this.id];
				this.set.events.close.call(this, this);
			}
		});
		return _class_;
	});
})(XDK, jQuery);

/**
 * 预缓存dialog背景图片
*/
$(function(){
	
	XDK.ui.dialog.getInstance({
		enterToClose : false,
		id : "_INITCACHEIMGDIALOG_",
		width : 100,
		height : 100,
		autoPosition : false,
		left : "-9999px",
		top : "-9999px",
		title : "测试标题",
		content : "测试内容",
		buttons : [
			{text : "确定", focusStyle : true},
			{text : "取消"}
		],
		events : {
			init : function(){
				//var _this = this;
				//_this.close();
			}
		}
	});
});

/**
 * @description {Function} XDK.dialog.alert(msg, fn) - 警告框 
 * @param {String} msg - 警告内容
 * @param {Function} fn - 按下确定后的操作
*/
XDK.register("ui.dialog.alert", function(J){
	return function(msg, fn){
		fn = fn || function(){};
		var id = "_ALERT_";
		var dialog = XDK.ui.dialog.DIALOG_LIST[id];
		if(dialog){
			dialog.show();
			dialog.setContent(msg);
			return dialog;
		};
		return XDK.ui.dialog.getInstance({
			id : id,
			alphaFix : true,
			alphaOpacity : 0.2,
			minWidth : 150,
			minHeight : 50,
			//width : 200,
			title : "提示",
			enterToClose : false,
			content : "<div style='text-align:left;'>" + msg + "</div>",
			buttons : [
				{text : "确定", focus : "focus", focusStyle : true, click : function(a, b){
					b.close();
					fn.call(b, b);
					return false;
				}}
			],
			events : {
				close : function(){
					//fn.call(this, this);
				}
			} 
			 
		});
	};
});


/**
 * @description {Function}  XDK.dialog.confirm(msg, fn_ok, fn_cancel) - 确认框
 * @param {String} msg - 描述文本
 * @param {Function} fn_ok - 按下确定的操作
 * @param {Function} fn_cancel - 按下取消的操作
*/
XDK.register("ui.dialog.confirm", function(J){
	return function(msg, fn_ok, fn_cancel){
		fn_ok = fn_ok || function(){};
		fn_cancel = fn_cancel || function(){};
		var id = "_CONFIRM_";
		var dialog = XDK.ui.dialog.DIALOG_LIST[id];
		if(dialog){
			dialog.show();
			return dialog;
		};
		return XDK.ui.dialog.getInstance({
			id : id,
			resizable : false,
			alphaFix : true,
			alphaOpacity : 0.1,
			enterToClose : false,
			width : 300,
			//height : 50,
			title : "提示",
			content : "<div style='text-align:left;'>" + msg + "</div>",
			buttons : [
				{
					text : "确定", 
					focus : true, 
					focusStyle : true, 
					click : function(a, b){
						b.close();
						fn_ok.call(b, b);	
					}
				},
				{
					text : "取消", 
					click : function(a, b){
						b.close();
						fn_cancel.call(b, b);	
					}
				}
			]
		});
	};
});

/**
 * @description {Function} XDK.dialog.prompt(tips, fn_ok, fn_cancel) - 输入框
 * @param {String} tips 提示内容
 * @param {Function} fn_ok 按下确定后的的操作
 * @param {Function} fn_cancel 按下取消后的的操作
*/
XDK.register("ui.dialog.prompt", function(J){
	return function(tips, fn_ok, fn_cancel, fn_null){
		fn_ok = fn_ok || function(){};
		fn_cancel = fn_cancel || function(){};
		fn_null = fn_null || function(b){return false};
		var id = "_PROMPT_";
		var dialog = XDK.ui.dialog.DIALOG_LIST[id];
		if(dialog){
			dialog.show();
			return dialog;
		};
		return XDK.ui.dialog.getInstance({
			id : id,
			resizable : false,
			alphaFix : true,
			alphaOpacity : 0.1,
			title : "提示",
			content : "<div style='padding:0 0 10px 0;text-align:left;'>" + tips + "</div><div><form onsubmit='return false;'><input class='ui-prompt-input' type='text' style='display:block;width:260px;padding:0 10px;height:50px;resize:none;border:1px solid #ccc;height:30px;line-height:30px;'  /></form></div>",
			buttons : [
				{
					text : "确定", 
					 
					focusStyle : true, 
					click : function(a, b){
						var v = $.trim(b.dom.content.find(".ui-prompt-input").eq(0).val());
						if(v == ""){
							var rs = fn_null.call(b, b);
							if(rs !== false){
								fn_ok.call(b, v,  b);	
								b.close();
							};
						}else{
							fn_ok.call(b, v,  b);	
							b.close();
						};
						return false;
					}
				},
				{
					text : "取消", 
					click : function(a, b){
						b.close();
						fn_cancel.call(b, b);	
						return false;
					}
				}
			],
			events : {
				init : function(){
					var _this = this;
					var input = this.dom.content.find(".ui-prompt-input").eq(0);
					input.bind("keydown", function(e){
						if(e.keyCode == 13){
							e.preventDefault();
							_this.getBtnByText("确定").trigger("click");
						};
					});
					setTimeout(function(){
						try{
							input.trigger("focus");
						}catch(e){
						};
					},0);
				},
				beforeclose : function(){
					this.dom.content.find(".ui-prompt-input").eq(0).unbind(); 
				}
			}
		});
	};
});

/**
 * @description {Function} XDK.ui.dialog.tips(tips, time) - TIPS提醒;
 * @param {String} tips - 提醒内容
 * @param {Number} time - 定时关闭时间（为null则不做定时关闭）
*/
XDK.register("ui.dialog.tips", function(J){
	return function(tips, time){
		//time为null，则不添加定时关闭功能
		time = typeof(time) == "undefined" ? 1 : time;
		return XDK.ui.dialog.getInstance({
			showHandleBar : false,
			content : tips,
			resizable : false,
			draggable : false,
			events : {
				beforeopen : function(){
					this.dom.inner.css({
						"border-radius" : "5px"
					});
				},	
				init : function(){
					
					var _this = this;
					
					if(time != null){
						setTimeout(function(){
							 
							_this.close();
						}, time * 1000);
					};
				}
			}
		});
	};
}); 
