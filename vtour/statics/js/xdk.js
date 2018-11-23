/**
 * 前端UI框架 - XDK
 * By Jacky.Wei
 
 * updated 2013-10-16
	[update] core.json
	[delete] core.arr.tree2list
	[delete] core.arr.list2tree
	[add] core.tree
*/

 
;(function(window) {
	
	if(typeof(window.XDK) != "undefined"){
		return;
	};
	if(!window.console){
		window.console = {
			log : function(a){}	
		};	
	};
	var opt = Object.prototype.toString;
	var XDK = (function() {
		var J = {};
		var K = [];
		J.inc = function(M, L) {
			return true
		};
		J.register = function(N, L) {
			var P = N.split(".");
			var O = J;
			var M = null;
			while (M = P.shift()) {
				if (P.length) {
					if (O[M] === undefined) {
						O[M] = {}
					}
					O = O[M]
				} else {
					if (O[M] === undefined) {
						try {
							O[M] = L(J)
						} catch (Q) {}
					}
				}
			}
		};
		J.regShort = function(L, M) {
			if (J[L] !== undefined) {
				throw "[" + L + "] : short : has been register"
			}
			J[L] = M
		};
		J.IE = /msie/i.test(navigator.userAgent);
		J.E = function(L) {
			if (typeof L === "string") {
				return document.getElementById(L)
			} else {
				return L
			}
		};
		J.C = function(L) {
			var M;
			L = L.toUpperCase();
			if (L == "TEXT") {
				M = document.createTextNode("")
			} else {
				if (L == "BUFFER") {
					M = document.createDocumentFragment()
				} else {
					M = document.createElement(L)
				}
			}
			return M
		};
		J.getType = function(a){
			var ret;
			var l = arguments.length;
			if (l === 0 || typeof(a) === "undefined") {
				ret = "undefined"
			} else {
				ret = (a === null) ? "null": opt.call(a)
			};
			return ret
		};
		
		//对数组或对象 遍历
		J.each = function(a, fn) {
			a = a || null;
			fn = fn || function() {};
			if (a === null) {
				return
			};
			if (opt.call(a) === "[object Array]") {
				var i = 0,
				l = a.length;
				for (; i < l; i++) {
					var rs = fn.call(a[i], i, a[i]);
					if(rs === false){
						break;
					};
				}
			} else {
				if (a.length > 0) {
					var i = 0,
					l = a.length;
					for (; i < l; i++) {
						var rs = fn.call(a[i], i, a[i]);
						if(rs === false){
							break;
						};
					}
				} else {
					for (var key in a) {
						var rs = fn.call(a[key], key, a[key]);
						if(rs === false){
							break;
						};
					}
				}
			}
		};
		
		J.type = {
			is_array : function(a){
				return J.getType(a) === "[object Array]";
			},
			is_string : function(a){
				return J.getType(a) === "[object String]";
			},
			is_number : function(a){
				return J.getType(a) === "[object Number]";
			},
			is_object : function(a){
				return J.getType(a) === "[object Object]";
			},
			is_function : function(a){
				return J.getType(a) === "[object Function]";
			},
			is_null : function(a){
				return J.getType(a) === "null";
			},
			is_undefined : function(a){
				 return J.getType(a) === "undefined";
			}
		};
		
		J.extend = function(a, b){
			var ret = {};
			var argLen = arguments.length;
			if (argLen === 1) {
				ret = a
			};
			if (argLen === 2) {
				var _index = 0;
				if (J.type.is_object(b)) {
					J.each(b, 
					function() {
						_index++;
					})
				};
				if (_index === 0) {
					ret = a;
				};
				if (_index > 0) {
					for(var key in a){
						ret[key] = a[key];
					};
					for(var key in b){
						ret[key] = b[key];
					};
				};
			};
			return ret
		};
		
		J.widget = {};
		return J;
	})();
	
	
	XDK.register("core.obj.len", function(J) {
		return function(obj){
			var len = 0;
			J.each(obj, function(key, value){
				len += 1;
			});
			return len;
		};
	});
	
	XDK.register("core.str.trim", function(J) {
		return function(N) {
			if (typeof N !== "string") {
				throw "trim need a string as parameter"
			}
			var K = N.length;
			var M = 0;
			var L = /(\u3000|\s|\t|\u00A0)/;
			while (M < K) {
				if (!L.test(N.charAt(M))) {
					break
				}
				M += 1
			}
			while (K > M) {
				if (!L.test(N.charAt(K - 1))) {
					break
				}
				K -= 1
			}
			return N.slice(M, K)
		}
	});
	
	
	//根据模板字符串和数据对象(对象或数组)返回html
	XDK.register("core.str.render", function(J) {
		return function(tpl, data){
			var __self = arguments.callee;
			if(J.type.is_array(data)){
				var ret = "";
				J.each(data, function(key, obj){
					ret += __self(tpl, obj);
				});
				return ret;
			}else if(J.type.is_object(data)){
				J.each(data, function(key, value){
					tpl = eval("tpl.replace(/{" + key + "}/g, value)");
				});
				return tpl;
			}else{
				return null;
			};
		};
		
	});

	XDK.register("core.str.len", function(J) {
		return function(s){
			return s.replace(/[^\x00-\xff]/g, "ss").length;
		};
	});
	
	XDK.register("core.str.guid", function(J) {
		return function(){
			var guid = "";
			for (var i = 1; i <= 32; i++){
			  var n = Math.floor(Math.random()*16.0).toString(16);
			  guid +=   n;
			  if((i==8)||(i==12)||(i==16)||(i==20))
				guid += "-";
			}
			return guid;    
		};
	});
	
	XDK.register("core.str.subString", function(J){
		return function(str, len, hasDot){
			var newLength = 0; 
			var newStr = ""; 
			var chineseRegex = /[^\x00-\xff]/g; 
			var singleChar = ""; 
			var strLength = str.replace(chineseRegex,"**").length; 
			for(var i = 0;i < strLength;i++) 
			{ 
				singleChar = str.charAt(i).toString(); 
				if(singleChar.match(chineseRegex) != null) 
				{ 
					newLength += 2; 
				}     
				else 
				{ 
					newLength++; 
				} 
				if(newLength > len) 
				{ 
					break; 
				} 
				newStr += singleChar; 
			} 
			 
			if(hasDot && strLength > len) 
			{ 
				newStr += "..."; 
			} 
			return newStr; 
		};
	});
	
	XDK.register("core.str.getParam", function(J){
		var query = window.location.search != "" ? window.location.search.slice(1) : "";
		var GET = {};
		(function(){
			if(query == ""){
				return;
			};
			var arr = query.split(/&/);
			J.each(arr, function(i, v){
				if(v != ""){
					var o = v.split(/=/);
					if(o.length == 2){
						var key = o[0];
						var value = o[1];
						GET[key] = value;
					}else if(o.length == 1){
						var key = o[0];
						GET[key] = undefined;
					};
				};
			});
		})();
		return function(param){
			return typeof(GET[param]) != "undefined" ? GET[param] : undefined;
		};
	});
	
	
	//路由封装（获取域名）
	XDK.register("core.router", function(J) {
		return {
			//获取顶级域名
			getDomain : function(domain){
				domain = domain || window.location.host;
				var pat = /^www\.(\.+)/;
				var _match = domain.match(pat);
				if(_match !== null){
					return _match[1]; 
				};
				var ret = domain;
				var ext = ["com\.cn","net\.cn","org\.cn","gov\.cn","com\.hk","com","net","org","int","edu","gov","mil","arpa","Asia","biz","info","name","pro","coop","aero","museum","ac","ad","ae","af","ag","ai","al","am","an","ao","aq","ar","as","at","au","aw","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca","cc","cf","cg","ch","ci","ck","cl","cm","cn","co","cq","cr","cu","cv","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","es","et","ev","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gh","gi","gl","gm","gn","gp","gr","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","in","io","iq","ir","is","it","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","ml","mm","mn","mo","mp","mq","mr","ms","mt","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nt","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","pt","pw","py","qa","re","ro","ru","rw","sa","sb","sc","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","st","su","sy","sz","tc","td","tf","tg","th","tj","tk","tm","tn","to","tp","tr","tt","tv","tw","tz","ua","ug","uk","us","uy","va","vc","ve","vg","vn","vu","wf","ws","ye","yu","za","zm","zr","zw"];
				var i = 0, l = ext.length;
				
				for(; i < l; i++){
					var val = ext[i];
					var expObj = null;
					eval("expObj = /^((([\\w\\-])+\\.)+)(" + val + ")((\\:\\d{1,})){0,1}$/");
					var _tempMatch = domain.match(expObj);
					var test = expObj.test(domain);
					
					if(_tempMatch != null){
						 	
						if(_tempMatch.length === 7){	
						
							var domainExt = _tempMatch[4];
							
							var preFix = _tempMatch[1].replace(/(\.+)$/g, "");
							var preFixArr = preFix.split(".").reverse();
							ret = preFixArr[0] + "." + domainExt;
							break;
						};
					};
				};
				return ret;
			},
			//获取带http://的顶级域名
			getDomainByHttp : function(addSplit){
				addSplit = arguments.length > 0 ? addSplit : false;
				return "http://" + this.getDomain() + (addSplit ? "/" : "");
			},
			getParam : function(param){
				return this.params()[param];
			},
			
			params : function(url){
				var GET = {}; 
				var query = "";
				var defaultQuery = window.location.search;
				var queryArr = [];
				if(url){
					var o = url.split("?");
					if(o.length ==  2){
						query = "?" + o[1];
					};
				};
				if(url){
					if(query != ""){
						queryArr = query.slice(1).split("&");
					};
				}else{
					queryArr = defaultQuery ? defaultQuery.slice(1).split("&") : [];
				};
				var i = 0, l = queryArr.length;
				for(; i < l; i++){
					var arr = queryArr[i].split("=");
					var key = arr[0];
					var val = arr[1];
					GET[key] = val;
				};
				return GET;
			},
			
			paramsLen : function(){
				var ret = 0, params = this.params();
				for(var key in params){
					ret++;
				};
				return ret;
			},
			
			getURL : function(url, param_data){
				param_data = param_data || {};
				var preFixParam = {};
				var url_explode = url.split("?");
				var _url = url_explode.length > 1 ? url_explode[0] : url; 
				if(url_explode.length > 1){
					var _params = url_explode[1];
					var _arr = _params.split("&");
					J.each(_arr, function(i, v){
						var _o = v.split("=");
						preFixParam[_o[0]] = _o[1];
					});
				};
				J.each(preFixParam, function(k, v){
					if(typeof(param_data[k]) == "undefined"){
						param_data[k] = v;
					};
				});
				
				var params = "";
				J.each(param_data, function(key, value){
					params += key + "=" + value + "&";
				});
				if(params != ""){
					params = params.slice(0, -1);
				};
				
				return (params != "") ? (_url + "?" + params) :  _url;
			},
			
			/** 解析路径到路由对象	
			 *===
			 @param routerObject = {
				"<__module__:\\w+>/<__controller__:\\w+>/<__action__:\\w+>" : {
						module : "<__module__>",
						controller : "<__controller__>",
						action : "<__action__>"
				}
			 };
			 @param 	hash = "a/b/c?d=1&e=2"
			 @return  	
						{
							module: "a", 
							controller : "b", 
							aciton : "c", 
							params : {
								d : "1",
								e : "2"	
							}  
						}
			 
			*/
			parseHash2Router : function(routerObject, hash, hideParamsAttr){
				var _this = this;
				var r = null;
				var hash2arr = hash.split("?");
				var _params = this.params(hash);
				var isReg1 = /\<([^\>]+)\>/;
				hideParamsAttr = typeof(hideParamsAttr) == "undefined" ? true : hideParamsAttr;
				if(hash2arr.length > 0){
					hash = hash2arr[0].replace(/^\/+/g, "").replace(/\/+$/g, "");
				};
				
				J.each(routerObject, function(k, v){
					var file = k.replace(/^\/+/g, "").replace(/\/+$/g, "");
					var fileArr = file.split(/\//);
					var isRegPat = /^\<(.+)\:(.+)\>$/;
					var params = {};
					var reStr = "";	
					reStr = file.replace(/\<([^\>]+)\>/g, function(a, b){
						var key = b.split(":")[0]; 
						var v = b.split(":")[1];
						params[key] = "";
						return 	"(" + v + ")";
					});
					 
					var reg = new RegExp("^" + reStr + "$");
					
					var rs = hash.match(reg);
					 
					if(rs != null){
						var createURL = v.createURL || function(_router_){
							var data = [];
							if(_router_){
								if(_router_.module){
									data.push(_router_.module);
								};
								if(_router_.controller){
									data.push(_router_.controller);
									if(_router_.action){
										data.push(_router_.action);
									};
								};
							};
							return data.length > 0 ? data.join("/") : null;
						};	

						
						r = {
							controller : null,
							action : null,
							module : null
						};
						J.each(v, function(a, b){
							r[a] = b;
						});	
						var data = rs.slice(1); 
						var objLen = -1;
						J.each(params, function(t, o){
							objLen += 1;
							params[t] = data[objLen];
						});
						 
						if(v.params){
							J.each(v.params, function(a, b){
								params[a] = b;
							});
						};
						r.params = J.extend(_params, params);
						
						J.each(v, function(a, b){
							if(J.core.arr.inArray(a, ["controller", "action", "module"])){
								if(b != null){
									var matchRs = b.match(isReg1);
									if(matchRs != null){
										if(matchRs.length > 1){
											var key = matchRs[1];
											if(typeof(r.params[key]) != "undefined"){
												r[a] = r.params[key];
											};
										};
									}else{
										r[a] = b;
									};
								};
							};
						});
						
						var targetParams = {};
						J.each(r.params, function(a, b){
							if(!J.core.arr.inArray(a, ["__controller__", "__action__", "__module__"])){
								targetParams[a] = b;
							};
						});
						
					 
						r.url = _this.getURL((createURL(r) ? createURL(r) : hash), targetParams);
						r.router = (function(_router_){
							var data = [];
								if(_router_.module){
									data.push(_router_.module);
								};
								if(_router_.controller){
									data.push(_router_.controller);
									if(_router_.action){
										data.push(_router_.action);
									};
								};
							return data.length > 0 ? data.join("/") : null;
						})(r);
						
						r.routerId = (function(routerObj){
							var rs = [];
							if(routerObj.module){
								rs.push(routerObj.module);
							};
							if(routerObj.controller){
								rs.push(routerObj.controller);
							};
							if(routerObj.action){
								rs.push(routerObj.action);
							};
							J.each(routerObj.params, function(a, b){
								if(!J.core.arr.inArray(a, ["__controller__", "__action__", "__module__", "_tabtitle"])){
									rs.push(hideParamsAttr ? b : a + "-" + b);
								};
							});
							
							return rs.join("-");
						})(r);
						
						delete r.params.__controller__;
						delete r.params.__action__;
						delete r.params.__module__;
						return false;
					};	
					 
				});
				return r;
			}
			
		};
		
		
	});
	
	//json封装	
	XDK.register("core.json", function(J){
		return (function(){
			function f(n) {
				return n < 10 ? '0' + n : n
			}
			 
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
				escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
				gap, indent, meta = {
					'\b': '\\b',
					'\t': '\\t',
					'\n': '\\n',
					'\f': '\\f',
					'\r': '\\r',
					'"': '\\"',
					'\\': '\\\\'
				},
				rep;

			function quote(string) {
				escapable.lastIndex = 0;
				return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
					var c = meta[a];
					return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
				}) + '"' : '"' + string + '"'
			}
			function str(key, holder) {
				var i, k, v, length, mind = gap,
					partial, value = holder[key];
				if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
					value = value.toJSON(key)
				}
				if (typeof rep === 'function') {
					value = rep.call(holder, key, value)
				}
				switch (typeof value) {
				case 'string':
					return quote(value);
				case 'number':
					return isFinite(value) ? String(value) : 'null';
				case 'boolean':
				case 'null':
					return String(value);
				case 'object':
					if (!value) {
						return 'null'
					}
					gap += indent;
					partial = [];
					if (Object.prototype.toString.apply(value) === '[object Array]') {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null'
						}
						v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
						gap = mind;
						return v
					}
					if (rep && typeof rep === 'object') {
						length = rep.length;
						for (i = 0; i < length; i += 1) {
							k = rep[i];
							if (typeof k === 'string') {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v)
								}
							}
						}
					} else {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v)
								}
							}
						}
					}
					v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
					gap = mind;
					return v
				}
			}
			if(typeof JSON !== 'object'){
				return {
					encode : function(value, replacer, space){
						var i;
						gap = '';
						indent = '';
						if (typeof space === 'number') {
							for (i = 0; i < space; i += 1) {
								indent += ' '
							}
						} else if (typeof space === 'string') {
							indent = space
						}
						rep = replacer;
						if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
							throw new Error('JSON.stringify')
						}
						return str('', {
							'': value
						})
					
					},
					decode : function(text, reviver){
						var j;

						function walk(holder, key) {
							var k, v, value = holder[key];
							if (value && typeof value === 'object') {
								for (k in value) {
									if (Object.prototype.hasOwnProperty.call(value, k)) {
										v = walk(value, k);
										if (v !== undefined) {
											value[k] = v
										} else {
											delete value[k]
										}
									}
								}
							}
							return reviver.call(holder, key, value)
						}
						text = String(text);
						cx.lastIndex = 0;
						if (cx.test(text)) {
							text = text.replace(cx, function(a) {
								return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
							})
						}
						if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
							j = eval('(' + text + ')');
							return typeof reviver === 'function' ? walk({
								'': j
							}, '') : j
						}
						throw new SyntaxError('JSON.parse')
					}
					
				};
			}else{
				return {
					encode : JSON.stringify,
					decode : JSON.parse
				};
			};
		})();
	
	});
	
	XDK.register("core.md5", function(J){
		/*
		 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
		 * Digest Algorithm, as defined in RFC 1321.
		 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
		 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
		 * Distributed under the BSD License
		 * See http://pajhome.org.uk/crypt/md5 for more info.
		 */

		/*
		 * Configurable variables. You may need to tweak these to be compatible with
		 * the server-side, but the defaults work in most cases.
		 */
		var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
		var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
		var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

		/*
		 * These are the functions you'll usually want to call
		 * They take string arguments and return either hex or base-64 encoded strings
		 */
		function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
		function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
		function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
		function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
		function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
		function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

		/*
		 * Perform a simple self-test to see if the VM is working
		 */
		function md5_vm_test()
		{
		  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
		}

		/*
		 * Calculate the MD5 of an array of little-endian words, and a bit length
		 */
		function core_md5(x, len)
		{
		  /* append padding */
		  x[len >> 5] |= 0x80 << ((len) % 32);
		  x[(((len + 64) >>> 9) << 4) + 14] = len;

		  var a =  1732584193;
		  var b = -271733879;
		  var c = -1732584194;
		  var d =  271733878;

		  for(var i = 0; i < x.length; i += 16)
		  {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;

			a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
			d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
			b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
			d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
			c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
			d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
			d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

			a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
			d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
			c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
			b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
			d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
			c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
			d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
			c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
			a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
			d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
			c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
			b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
			d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
			b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
			d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
			c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
			d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
			a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
			d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
			b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
			d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
			c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
			d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
			d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
			a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
			d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
			b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		  }
		  return Array(a, b, c, d);

		}

		/*
		 * These functions implement the four basic operations the algorithm uses.
		 */
		function md5_cmn(q, a, b, x, s, t)
		{
		  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
		}
		function md5_ff(a, b, c, d, x, s, t)
		{
		  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		function md5_gg(a, b, c, d, x, s, t)
		{
		  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		function md5_hh(a, b, c, d, x, s, t)
		{
		  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
		}
		function md5_ii(a, b, c, d, x, s, t)
		{
		  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
		}

		/*
		 * Calculate the HMAC-MD5, of a key and some data
		 */
		function core_hmac_md5(key, data)
		{
		  var bkey = str2binl(key);
		  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

		  var ipad = Array(16), opad = Array(16);
		  for(var i = 0; i < 16; i++)
		  {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		  }

		  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
		  return core_md5(opad.concat(hash), 512 + 128);
		}

		/*
		 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
		 * to work around bugs in some JS interpreters.
		 */
		function safe_add(x, y)
		{
		  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		  return (msw << 16) | (lsw & 0xFFFF);
		}

		/*
		 * Bitwise rotate a 32-bit number to the left.
		 */
		function bit_rol(num, cnt)
		{
		  return (num << cnt) | (num >>> (32 - cnt));
		}

		/*
		 * Convert a string to an array of little-endian words
		 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
		 */
		function str2binl(str)
		{
		  var bin = Array();
		  var mask = (1 << chrsz) - 1;
		  for(var i = 0; i < str.length * chrsz; i += chrsz)
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
		  return bin;
		}

		/*
		 * Convert an array of little-endian words to a string
		 */
		function binl2str(bin)
		{
		  var str = "";
		  var mask = (1 << chrsz) - 1;
		  for(var i = 0; i < bin.length * 32; i += chrsz)
			str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
		  return str;
		}

		/*
		 * Convert an array of little-endian words to a hex string.
		 */
		function binl2hex(binarray)
		{
		  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		  var str = "";
		  for(var i = 0; i < binarray.length * 4; i++)
		  {
			str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
				   hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
		  }
		  return str;
		}

		/*
		 * Convert an array of little-endian words to a base-64 string
		 */
		function binl2b64(binarray)
		{
		  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		  var str = "";
		  for(var i = 0; i < binarray.length * 4; i += 3)
		  {
			var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
						| (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
						|  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
			for(var j = 0; j < 4; j++)
			{
			  if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
			  else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
			}
		  }
		  return str;
		};
		return hex_md5;
	});
	
	XDK.register("core.base64", function(J){
		var Base64 = {
			_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			encode: function(input) {
				var output = "";
				var chr1,
				chr2,
				chr3,
				enc1,
				enc2,
				enc3,
				enc4;
				var i = 0;
				input = Base64._utf8_encode(input);
				while (i < input.length) {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);
					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;
					if (isNaN(chr2)) {
						enc3 = enc4 = 64
					} else if (isNaN(chr3)) {
						enc4 = 64
					}
					output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4)
				}
				return output
			},
			decode: function(input) {
				var output = "";
				var chr1,
				chr2,
				chr3;
				var enc1,
				enc2,
				enc3,
				enc4;
				var i = 0;
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
				while (i < input.length) {
					enc1 = this._keyStr.indexOf(input.charAt(i++));
					enc2 = this._keyStr.indexOf(input.charAt(i++));
					enc3 = this._keyStr.indexOf(input.charAt(i++));
					enc4 = this._keyStr.indexOf(input.charAt(i++));
					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;
					output = output + String.fromCharCode(chr1);
					if (enc3 != 64) {
						output = output + String.fromCharCode(chr2)
					}
					if (enc4 != 64) {
						output = output + String.fromCharCode(chr3)
					}
				}
				output = Base64._utf8_decode(output);
				return output
			},
			_utf8_encode: function(string) {
				string = string.replace(/\r\n/g, "\n");
				var utftext = "";
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
					if (c < 128) {
						utftext += String.fromCharCode(c)
					} else if ((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128)
					} else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128)
					}
				}
				return utftext
			},
			_utf8_decode: function(utftext) {
				var string = "";
				var i = 0;
				var c = c1 = c2 = 0;
				while (i < utftext.length) {
					c = utftext.charCodeAt(i);
					if (c < 128) {
						string += String.fromCharCode(c);
						i++
					} else if ((c > 191) && (c < 224)) {
						c2 = utftext.charCodeAt(i + 1);
						string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
						i += 2
					} else {
						c2 = utftext.charCodeAt(i + 1);
						c3 = utftext.charCodeAt(i + 2);
						string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
						i += 3
					}
				}
				return string
			}
		};
		return Base64;
	});
	
	
	XDK.register("core.browser", function(P) {
		var J = navigator.userAgent.toLowerCase();
		var S = window.external || "";
		var L, M, N, T, O;
		var K = function(U) {
				var V = 0;
				return parseFloat(U.replace(/\./g, function() {
					return (V++ == 1) ? "" : "."
				}))
			};
		try {
			if ((/windows|win32/i).test(J)) {
				O = "windows"
			} else {
				if ((/macintosh/i).test(J)) {
					O = "macintosh"
				} else {
					if ((/rhino/i).test(J)) {
						O = "rhino"
					}
				}
			}
			if ((M = J.match(/applewebkit\/([^\s]*)/)) && M[1]) {
				L = "webkit";
				T = K(M[1])
			} else {
				if ((M = J.match(/presto\/([\d.]*)/)) && M[1]) {
					L = "presto";
					T = K(M[1])
				} else {
					if (M = J.match(/msie\s([^;]*)/)) {
						L = "trident";
						T = 1;
						if ((M = J.match(/trident\/([\d.]*)/)) && M[1]) {
							T = K(M[1])
						}
					} else {
						if (/gecko/.test(J)) {
							L = "gecko";
							T = 1;
							if ((M = J.match(/rv:([\d.]*)/)) && M[1]) {
								T = K(M[1])
							}
						}
					}
				}
			}
			if (/world/.test(J)) {
				N = "world"
			} else {
				if (/360se/.test(J)) {
					N = "360"
				} else {
					if ((/maxthon/.test(J)) || typeof S.max_version == "number") {
						N = "maxthon"
					} else {
						if (/tencenttraveler\s([\d.]*)/.test(J)) {
							N = "tt"
						} else {
							if (/se\s([\d.]*)/.test(J)) {
								N = "sogou"
							}
						}
					}
				}
			}
		} catch (R) {}
		var Q = {
			OS: O,
			CORE: L,
			Version: T,
			EXTRA: (N ? N : false),
			IE: /msie/.test(J),
			OPERA: /opera/.test(J),
			MOZ: /gecko/.test(J) && !/(compatible|webkit)/.test(J),
			IE5: /msie 5 /.test(J),
			IE55: /msie 5.5/.test(J),
			IE6: /msie 6/.test(J),
			IE7: /msie 7/.test(J),
			IE8: /msie 8/.test(J),
			IE9: /msie 9/.test(J),
			SAFARI: !/chrome\/([\d.]*)/.test(J) && /\/([\d.]*) safari/.test(J),
			CHROME: /chrome\/([\d.]*)/.test(J),
			IPAD: /\(ipad/i.test(J),
			IPHONE: /\(iphone/i.test(J),
			ITOUCH: /\(itouch/i.test(J),
			MOBILE: /mobile/i.test(J)
		};
		return Q
	});
	
	
	XDK.register("core.net.lazyLoad", function(xdk){
		return (function(doc){var env,head,pending={},pollCount=0,queue={css:[],js:[]},styleSheets=doc.styleSheets;function createNode(name,attrs){var node=doc.createElement(name),attr;for(attr in attrs){if(attrs.hasOwnProperty(attr)){node.setAttribute(attr,attrs[attr])}}return node}function finish(type){var p=pending[type],callback,urls;if(p){callback=p.callback;urls=p.urls;urls.shift();pollCount=0;if(!urls.length){if(callback){callback.call(p.context,p.obj)}pending[type]=null;if(queue[type].length){load(type)}}}}function getEnv(){if(env){return}var ua=navigator.userAgent;env={async:doc.createElement('script').async===true};(env.webkit=/AppleWebKit\//.test(ua))||(env.ie=/MSIE/.test(ua))||(env.opera=/Opera/.test(ua))||(env.gecko=/Gecko\//.test(ua))||(env.unknown=true)}function load(type,urls,callback,obj,context){var _finish=function(){finish(type)},isCSS=type==='css',i,len,node,p,pendingUrls,url;getEnv();if(urls){urls=typeof urls==='string'?[urls]:urls.concat();if(isCSS||env.async||env.gecko||env.opera){queue[type].push({urls:urls,callback:callback,obj:obj,context:context})}else{for(i=0,len=urls.length;i<len;++i){queue[type].push({urls:[urls[i]],callback:i===len-1?callback:null,obj:obj,context:context})}}}if(pending[type]||!(p=pending[type]=queue[type].shift())){return}head||(head=doc.head||doc.getElementsByTagName('head')[0]);pendingUrls=p.urls;for(i=0,len=pendingUrls.length;i<len;++i){url=pendingUrls[i];if(isCSS){node=createNode('link',{charset:'utf-8','class':'lazyload',href:url,rel:'stylesheet',type:'text/css'})}else{node=createNode('script',{charset:'utf-8','class':'lazyload',src:url});node.async=false}if(env.ie){node.onreadystatechange=function(){var readyState=this.readyState;if(readyState==='loaded'||readyState==='complete'){this.onreadystatechange=null;_finish()}}}else if(isCSS&&(env.gecko||env.webkit)){if(env.webkit){p.urls[i]=node.href;poll()}else{setTimeout(_finish,50*len)}}else{node.onload=node.onerror=_finish}head.appendChild(node)}}function poll(){var css=pending.css,i;if(!css){return}i=styleSheets.length;while(i&&--i){if(styleSheets[i].href===css.urls[0]){finish('css');break}}pollCount+=1;if(css){if(pollCount<200){setTimeout(poll,50)}else{finish('css')}}}return{css:function(urls,callback,obj,context){load('css',urls,callback,obj,context)},js:function(urls,callback,obj,context){load('js',urls,callback,obj,context)}}})(document);
	});
	
	XDK.register("core.dom.offset", function(xdk){
		var offset = {};
		offset.left = function(el){
			var ret = 0;
			while(el !== null){
				ret += el.offsetLeft;
				el = el.offsetParent;
			};
			return  ret;
		};
		offset.top = function(el){
			var ret = 0;
			while(el !== null){
				ret += el.offsetTop;
				el = el.offsetParent;
			};
			return  ret;
		};
		return offset;
	});

	XDK.register("core.tree", function(J){
		var opt = Object.prototype.toString;
		function is_array(a){return opt.call(a) == "[object Array]";};
		function is_object(a){return opt.call(a) == "[object Object]";};
		return {
			/**
			 * 树形结构转成一维数组 
			 * @param {array} | {object} tree
				 data = {
					id : 1,
					list : [
						{
							id : 2,
							list : [
								{
									id : 3, 
									list : [
										{
											id : 4,
											list : [
												{id : 5},
												{id : 6},
												{id : 7},
												{id : 8}
											]
										}
									]
								}
							]
							
						}
					]
				 }
				 
			 * @param {object} options - - {
				//是否删除列表键名	
				delete_children_key : true,
				//列表键名
				children_key : "list",
				//是否添加父id键名
				add_parent_id_key : true,
				//父id键名
				parent_id_key : "parent_id",
				//主键id键名
				main_id_key : "id",
				//初始化父id
				init_parent_id : 0
			 }
			 @return {array}
			*/
			tree2list : function(tree, options){
				var set = J.extend({
					delete_children_key : true,
					children_key : "list",
					add_parent_id_key : true,
					parent_id_key : "parent_id",
					main_id_key : "id",
					init_parent_id : 0
				}, options);
				var delete_children_key = set.delete_children_key;
				var children_key = set.children_key;
				var parent_id_key = set.parent_id_key;
				var add_parent_id_key = set.add_parent_id_key;
				var main_id_key = set.main_id_key;
				var init_parent_id = set.init_parent_id;
				var _func = arguments.callee;
				if(is_object(tree)){
					tree = [tree];
				};
				 
				var list = [];
				function _closure(data, pid){
					var ret = [];
					var _self = arguments.callee;
					for(var i = 0, l = data.length; i < l; i++){
						var o = data[i];
						var c = o[children_key] || null;
						if(delete_children_key){
							delete o[children_key];
						};
						if(add_parent_id_key){
							o[parent_id_key] = pid;
						};
						list.push(o);
						if(c){
							var parent_id = o[main_id_key]; 
							_self(c, parent_id);
						};
					};
				};
				_closure(tree, init_parent_id);
				return list;
			},
			list2tree: function(sNodes, options) {
				var set = $.extend({
					idKey : "id",
					pIdKey : "parent_id",
					childKey : "list"
				}, options);
				var i,l,
				key = set.idKey,
				parentKey = set.pIdKey,
				childKey = set.childKey;
				if (!key || key=="" || !sNodes) return [];
				if (is_array(sNodes)) {
					var r = [];
					var tmpMap = [];
					for (i=0, l=sNodes.length; i<l; i++) {
						tmpMap[sNodes[i][key]] = sNodes[i];
					}
					for (i=0, l=sNodes.length; i<l; i++) {
						if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
							if (!tmpMap[sNodes[i][parentKey]][childKey])
								tmpMap[sNodes[i][parentKey]][childKey] = [];
							tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
						} else {
							r.push(sNodes[i]);
						}
					}
					return r;
				}else {
					return [sNodes];
				}
			}
			
		};
	});
 	
	XDK.register("core.arr", function(J){
		return {
			inArray : function(value, arr){
				var i = 0, l = arr.length;
				for(; i < l; i++){
					if(arr[i] === value){
						return true;
					};
				};
				return false;	
			},

			getIndex : function(value, arr){
				var i = 0, l = arr.length;
				for(; i < l; i++){
					if(arr[i] === value){
						return i;
					};
				};
				return -1;
			},
			
			unique : function(arr){
				var data = [];
				var i = 0, l = arr.length;
				for(; i < l; i++){
					var v = arr[i];
					if(this.getIndex(v, data) == -1){
						data.push(v);
					};
				};
				return data;	
			},
			
			//数组分组
			group : function(arr){
				var _2arr = [];
				for(var i = 0, l = arr.length; i < l; i++){
					var v = arr[i];
					//如果能在当前二维数组内找到值，则找到对应数组， 并添加到此数组内
					if(this.canFindIn2Arr(v, _2arr)){
						var targetArrIndex = this.get2arrIndex(v, _2arr);
						_2arr[targetArrIndex].push(v);
					}else{
						//如果找不到， 则新建一个数组， 将该数组添加到二维数组内
						_2arr.push([v]);
					};
				};
				return _2arr;
			},
			
			inObjList : function(key, value, objList){
				var i = 0, l = objList.length;
				for(; i < l; i++){
					if(objList[i][key] === value){
						return true;
					};
				};
				return false;	
			},
			
			getObjIndexFromObjList : function(key, value, objList){
				var i = 0, l = objList.length;
				for(; i < l; i++){
					if(objList[i][key] === value){
						return i;
					};
				};
				return -1;
			},
			
			groupObjList : function(arr, group_by_key){
				var _2arr = [];
				for(var i = 0, l = arr.length; i < l; i++){
					var o = arr[i];
					var v = o[group_by_key];
					//如果能在当前二维数组内找到值，则找到对应数组， 并添加到此数组内
					if(this.canFindObjIn2Arr(group_by_key, v, _2arr)){
						var targetArrIndex = this.get2arrObjIndex(group_by_key, v, _2arr);
						_2arr[targetArrIndex].push(o);
					}else{
						//如果找不到， 则新建一个数组， 将该数组添加到二维数组内
						_2arr.push([o]);
					};
				};
				return _2arr;
			},
			
			//key = "id"
			//value = 2
			//_2arr = [{id : 2}], [{id : 3}, {id : 3}], [{id : 1}, {id : 1}, {id : 1}], [{id : 4}, {id : 4}]
			canFindObjIn2Arr : function(key, value, _2arr){
				for(var i = 0, l = _2arr.length; i < l; i++){
					var _arr = _2arr[i];
					if(this.inObjList(key, value, _arr)){
						return true;
					};
				};
				return false;	
			},
			
			// key = "id"
			// value = 2, 
			//_2arr = [[{id:1},{id:2}], [{id:2},{id:2}], [{id:4},{id:4}]]
			// 返回某个数组所在索引
			get2arrObjIndex : function(key, value, _2arr){
				for(var i = 0, l = _2arr.length; i < l; i++){
					var arr = _2arr[i];
					if(this.inObjList(key, value, arr)){
						return i;
					}
				};
				return -1;
			},
			
			
			// value = 2, _2arr = [[1,1,1], [2,2], [3,3]]
			// 判断是否在某个数组内
			canFindIn2Arr : function(value, _2arr){
				for(var i = 0, l = _2arr.length; i < l; i++){
					var _arr = _2arr[i];
					if(this.inArray(value, _arr)){
						return true;
					};
				};
				return false;	
			},
			

			// value = 2, _2arr = [[1,1,1], [2,2], [3,3]]
			// 返回某个数组所在索引
			get2arrIndex : function(value, _2arr){
				for(var i = 0, l = _2arr.length; i < l; i++){
					var arr = _2arr[i];
					if(this.inArray(value, arr)){
						return i;
					}
				};
				return -1;
			}
		};
	});	

	window["XDK"] = XDK;
})(window);

 


/*! HTML5 Shiv vpre3.6 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
  Uncompressed source: https://github.com/aFarkas/html5shiv  */
;(function(a, b) {
    function h(a, b) {
        var c = a.createElement("p"),
        d = a.getElementsByTagName("head")[0] || a.documentElement;
        return c.innerHTML = "x<style>" + b + "</style>",
        d.insertBefore(c.lastChild, d.firstChild)
    }
    function i() {
        var a = l.elements;
        return typeof a == "string" ? a.split(" ") : a
    }
    function j(a) {
        var b = {},
        c = a.createElement,
        f = a.createDocumentFragment,
        g = f();
        a.createElement = function(a) {
            if (!l.shivMethods) return c(a);
            var f;
            return b[a] ? f = b[a].cloneNode() : e.test(a) ? f = (b[a] = c(a)).cloneNode() : f = c(a),
            f.canHaveChildren && !d.test(a) ? g.appendChild(f) : f
        },
        a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + i().join().replace(/\w+/g,
        function(a) {
            return c(a),
            g.createElement(a),
            'c("' + a + '")'
        }) + ");return n}")(l, g)
    }
    function k(a) {
        var b;
        return a.documentShived ? a: (l.shivCSS && !f && (b = !!h(a, "article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio{display:none}canvas,video{display:inline-block;*display:inline;*zoom:1}[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}mark{background:#FF0;color:#000}")), g || (b = !j(a)), b && (a.documentShived = b), a)
    }
    var c = a.html5 || {},
    d = /^<|^(?:button|form|map|select|textarea|object|iframe|option|optgroup)$/i,
    e = /^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i,
    f, g;
    (function() {
        var c = b.createElement("a");
        c.innerHTML = "<xyz></xyz>",
        f = "hidden" in c,
        f && typeof injectElementWithStyles == "function" && injectElementWithStyles("#modernizr{}",
        function(b) {
            b.hidden = !0,
            f = (a.getComputedStyle ? getComputedStyle(b, null) : b.currentStyle).display == "none"
        }),
        g = c.childNodes.length == 1 ||
        function() {
            try {
                b.createElement("a")
            } catch(a) {
                return ! 0
            }
            var c = b.createDocumentFragment();
            return typeof c.cloneNode == "undefined" || typeof c.createDocumentFragment == "undefined" || typeof c.createElement == "undefined"
        } ()
    })();
    var l = {
        elements: c.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
        shivCSS: c.shivCSS !== !1,
        shivMethods: c.shivMethods !== !1,
        type: "default",
        shivDocument: k
    };
    a.html5 = l,
    k(b)
})(this, document);



	/**
	 * XDK.Class.create - 类创建
	 
	 * ---------demo-------------	
	var Animal = XDK.Class.create({
		_init_ : function(name){
			this.name = name;	
		},
		getName : function(){
			return this.name;	
		},
		setName : function(name){
			this.name = name;
		},
		toString : function(){
			return "[object Animal]";
		}
	});
	
	
	var Cat = XDK.Class.create({
		_init_ : function(name){
			Cat.baseConstructor.call(this, name);
		},
		toString : function(){
			return "[animal Cat]";
		}
	}, Animal);
	
	var Dog = XDK.Class.create({
		_init_ : function(name){
			Dog.baseConstructor.call(this, name);
			this.toString();
		},
		toString : function(){
			return "[animal Dog]";
		}
	}, Animal);
	
	
	var miaoMiao = new Cat("miaoMiao!");
	console.log(miaoMiao.toString());
	
	var wangWangWang = new Dog("WangWangWang!");
	console.log(wangWangWang.toString());
	 
	*/
	XDK.register("Class.create", function(){
		var constructor_key = "_init_";
		var getInstance_key = "_getInstance_";
		var static_attr_pat = /^_(.+)_$/;
		return function(obj, baseClass){
			baseClass = baseClass || null;
			var cls = obj[constructor_key] || function(){};
			function __apply(){
				function _f(){};
				_f.prototype = fn;
				var obj = new _f();
				cls.apply(obj, arguments);
				return obj;
			};
			
			if(baseClass != null){
				XDK.Class.extend(cls, baseClass);
			};
			
			var fn = cls.prototype;
			for(var key in obj){
				if(key != constructor_key && key != getInstance_key){
					var rs = key.match(static_attr_pat);
					if(rs != null){
						cls[rs[1]] = obj[key];
					}else{
						fn[key] = obj[key];
					};
				};
			};
			cls.getInstance = obj[getInstance_key] || __apply;
			return cls;	
		};
	});
	/**
	 * XDK.Class.extend - 类继承
	 -----demo
		var Animal = function(name){
			console.log("init Animal class :" + name);	
			this.name = name;
		};
		Animal.prototype = {
			setName : function(name){
				this.name = name;
			},
			getName : function(){
				return this.name;	
			}
		};
		
		var Cat = function(name){
			Cat.baseConstructor.call(this, name);
			console.log("init Cat class :" + name);
		};
		
		XDK.Class.extend(Cat, Animal);
	 
		
		Cat.prototype.getName = function(){
			return "the name is " + Cat.superClass.getName.call(this);
		};
		
		var catApp = new Cat("kitty");
		console.log(catApp.getName()); //kitty
		catApp.setName("Hello Kitty");
		console.log(catApp.getName()); //Hello Kitty
	 
	 
	*/
	XDK.register("Class.extend", function(){
		return function(subClass, baseClass){
			function init(){};
			init.prototype = baseClass.prototype;
			subClass.prototype = new init();
			subClass.prototype.constructor = subClass;
			subClass.baseConstructor = baseClass;
			subClass.superClass = baseClass.prototype;	
		};
	});
	
