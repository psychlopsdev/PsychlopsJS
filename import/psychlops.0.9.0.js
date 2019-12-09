//https://github.com/alexei/sprintf.js
(function (window) {
	var re = {
		not_string: /[^s]/,
		number: /[diefg]/,
		json: /[j]/,
		not_json: /[^j]/,
		text: /^[^\x25]+/,
		modulo: /^\x25{2}/,
		placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
		key: /^([a-z_][a-z_\d]*)/i,
		key_access: /^\.([a-z_][a-z_\d]*)/i,
		index_access: /^\[(\d+)\]/,
		sign: /^[\+\-]/
	}

	function sprintf() {
		var key = arguments[0], cache = sprintf.cache
		if (!(cache[key] && cache.hasOwnProperty(key))) {
			cache[key] = sprintf.parse(key)
		}
		return sprintf.format.call(null, cache[key], arguments)
	}

	sprintf.format = function (parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i])
			if (node_type === "string") {
				output[output.length] = parse_tree[i]
			}
			else if (node_type === "array") {
				match = parse_tree[i] // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor]
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
						}
						arg = arg[match[2][k]]
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]]
				}
				else { // positional argument (implicit)
					arg = argv[cursor++]
				}

				if (get_type(arg) == "function") {
					arg = arg()
				}

				if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
					throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
				}

				if (re.number.test(match[8])) {
					is_positive = arg >= 0
				}

				switch (match[8]) {
					case "b":
						arg = arg.toString(2)
						break
					case "c":
						arg = String.fromCharCode(arg)
						break
					case "d":
					case "i":
						arg = parseInt(arg, 10)
						break
					case "j":
						arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
						break
					case "e":
						arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
						break
					case "f":
						arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
						break
					case "g":
						arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
						break
					case "o":
						arg = arg.toString(8)
						break
					case "s":
						arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
						break
					case "u":
						arg = arg >>> 0
						break
					case "x":
						arg = arg.toString(16)
						break
					case "X":
						arg = arg.toString(16).toUpperCase()
						break
				}
				if (re.json.test(match[8])) {
					output[output.length] = arg
				}
				else {
					if (re.number.test(match[8]) && (!is_positive || match[3])) {
						sign = is_positive ? "+" : "-"
						arg = arg.toString().replace(re.sign, "")
					}
					else {
						sign = ""
					}
					pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
					pad_length = match[6] - (sign + arg).length
					pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
					output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
				}
			}
		}
		return output.join("")
	}

	sprintf.cache = {}

	sprintf.parse = function (fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
		while (_fmt) {
			if ((match = re.text.exec(_fmt)) !== null) {
				parse_tree[parse_tree.length] = match[0]
			}
			else if ((match = re.modulo.exec(_fmt)) !== null) {
				parse_tree[parse_tree.length] = "%"
			}
			else if ((match = re.placeholder.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1
					var field_list = [], replacement_field = match[2], field_match = []
					if ((field_match = re.key.exec(replacement_field)) !== null) {
						field_list[field_list.length] = field_match[1]
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
							if ((field_match = re.key_access.exec(replacement_field)) !== null) {
								field_list[field_list.length] = field_match[1]
							}
							else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
								field_list[field_list.length] = field_match[1]
							}
							else {
								throw new SyntaxError("[sprintf] failed to parse named argument key")
							}
						}
					}
					else {
						throw new SyntaxError("[sprintf] failed to parse named argument key")
					}
					match[2] = field_list
				}
				else {
					arg_names |= 2
				}
				if (arg_names === 3) {
					throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
				}
				parse_tree[parse_tree.length] = match
			}
			else {
				throw new SyntaxError("[sprintf] unexpected placeholder")
			}
			_fmt = _fmt.substring(match[0].length)
		}
		return parse_tree
	}

	var vsprintf = function (fmt, argv, _argv) {
		_argv = (argv || []).slice(0)
		_argv.splice(0, 0, fmt)
		return sprintf.apply(null, _argv)
	}

	/**
     * helpers
     */
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
	}

	function str_repeat(input, multiplier) {
		return Array(multiplier + 1).join(input)
	}

	/**
     * export to either browser or node.js
     */
	if (typeof exports !== "undefined") {
		exports.sprintf = sprintf
		exports.vsprintf = vsprintf
	}
	else {
		window.sprintf = sprintf
		window.vsprintf = vsprintf

		if (typeof define === "function" && define.amd) {
			define(function () {
				return {
					sprintf: sprintf,
					vsprintf: vsprintf
				}
			})
		}
	}
})(typeof window === "undefined" ? this : window);

var Psychlops = new Object();

//////// Util ////////
Psychlops.AppInfo = new Object();
Psychlops.AppInfo.expname = "";
Psychlops.AppInfo.argc = 0;
Psychlops.AppInfo.argv = [];
Psychlops.AppInfo.participant_name = "";
Psychlops.AppInfo.participant_attr = {};
Psychlops.AppInfo.alert = function (a) { alert(a); };
Psychlops.AppInfo.tabletMode_ = false;
Psychlops.AppInfo.interruption = false;
Psychlops.AppInfo.tabletMode = function (a) {
	Psychlops.AppInfo.tabletMode_ = a;
}
Psychlops.AppInfo.localSettings = new Object();
Psychlops.AppInfo.loadLocalSettings = function () {
	var key;
	Psychlops.AppInfo.localSettings = new Object();
	for (var i = 0; i < localStorage.length; i++) {
		key = localStorage.key(i);
		if (key.indexOf("Psychlops.") == 0) {
			Psychlops.AppInfo.localSettings[key.substr(10)] = localStorage.getItem(key);
		}
	}
};
Psychlops.AppInfo.saveLocalSettings = function () {
	for (key in Psychlops.AppInfo.localSettings) {
		localStorage.setItem("Psychlops." + key, Psychlops.AppInfo.localSettings[key]);
	}
};
Psychlops.AppInfo.hasKey = function (key) {
	return key in Psychlops.AppInfo.localSettings;
};
Psychlops.AppInfo._transform_style = false;

Psychlops.Util = new Object();
Psychlops.Util.toString = function (arg) { return "" + arg; };
Psychlops.Util.toStringW = function (arg) { return "" + arg; };
Psychlops.Util.to_s = function (arg) { return "" + arg; };
Psychlops.Util.to_sw = function (arg) { return "" + arg; };
Psychlops.Util.atoi = function (arg) { return parseInt(arg); };
Psychlops.Util.atof = function (arg) { return parseFloat(arg); };
Psychlops.Util.StringToWString = function (arg) { return arg; };
Psychlops.Util.WStringToString = function (arg) { return arg; };
Psychlops.Util.getDateTimeString = function () {
	var now = new Date();
	return now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "_" + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2) + "_" + ("0" + now.getSeconds()).slice(-2);
}
Psychlops.Util.logln = function (str) {
	if (Psychlops.Util.console_textarea && Psychlops.Util.console_textarea.tagName == "TEXTAREA") {
		Psychlops.Util.console_textarea.value += str + "\r\n";
	}
};
Psychlops.Util.log = function (str) {
	if (Psychlops.Util.console_textarea && Psychlops.Util.console_textarea.tagName == "TEXTAREA") {
		Psychlops.Util.console_textarea.value += str;
	}
};
Psychlops.Util.JSON = function () {
	this.content = {};
};
Psychlops.Util.JSON.prototype = {
	load: function (filename) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("get", filename, true);
		httpRequest.onload = function () {
			var list = JSON.parse(this.responseText);
		}
		httpRequest.send(null);
		return false;
	}
}
Psychlops.Util._warning = "";
Psychlops.Util.environment = (function () {
	var os = { "name": "unknown", "version": "unknown", "major_version": 0 };
	var browser = { "name": "unknown", "version": "unknown", "major_version": 0 };
	var device = "";

	//// Browser
	var ua = window.navigator.userAgent.toLowerCase();
	var browserlist = ['msie', 'trident', 'edge', 'chrome', 'safari', 'firefox', 'opera'];
	for (var i = 0; i < browserlist.length; i += 1) {
		var rx = (new RegExp(browserlist[i] + "\/([0-9\._]+)")).exec(ua);
		if (rx != null) {
			browser = { "name": browserlist[i], "version": rx[1], "major_version": parseInt(rx[1].match(/\d+/)) };
			break;
		}
	}

	//// OS
	var ua = window.navigator.userAgent;
	var os_list = [["Windows NT", ""], ["Mac OS X", ""], ["iPhone OS", "iOS"], ["iPad; CPU OS", "iOS"], ["Android", ""], ["Linux x", ""], ["Linux i", ""]];
	for (var i = 0; i < os_list.length; i += 1) {
		var rx = (new RegExp(os_list[i][0] + " ([0-9\._]+)")).exec(ua);
		if (rx != null) {
			os = { "name": os_list[i][1] == "" ? os_list[i][0] : os_list[i][1], "version": rx[1], "major_version": parseInt(rx[1].match(/\d+/)) };
			break;
		}
	}

	//// OS
	if (os.name == "Android") {
		device = (new RegExp(os_list[i][0] + " [0-9\._]+; ([^\s]+)")).exec(ua)[1];
	}

	return { "OS": os, "host": browser, "device": device };
})();
Psychlops.Util._refreshRate = 60.0;
Psychlops.Util.hasTouchEvent = ((typeof window.ontouchstart) !== 'undefined') ? true : false;
Psychlops.Util.isUIExclusive = Psychlops.Util.environment.OS.name == "iOS" || Psychlops.Util.environment.host.name == "safari";
Psychlops.Util.isiOS = /iPad|iPhone|iPod/.test(navigator.platform);
Psychlops.Util.isAndroid = /Android/.test(navigator.platform);
Psychlops.Util.programPaused = false;
Psychlops.Util.programFinished = false;
Psychlops.Util.programFinishedCallback = null;
Psychlops.Util.makeFullscreenCallback = function () { };
Psychlops.Util.canvas_element_id = "glcanvas";
Psychlops.Util.window_canvas_container_element_id = "window_canvas_container";
Psychlops.Util.fullscreen_canvas_container_element_id = "fullscreen_canvas_container";
Psychlops.Util.throbber_element_id = "psychlops_throbber";
Psychlops.Util.throbber_element = null;
Psychlops.Util.console_textarea_id = "psychlops_console";
Psychlops.Util.console_textarea = null;
Psychlops.Util.setThrobber = function (id) {
	Psychlops.Util.throbber_element_id = id || Psychlops.Util.throbber_element_id;
	Psychlops.Util.throbber_element = document.getElementById(Psychlops.Util.throbber_element_id);
}
Psychlops.Util.showThrobber = function () { if (Psychlops.Util.throbber_element) { Psychlops.Util.throbber_element.style.display = "block"; } }
Psychlops.Util.hideThrobber = function () { if (Psychlops.Util.throbber_element) { Psychlops.Util.throbber_element.style.display = "none"; } }
Psychlops.Util.setConsoleTextarea = function (id) {
	Psychlops.Util.console_textarea_id = id || Psychlops.Util.console_textarea_id;
	Psychlops.Util.console_textarea = document.getElementById(Psychlops.Util.console_textarea_id);
	if (Psychlops.Util.console_textarea && Psychlops.Util.console_textarea.tagName == "TEXTAREA") {
		Psychlops.Util.console_textarea.readOnly = true;
	}
};
Psychlops.Util.initializerList = [];
Psychlops.Util.initialize = function (str) {
	Psychlops.AppInfo.loadLocalSettings();
	if (!(typeof Psychlops.AppInfo.localSettings.TrueFullScreen == "undefined")) {
		Psychlops.Util.trueFullscreen = Psychlops.AppInfo.localSettings.TrueFullScreen == "true" ? true : false;
	}
	Psychlops.Util.initFullScreen();
	Psychlops.Input._INITIALIZE_();
	Psychlops.Widgets.Slider.initialize();
	Psychlops.Util.initializerList.forEach(function (f) {
		if (typeof f == "function") { f(); }
	});

	if (typeof Psychlops.Extensions === "object") {
		Psychlops.Variables.initialize();
		Psychlops.AppInfo.environment = Psychlops.Extensions.Browser.identifyUserAgent();
	}
};
Psychlops.Util.programExited = false;
Psychlops.Util.run = function (js_source, args) {
	Psychlops.AppInfo.loadLocalSettings();
	Psychlops.Canvas.HiDPIFactor = window.devicePixelRatio;
	var arg;
	switch (arguments.length) {
		case 2:
			if (Array.isArray(args)) {
				arg = args;
			} else {
				arg = [args];
			}
			Psychlops.AppInfo.args = arg;
			Psychlops.AppInfo.argc = arg.length;
			Psychlops.AppInfo.argv = arg;
			break;
	}

	Psychlops.AppInfo.tabletMode_ = false;
	Psychlops.Util.programExited = false;
	Psychlops.Util.programFinished = false;
	Psychlops.Util.showThrobber();
	window.clearInterval(Psychlops.Util.RUN_WAIT);
	window.clearInterval(Psychlops.Util.RUN_WAIT_DEBUG);
	if (Psychlops.Image._LOADING_ == 0) {
		switch (Psychlops.Util.getEnvironmentVersion()) {
			case Psychlops.Util.EnvironmentVersion.Latest:
				//Psychlops.Util.runProgram(js_source, window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1 ? function () { } : null);
				Psychlops.Util.runProgram(js_source, null);
				break;
			case Psychlops.Util.EnvironmentVersion.Env2013:
				Psychlops.Image._LOADED_ARRAY_ = [];
				Psychlops.Util.runProgram2013(js_source, function () { });
				break;
		}
	} else {
		window.setTimeout(Psychlops.Util.run, 500, js_source, args);
	}
}
Psychlops.Util._DEBUG_ROUTINE = null;
Psychlops.Util._FRAME_TIMESTAMP = 0;
Psychlops.Util.runProgram = function (js_source, watch_func) {
	"use strict";
	Psychlops.Util.hideThrobber();
	try {
		eval(js_source);
		Psychlops.Util.initialize();
		if (Psychlops.Util.trueFullscreen && Psychlops.Util.requireFullscreen) { Psychlops.Util.toggleFullScreen(); }
	} catch (e) {
		//Psychlops.Util.CompileError += e.message;
		alert(e.constructor + "\r\n\r\n" + e.name + "\r\n\r\n" + e.message + "\r\n\r\n" + e.stack ? e.stack : "");
	}
	//Psychlops.draw_loop = psychlops_main();
	if (typeof watch_func !== "undefined" && watch_func != null) {
		if (typeof watch_func == "function") {
			Psychlops.Util._DEBUG_ROUTINE = watch_func;
		}
	}
	Psychlops.flip_interval = function (timestamp) {
		let now = performance.now();
		if (Psychlops.Util.programFinished || Psychlops.Util.programExited) {
			Psychlops.Util.finishProgram();
		} else if (!Psychlops.Util.programPaused) {
			var r = { "value":0, "done": false };
			try {
				if (Psychlops.draw_loop == null) { Psychlops.Util.exit(-1); Psychlops.Util.programFinished = true; }
				else {
					let frame_interval = 1000 / Psychlops.Util._refreshRate
					let elapsed_frame = Math.round(Math.round((now - Psychlops.Util._FRAME_TIMESTAMP)/2) / (frame_interval/2));
					if(elapsed_frame >=Psychlops.flip_frame) {
						Psychlops.Util._FRAME_TIMESTAMP = timestamp;
						r = Psychlops.draw_loop.next();
						if(typeof Psychlops.Util._DEBUG_ROUTINE == "function") { Psychlops.Util._DEBUG_ROUTINE(); }
						// iPad Movie class
						if (Psychlops.Util.isUIExclusive) {
							if (Psychlops.Movie.playstack_.length > 0) {
								for (var i = 0; i < Psychlops.Movie.playstack_.length; i++) {
									Psychlops.Movie.playstack_[i]._nextFrame();
								}
								Psychlops.Movie.playstack_ = [];
							}
						}
						// iPad Movie class
					} else {
					}
				}
			} catch (e) { alert(e.constructor + "\r\n\r\n" + e.name + "\r\n\r\n" + e.message + "\r\n\r\n" + e.stack ? e.stack : ""); throw e; }
			Psychlops.Util.programFinished = r.done;
			Psychlops.Util.checkExit();
			window.requestAnimationFrame(Psychlops.flip_interval);
		} else {
			window.setTimeout(Psychlops.flip_interval, 160);
		}
	};
	window.requestAnimationFrame(Psychlops.flip_interval);
	Psychlops.Util.logln("Program was started.");
};
Psychlops.Util.EnvironmentVersion = { "Latest": 0, "Env2013": 1 }
Psychlops.Util.getEnvironmentVersion = function () {
	"use strict";
	Psychlops.Util.CompileError = "";
	var flag = Psychlops.Util.EnvironmentVersion.Latest;
	try {
		eval("var _______doesSupportGenerator = function * () {}")
	} catch (e) {
		flag = Psychlops.Util.EnvironmentVersion.Env2013;
	}
	return flag;
}
Psychlops.Util.RUN_WAIT = null;
Psychlops.Util.RUN_WAIT_DEBUG = null;
Psychlops.Util.finishProgram = function () {
	if (Psychlops.Util.clearCanvasAtFinishProgram == true) { Psychlops.the_canvas.clear(Psychlops.Color.black); }
	if (Psychlops.Util.programFinishedCallback) {
		Psychlops.Util.programFinishedCallback();
	}
	if (Psychlops.the_canvas._fullscreen) {
		document.getElementById(Psychlops.Util.fullscreen_canvas_container_element_id).innerHTML = "";
	}
	Psychlops.Util.exitFullscreen();
}
Psychlops.Util.clearCanvasAtFinishProgram = true;

Psychlops.Util.currentFlow = "";
Psychlops.Util.runProgram2013loading = false;
Psychlops.Util.runProgram2013 = function (js_source, watch_func) {
	"use strict";
	Psychlops.Util.hideThrobber();
	if (Psychlops.Util._warning != "") { if (confirm(Psychlops.Util._warning + "\r\nAbort this program?")) { Psychlops.Util.finishProgram2013(); return; } }
	try {
		Psychlops.Util.initialize();
		eval(js_source);
		if (Psychlops.Util.trueFullscreen && Psychlops.Util.requireFullscreen) { Psychlops.Util.toggleFullScreen(); }
	} catch (e) {
		//Psychlops.Util.CompileError += e.message;
		alert(e.constructor + "\r\n\r\n" + e.message + "\r\n\r\n" + e.stack ? e.stack : "");
	}
	//Psychlops.draw_loop = psychlops_main();
	if (typeof watch_func !== "undefined" || watch_func != null) {
		Psychlops.flip_interval = function () {
			Psychlops.Util.checkExit();
			if (Psychlops.Util.currentFlow == "psychlops_main_END" || Psychlops.Util.programExited) {
				Psychlops.Util.finishProgram2013();
				window.clearInterval(Psychlops.Util.RUN_WAIT); window.clearInterval(Psychlops.Util.RUN_WAIT_DEBUG);
			}
			try {
				if (Psychlops.Util.runProgram2013loading == false && Psychlops.Image._LOADERFUNC_ARRAY_.length != 0) {
					Psychlops.Util.runProgram2013loading = true;
					for (var i = 0; i < Psychlops.Image._LOADERFUNC_ARRAY_.length; i++) { Psychlops.Image._LOADERFUNC_ARRAY_[i](); }
				}
				if (Psychlops.Util.runProgram2013loading) {
					if (Psychlops.Image._LOADING_ == 0) { Psychlops.Util.runProgram2013loading = false; Psychlops.Image._LOADERFUNC_ARRAY_ = []; }
					window.requestAnimationFrame(Psychlops.flip_interval);
				} else if (!Psychlops.Util.programPaused) {
					Psychlops.Util.currentFlow = Psychlops.draw_loop(Psychlops.Util.currentFlow);
					window.requestAnimationFrame(Psychlops.flip_interval);
				} else {
					window.setTimeout(Psychlops.flip_interval, 160);
				}
			}
			catch (e) { alert(e.constructor + "\r\n\r\n" + e.message + "\r\n\r\n" + e.stack ? e.stack : ""); throw e; }
		};
		window.requestAnimationFrame(Psychlops.flip_interval);
		//Psychlops.Util.RUN_WAIT = window.setInterval(Psychlops.flip_interval, 16);
		//Psychlops.Util.RUN_WAIT_DEBUG = window.setInterval(watch_func, 16);
	} else {
		//Psychlops.flip_interval = function () { Psychlops.draw_loop.next(); window.requestAnimationFrame(Psychlops.flip_interval); }
		Psychlops.flip_interval = function () {
			Psychlops.Util.checkExit();
			if (Psychlops.Util.currentFlow == "psychlops_main_END" || Psychlops.Util.programExited) {
				Psychlops.Util.finishProgram2013();
			} else if (!Psychlops.Util.programPaused) {
				try {
					Psychlops.Util.currentFlow = Psychlops.draw_loop(Psychlops.Util.currentFlow);
				} catch (e) { alert(e.constructor + "\r\n\r\n" + e.message + "\r\n\r\n" + e.stack ? e.stack : ""); throw e; }
				window.requestAnimationFrame(Psychlops.flip_interval);
			} else {
				window.setTimeout(Psychlops.flip_interval, 160);
			}
		};
		window.requestAnimationFrame(Psychlops.flip_interval);
	}
	Psychlops.Util.logln("Program was started.");
};
Psychlops.Util.finishProgram2013 = function () {
	if (Psychlops.the_canvas._fullscreen) {
		document.getElementById(Psychlops.Util.fullscreen_canvas_container_element_id).innerHTML = "";
	}
	if (Psychlops.Util.programFinishedCallback) { Psychlops.Util.programFinishedCallback(); }
	Psychlops.Util.exitFullscreen();
}
Psychlops.Util.leadFlow = function () {
	Psychlops.Util.currentFlow = Psychlops.Util.flowCallbacks[Psychlops.Util.currentFlow]();
};
Psychlops.Util.exit = function (num) {
	if (num != 0) { alert("exit at status code " + num); }
	Psychlops.Util.programExited = true;
	Psychlops.Util.exitFullscreen();
}
Psychlops.Util.checkExit = function () {


	if (Psychlops.AppInfo.tabletMode_) {
		//if (Psychlops.Mouse.left.pressed() && ((Date.now() - Psychlops.Mouse.downTime) > 5000)) {
		//	Psychlops.Util.programExited = true;
		//}
		var hidden, visibilityChange;
		if (typeof document.hidden !== "undefined") {
			hidden = "hidden";
			visibilityChange = "visibilitychange";
		} else if (typeof document.msHidden !== "undefined") {
			hidden = "msHidden";
			visibilityChange = "msvisibilitychange";
		} else if (typeof document.webkitHidden !== "undefined") {
			hidden = "webkitHidden";
			visibilityChange = "webkitvisibilitychange";
		}
		function handleVisibilityChange() {
			if (document[hidden]) {
				videoElement.pause();
			} else {
				videoElement.play();
			}
		}
		document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}
}

Psychlops.Util.isTrueFullScreen = function () {
	return !(document.fullscreenElement == null && document.mozFullScreenElement == null && document.webkitFullscreenElement == null && document.msFullscreenElement == null);
}
Psychlops.Util.initFullScreen = function () {
	document.addEventListener("webkitfullscreenchange", Psychlops.Util.handleFullScreen, false);
	document.addEventListener("mozfullscreenchange", Psychlops.Util.handleFullScreen, false);
	document.addEventListener("MSFullscreenChange", Psychlops.Util.handleFullScreen, false);
	document.addEventListener("fullscreenchange", Psychlops.Util.handleFullScreen, false);
};
Psychlops.Util.toggleFullScreen = function (s) {
	//alert(19)
	var str = arguments.length == 1 ? s : Psychlops.Util.window_canvas_container_element_id;
	var elem = document.getElementById(str);
	//$("#modal_stimuli").modal('hide');
	if (!document.fullscreenElement &&    // alternative standard method
		!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
		if (document.documentElement.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		Psychlops.Util.exitFullscreen();
	}
};
Psychlops.Util.exitFullscreen = function () {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
};
Psychlops.Util.handleFullScreen = function () {
	if ((document.webkitFullscreenElement && document.webkitFullscreenElement !== null)
		|| (document.mozFullScreenElement && document.mozFullScreenElement !== null)
		|| (document.msFullscreenElement && document.msFullscreenElement !== null)
		|| (document.fullScreenElement && document.fullScreenElement !== null)) {
		Psychlops.Canvas._trueFullScreen();
	} else {
		Psychlops.Canvas._pseudoFullScreen();
	}
};
Psychlops.Util.requireFullscreen = false;
Psychlops.Util.trueFullscreen = false;
Psychlops.Util.useNoisyBit = false;
Psychlops.Util.useNoisyBit_static = false;

//////// Math ////////

Psychlops.Math = new Object();

// http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/VERSIONS/JAVASCRIPT/java-script.html
// http://www.graviness.com/js/com.graviness.utf-8.util.MersenneTwister.js
function class__MersenneTwister__(t) { var e = "MersenneTwister", i = "$__next__", s = 624, n = 397, r = [0, 2567483615], h = t[e] = function () { this.mt = new Array(s), this.mti = s + 1; var t = arguments; switch (t.length) { case 0: this.setSeed((new Date).getTime()); break; case 1: this.setSeed(t[0]); break; default: for (var e = new Array, i = 0; i < t.length; ++i) e.push(t[i]); this.setSeed(e) } }, m = h.prototype; m.setSeed = function () { var t = arguments; switch (t.length) { case 1: if (t[0].constructor === Number) { this.mt[0] = t[0]; for (var e = 1; s > e; ++e) { var i = this.mt[e - 1] ^ this.mt[e - 1] >>> 30; this.mt[e] = (1812433253 * ((4294901760 & i) >>> 16) << 16) + 1812433253 * (65535 & i) + e } return void (this.mti = s) } this.setSeed(19650218); for (var n = t[0].length, e = 1, r = 0, h = s > n ? s : n; 0 != h; --h) { var i = this.mt[e - 1] ^ this.mt[e - 1] >>> 30; this.mt[e] = (this.mt[e] ^ (1664525 * ((4294901760 & i) >>> 16) << 16) + 1664525 * (65535 & i)) + t[0][r] + r, ++e >= s && (this.mt[0] = this.mt[s - 1], e = 1), ++r >= n && (r = 0) } for (var h = s - 1; 0 != h; --h) { var i = this.mt[e - 1] ^ this.mt[e - 1] >>> 30; this.mt[e] = (this.mt[e] ^ (1566083941 * ((4294901760 & i) >>> 16) << 16) + 1566083941 * (65535 & i)) - e, ++e >= s && (this.mt[0] = this.mt[s - 1], e = 1) } return void (this.mt[0] = 2147483648); default: for (var m = new Array, e = 0; e < t.length; ++e) m.push(t[e]); return void this.setSeed(m) } }, m[i] = function (t) { if (this.mti >= s) { for (var e = 0, i = 0; s - n > i; ++i) e = 2147483648 & this.mt[i] | 2147483647 & this.mt[i + 1], this.mt[i] = this.mt[i + n] ^ e >>> 1 ^ r[1 & e]; for (var i = s - n; s - 1 > i; ++i) e = 2147483648 & this.mt[i] | 2147483647 & this.mt[i + 1], this.mt[i] = this.mt[i + (n - s)] ^ e >>> 1 ^ r[1 & e]; e = 2147483648 & this.mt[s - 1] | 2147483647 & this.mt[0], this.mt[s - 1] = this.mt[n - 1] ^ e >>> 1 ^ r[1 & e], this.mti = 0 } var h = this.mt[this.mti++]; return h ^= h >>> 11, h ^= h << 7 & 2636928640, h ^= h << 15 & 4022730752, h ^= h >>> 18, h >>> 32 - t }, m.nextBoolean = function () { return 1 == this[i](1) }, m.nextInteger = function () { return this[i](32) }, m.nextLong = function () { return 2097152 * this[i](25) + this[i](25) }, m.nextFloat = function () { return this[i](32) / 4294967296 }, m.nextDouble = function () { return (2097152 * this[i](25) + this[i](25)) / 70368744177664 } } class__MersenneTwister__(window), Psychlops.Math.mersenneTwisterRandom = function () { return Psychlops.Math.__MERSENNE_TWISTER__ = new MersenneTwister, function () { return Psychlops.Math.__MERSENNE_TWISTER__.nextFloat() } }();

Psychlops.Math.PI = 3.141592;
Psychlops.random = function (n, max) {
	switch (arguments.length) {
		case 0:
			return Psychlops.Math.mersenneTwisterRandom();
			break;
		case 1:
			if (Math.floor(n) == n) { return Math.floor(Psychlops.Math.mersenneTwisterRandom() * n); }
			else { return Psychlops.Math.mersenneTwisterRandom() * n; }
			break;
		case 2:
			var dif = (max - n);
			if (dif < 0) alert("min exceeds max in random(min, max)");
			return (Psychlops.Math.mersenneTwisterRandom() * dif) + n;
			break;
	}
};

Psychlops.Math.abs = function (val) { return (val < 0 ? -val : val); }
Psychlops.Math.mod = function (lhs, rhs) { return lhs - Math.floor(lhs / rhs) * rhs; }
Psychlops.Math.fmod = function (lhs, rhs) { return lhs - Math.floor(lhs / rhs) * rhs; }
Psychlops.Math.round = function (val) { return Math.round(val); };
Psychlops.Math.gaussian = function (x, sigma) { return Math.exp(-(x * x) / (2.0 * sigma * sigma)); };
Psychlops.Math.normalDistibution = function (x, mu, sigma) { return Math.exp(-((x - mu) * (x - mu) / (2 * sigma * sigma))) / Math.sqrt(2 * PI * sigma * sigma); };
Psychlops.Math.cumulativeNormalDistibution = function (x, mu, sigma) { return .5 + .5 * Psychlops.Math.erf((x - mu) / (sigma * Math.sqrt(2.0))); };
// https://gist.github.com/kcrt/6210661
Psychlops.Math.erf = function (x) {
	var m = 1.00;
	var s = 1.00;
	var sum = x * 1.0;
	for (var i = 1; i < 50; i++) { m *= i; s *= -1; sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (m * (2.0 * i + 1.0)); }
	return 2 * sum / Math.sqrt(3.14159265358979);
};
Psychlops.Math.erfinv = function (x) {
	// http://stackoverflow.com/questions/12556685/is-there-a-javascript-implementation-of-the-inverse-error-function-akin-to-matl
	// https://en.wikipedia.org/wiki/Error_function#Inverse_functions
	var z;
	var a = 0.147;
	var the_sign_of_x;
	if (0 == x) {
		the_sign_of_x = 0;
	} else if (x > 0) {
		the_sign_of_x = 1;
	} else {
		the_sign_of_x = -1;
	}

	if (0 != x) {
		var ln_1minus_x_sqrd = Math.log(1 - x * x);
		var ln_1minusxx_by_a = ln_1minus_x_sqrd / a;
		var ln_1minusxx_by_2 = ln_1minus_x_sqrd / 2;
		var ln_etc_by2_plus2 = ln_1minusxx_by_2 + (2 / (Math.PI * a));
		var first_sqrt = Math.sqrt((ln_etc_by2_plus2 * ln_etc_by2_plus2) - ln_1minusxx_by_a);
		var second_sqrt = Math.sqrt(first_sqrt - ln_etc_by2_plus2);
		z = second_sqrt * the_sign_of_x;
	} else { // x is zero
		z = 0;
	}
	return z;
}
Psychlops.Math.probit = function (p) {
	return sqrt(2) * Psychlops.Math.erfinv(2 * p - 1);
}
Psychlops.Math.shuffle = function (array, n) {
	var a;
	var tmp;
	for (var i = 1; i < n; i++) {
		a = Psychlops.random(i + 1);
		tmp = array[i];
		array[i] = array[a];
		array[a] = tmp;
	}
}

//////// Interval ////////
Psychlops.Interval = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.begin = 0;
	this.end = 0;
	this.begin_op = 0;
	this.end_op = 0;

	switch (arguments.length) {
		case 2:
			this.set(iniarg1, iniarg2);
			break;
		case 4:
			this.set(iniarg1, iniarg2, iniarg3, iniarg4);
			break;
	}
};
Psychlops.Interval.prototype = {
	dup: function () { var a = new Psychlops.Interval(); a.begin = this.begin; a.begin_op = this.begin_op; a.end = this.end; a.end_op = this.end_op; return a; }
	, set: function (a1, a2, a3, a4) {
		switch (arguments.length) {
			case 2:
				this.begin = a1;
				this.end = a3;
				break;
			case 4:
				this.begin = a1;
				this.end = a3;
				if (a2 == "<=") this.begin_op = 1;
				if (a4 == "<=") this.end_op = 1;
				break;
		}
		return this;
	}
	, includes: function (v) { if (v < this.begin) return false; if (v > this.end) return false; if (v == this.begin && this.begin_op == 0) return false; if (v == this.end && this.end_op == 0) return false; return true; }
	, bounded: function () { return (this.begin.isFinite && this.end.isFinite && this.begin <= this.end); }
};

/*
//////// Matrix ////////
Psychlops.Matrix = function (iniarg1, iniarg2) {
	this.element_ = [];
	this.rows_ = 0;
	this.cols_ = 0;

	switch (arguments.length) {
		case 2:
			this.set(iniarg1, iniarg2);
			break;
	}
};
Psychlops.Matrix.prototype = {
	dup: function () { var a = new Psychlops.Interval(); a.begin = this.begin; a.begin_op = this.begin_op; a.end = this.end; a.end_op = this.end_op; return a; }
	, set: function (a1, a2) {
		switch (arguments.length) {
			case 2:
				this.rows_ = a1;
				this.cols_ = a2;
				this.element_ = new Array(a1 * a2);
		}
		return this;
	}
};
*/

//////// Point ////////

Psychlops.Point = function (iniarg1, iniarg2, iniarg3) {
	this.x = iniarg1 || 0;
	this.y = iniarg2 || 0;
	this.z = iniarg3 || 0;
};
Psychlops.Point.prototype = {
	dup: function () { var a = new Psychlops.Point(); a.x = this.x; a.y = this.y; a.z = this.z; return a; }
	, equals: function (a) { return a.x == this.x && a.y == this.y && a.z == this.z; }
	, getX: function () { return this.x; }
	, getY: function () { return this.y; }
	, getZ: function () { return this.z; }
	, set: function (a1, a2, a3) {
		switch (arguments.length) {
			case 2:
				this.x = a1; this.y = a2;
				break;
			case 3:
				this.x = a1; this.y = a2; this.z = a3;
				break;
			default:
				break;
		}
		return this;
	}
	, getCenter: function () {
		return this;
	}
	, centering: function (a1, a2, a3) {
		var cx, cy, cz;
		switch (arguments.length) {
			case 0:
				cx = Psychlops.the_canvas.getHcenter();
				cy = Psychlops.the_canvas.getVcenter();
				cz = 0;
				break;
			case 1:
				cx = a1.x;
				cy = a1.y;
				cz = a1.z;
				break;
			case 2:
				cx = a1;
				cy = a2;
				cz = 0;
				break;
			case 3:
				cx = a1;
				cy = a2;
				cz = a3;
				break;
			}
		this.x = cx;
		this.y = cy;
		this.z = cz;
		return this;
	}
	, shift: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				this.x += a1.x; this.y += a1.y; this.z += a1.z;
				break;
			case 2:
				this.x += a1; this.y += a2;
				break;
			case 3:
				this.x += a1; this.y += a2; this.z += a3;
				break;
			default:
				break;
		}
		return this;
	}
};

//////// Color ////////

Psychlops.Color = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;

	switch (arguments.length) {
		case 1:
			this.set(iniarg1);
			break;
		case 2:
			this.set(iniarg1, iniarg2);
			break;
		case 3:
			this.set(iniarg1, iniarg2, iniarg3);
			break;
		case 4:
			this.set(iniarg1, iniarg2, iniarg3, iniarg4);
			break;
	}
};
Psychlops.Color.prototype = {
	dup: function () { return new Psychlops.Color(this.r, this.g, this.b, this.a); }
	, equals: function (a) { return a.r == this.r && a.g == this.g && a.b == this.b && a.a == this.a; }
	, set: function (arg1, arg2, arg3, arg4) {
		switch (arguments.length) {
			case 1:
				this.r = arg1;
				this.g = arg1;
				this.b = arg1;
				this.a = 1.0;
				break;
			case 3:
				this.r = arg1;
				this.g = arg2;
				this.b = arg3;
				this.a = 1.0;
				break;
			case 4:
				this.r = arg1;
				this.g = arg2;
				this.b = arg3;
				this.a = arg4;
				break;
		}
		return this;
	}
	, getR: function () { return this.r; }
	, getG: function () { return this.g; }
	, getB: function () { return this.b; }
	, getA: function () { return this.a; }
};
Psychlops.Color.red = new Psychlops.Color(1.0, 0.0, 0.0, 1.0);
Psychlops.Color.green = new Psychlops.Color(0.0, 1.0, 0.0, 1.0);
Psychlops.Color.blue = new Psychlops.Color(0.0, 0.0, 1.0, 1.0);
Psychlops.Color.yellow = new Psychlops.Color(1.0, 1.0, 0.0, 1.0);
Psychlops.Color.magenta = new Psychlops.Color(1.0, 0.0, 1.0, 1.0);
Psychlops.Color.cyan = new Psychlops.Color(0.0, 1.0, 1.0, 1.0);
Psychlops.Color.white = new Psychlops.Color(1.0, 1.0, 1.0, 1.0);
Psychlops.Color.gray = new Psychlops.Color(127.0 / 255.0, 127.0 / 255.0, 127.0 / 255.0, 1.0);
Psychlops.Color.black = new Psychlops.Color(0.0, 0.0, 0.0, 1.0);
Psychlops.Color.transparent = new Psychlops.Color(0.0, 0.0, 0.0, 0.0);
Psychlops.Color.setGammaValue = function (r, g, b) {
	switch (arguments.length) {
		case 0:
			var gr = Psychlops.AppInfo.localSettings.GammaR ? Number(Psychlops.AppInfo.localSettings.GammaR) : 1.0;
			var gg = Psychlops.AppInfo.localSettings.GammaG ? Number(Psychlops.AppInfo.localSettings.GammaG) : 1.0;
			var gb = Psychlops.AppInfo.localSettings.GammaB ? Number(Psychlops.AppInfo.localSettings.GammaB) : 1.0;
			Psychlops.the_canvas.invGammaValue = [1 / gr, 1 / gg, 1 / gb];
			break;
		case 3:
			Psychlops.the_canvas.invGammaValue = [1 / r, 1 / g, 1 / b];
			break;
	}
};



///////// Stroke ////////

Psychlops.Stroke = function (iniarg1, iniarg2, iniarg3) {
	this.color = new Psychlops.Color();
	this.color.set(1.0);
	this.width = 1;
	this.pattern = 0;

	switch (arguments.length) {
		case 1:
			this.set(iniarg1);
			break;
		case 2:
			this.set(iniarg1, iniarg2);
			break;
		case 3:
			this.set(iniarg1, iniarg2, iniarg3);
			break;
	}
};
Psychlops.Stroke.prototype = {
	dup: function () { return new Psychlops.Stroke(this.color, this.width, this.pattern); }
	, set: function (col, wid, pat) {
		switch (arguments.length) {
			case 1:
				this.color = col.dup();
				this.width = 1;
				this.pattern = Psychlops.Stroke.SOLID;
			case 2:
				this.color = col.dup();
				this.width = wid;
				this.pattern = Psychlops.Stroke.SOLID;
				break;
			case 3:
				this.color = col.dup();
				this.width = wid;
				this.pattern = pat;
				break;
		}
		return this;
	}
};
Psychlops.Stroke.null_line = new Psychlops.Stroke(Psychlops.Color.transparent, 0);
Psychlops.Stroke.hair_line = new Psychlops.Stroke(Psychlops.Color.white, 1);
Psychlops.Stroke.SOLID = 0xFFFF;
Psychlops.Stroke.DASHED = 0x0F0F;
Psychlops.Stroke.DOTTED = 0xAAAA;


//////// Input ////////

Psychlops.Input = new Object();
Psychlops.Input._INITIALIZE_ = function () {
	Psychlops.Keyboard._INITIALIZE_();
	Psychlops.Mouse._INITIALIZE_();
}
Psychlops.Input.refresh = function () {
	Psychlops.Keyboard.refresh();
	Psychlops.Mouse.refresh();
}

//////// Keyboard ////////

Psychlops.Keyboard = new Object();
Psychlops.Keyboard._RAW_CODES_ = [["zero", 48], ["one", 49], ["two", 50], ["three", 51], ["four", 52], ["five", 53], ["six", 54], ["seven", 55], ["eight", 56], ["nine", 57], ["a", 65], ["b", 66], ["c", 67], ["d", 68], ["e", 69], ["f", 70], ["g", 71], ["h", 72], ["i", 73], ["j", 74], ["k", 75], ["l", 76], ["m", 77], ["n", 78], ["o", 79], ["p", 80], ["q", 81], ["r", 82], ["s", 83], ["t", 84], ["u", 85], ["v", 86], ["w", 87], ["x", 88], ["y", 89], ["z", 90], ["pad0", 96], ["pad1", 97], ["pad2", 98], ["pad3", 99], ["pad4", 100], ["pad5", 101], ["pad6", 102], ["pad7", 103], ["pad8", 104], ["pad9", 105], ["padperiod", 110], ["padenter", 13], ["padplus", 107], ["padminus", 109], ["padasterisk", 106], ["padslash", 111], ["f1", 112], ["f2", 113], ["f3", 114], ["f4", 115], ["f5", 116], ["f6", 117], ["f7", 118], ["f8", 119], ["f9", 120], ["f10", 121], ["f11", 122], ["f12", 123], ["f13", 124], ["f14", 125], ["f15", 126], ["backspace", 8], ["insert", 45], ["delete", 46], ["end", 35], ["home", 36], ["pageup", 33], ["pagedown", 34], ["tab", 9], ["rtn", 13], ["shift", 16], ["ctrl", 17], ["alt", 18], ["esc", 27], ["spc", 32], ["left", 37], ["up", 38], ["right", 39], ["down", 40], ["comma", 188], ["period", 190], ["slash", 191], ["leftbracket", 219], ["backslash", 220], ["rightbracket", 221], ["at", 192], ["underscore", 226], ["semicolon", 187], ["colon", 186]];
Psychlops.Keyboard._PUSHED_ = new Array(255);
Psychlops.Keyboard._PRESSED_ = new Array(255);
Psychlops.Keyboard._RELEASED_ = new Array(255);
Psychlops.Keyboard.Key = function (c) {
	this.code = c;
};
Psychlops.Keyboard.Key.prototype = {
	pushed: function () {
		var r = Psychlops.Keyboard._PUSHED_[this.code];
		Psychlops.Keyboard._PUSHED_[this.code] = false;
		return r;
	}
	, pressed: function () {
		return Psychlops.Keyboard._PRESSED_[this.code];
	}
	, released: function () {
		var r = Psychlops.Keyboard._RELEASED_[this.code];
		Psychlops.Keyboard._RELEASED_[this.code] = false;
		return r;
	}
};
Psychlops.Keyboard.linkEventCallback = function (elem) {
	elem.tabIndex = 0;
	elem.addEventListener("keydown", function (e) {
		Psychlops.Keyboard._PUSHED_[e.keyCode] = true;
		Psychlops.Keyboard._PRESSED_[e.keyCode] = true;
		if (e.keyCode < 112 || 126 < e.keyCode) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, true);
	elem.addEventListener("keyup", function (e) {
		Psychlops.Keyboard._RELEASED_[e.keyCode] = true;
		Psychlops.Keyboard._PRESSED_[e.keyCode] = false;
		if (e.keyCode < 112 || 126 < e.keyCode) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, true);
};
Psychlops.Keyboard.PUSHED = 0;
Psychlops.Keyboard.PRESSED = 1;
Psychlops.Keyboard.RELEASED = 2;
Psychlops.Keyboard._INITIALIZE_ = function () {
	for (var i = 0; i < Psychlops.Keyboard._RAW_CODES_.length; i += 1) {
		Psychlops.Keyboard[Psychlops.Keyboard._RAW_CODES_[i][0]] = new Psychlops.Keyboard.Key(Psychlops.Keyboard._RAW_CODES_[i][1]);
	}
	Psychlops.Keyboard.refresh();
}
Psychlops.Keyboard.refresh = function () {
	for (var i = 0; i < 255; i += 1) {
		Psychlops.Keyboard._PUSHED_[i] = false;
		Psychlops.Keyboard._PRESSED_[i] = false;
		Psychlops.Keyboard._RELEASED_[i] = false;
	}
};

//////// Mouse ////////

Psychlops.Mouse = new Object();
Psychlops.Mouse.x = 0;
Psychlops.Mouse.y = 0;
Psychlops.Mouse.position = new Psychlops.Point(0, 0);
Psychlops.Mouse.offsetX = 0;
Psychlops.Mouse.offsetY = 0;
Psychlops.Mouse.scrollOffsetX = 0;
Psychlops.Mouse.scrollOffsetY = 0;
Psychlops.Mouse.DEBUG_offsetX = 0;
Psychlops.Mouse.DEBUG_offsetY = 0;
Psychlops.Mouse.downTime = 0;


Psychlops.Mouse.getPosition = function () {
	return new Psychlops.Point(Psychlops.Mouse.x, Psychlops.Mouse.y);
};
Psychlops.Mouse.setPosition = function (a1, a2) {
	if (arguments.length == 1) { Psychlops.Mouse.x = a1.x; Psychlops.Mouse.y = a1.y; } else if (arguments.length == 2) { Psychlops.Mouse.x = a1; Psychlops.Mouse.y = a2; }
};
Psychlops.Mouse.linkEventCallback = function (elem) {
	var calculatePosition_Touch = function (touch) {
		if (Psychlops.AppInfo._transform_style) {
			Psychlops.Mouse.position.x = Psychlops.Mouse.x = (touch.pageX - $(Psychlops.the_canvas._element).offset().left);
			Psychlops.Mouse.position.y = Psychlops.Mouse.y = (touch.pageY - $(Psychlops.the_canvas._element).offset().top);
		} else {
			Psychlops.Mouse.position.x = Psychlops.Mouse.x = (touch.pageX - $(Psychlops.the_canvas._element).offset().left) * Psychlops.Canvas.HiDPIFactor;
			Psychlops.Mouse.position.y = Psychlops.Mouse.y = (touch.pageY - $(Psychlops.the_canvas._element).offset().top) * Psychlops.Canvas.HiDPIFactor;
		}
	}
	var calculatePosition = function (e) {
		if (Psychlops.AppInfo._transform_style) {
			Psychlops.Mouse.position.x = Psychlops.Mouse.x = e.offsetX;
			Psychlops.Mouse.position.y = Psychlops.Mouse.y = e.offsetY;
		} else {
			Psychlops.Mouse.position.x = Psychlops.Mouse.x = e.offsetX * Psychlops.Canvas.HiDPIFactor;
			Psychlops.Mouse.position.y = Psychlops.Mouse.y = e.offsetY * Psychlops.Canvas.HiDPIFactor;
		}
	}

	elem.addEventListener("pointerdown", function (e) {
		if (!Psychlops.Audio._TOUCH_INITIALIZED_) { Psychlops.Audio._TOUCH_INIT_(); }
		Psychlops.Mouse.downTime = Date.now();
		//console.log("d: " + e.button);
		switch (e.button) {
			case 0:
				Psychlops.Mouse.left._pushing();
				break;
			case 1:
				Psychlops.Mouse.middle._pushing();
				break;
			case 2:
				Psychlops.Mouse.right._pushing();
				break;
		}
		calculatePosition(e);
	}, false);
	elem.addEventListener("pointerup", function (e) {
		//console.log("u: " + e.button);
		switch (e.button) {
			case 0:
				Psychlops.Mouse.left._releasing();
				break;
			case 1:
				Psychlops.Mouse.middle._releasing();
				break;
			case 2:
				Psychlops.Mouse.right._releasing();
				break;
		}
		calculatePosition(e);
	}, false);

	elem.addEventListener("pointermove", function (e) {
		if(e.pointerType == "touch" && false && Psychlops.Util.hasTouchEvent) {
		} else {
			calculatePosition(e);
			e.preventDefault();
			e.stopPropagation();
		}
	}, false);
	if (false && Psychlops.Util.hasTouchEvent) {
		elem.addEventListener("touchmove", function (e) {
			var touch_list = e.changedTouches;
			var touch = touch_list[0];
			calculatePosition_Touch(touch);
			e.preventDefault();
			e.stopPropagation();
		}, true);
	}

	elem.addEventListener("mousewheel", function (e) {
		if (typeof e.wheelDeltaX != "undefined") {
			Psychlops.Mouse.scrollOffsetX = - e.wheelDeltaX;
			Psychlops.Mouse.scrollOffsetY = - e.wheelDeltaY;
		} else {
			Psychlops.Mouse.scrollOffsetY = e.detail ? e.detail / - 3 : - e.wheelDelta;
		}
	}, false);
};
Psychlops.Mouse.Button = function (c) {
	this.code = c;
	this.states = [false, false, false, false];
};
Psychlops.Mouse.Button.prototype = {
	pushed: function () {
		var r = this.states[Psychlops.Mouse.Button.PUSHED];
		this.states[Psychlops.Mouse.Button.PUSHED] = false;
		return r;
	}
	, pressed: function () {
		return this.states[Psychlops.Mouse.Button.PRESSED];
	}
	, released: function () {
		var r = this.states[Psychlops.Mouse.Button.RELEASED];
		this.states[Psychlops.Mouse.Button.RELEASED] = false;
		return r;
	}
	, _pushing: function () {
		this.states[Psychlops.Mouse.Button.PUSHED] = true;
		this.states[Psychlops.Mouse.Button.PRESSED] = true;
		this.states[Psychlops.Mouse.Button.CHROME_PUSHED] = true;
	}
	, _releasing: function () {
		this.states[Psychlops.Mouse.Button.RELEASED] = true;
		this.states[Psychlops.Mouse.Button.PRESSED] = false;
	}
};
Psychlops.Mouse.Button.PUSHED = 0;
Psychlops.Mouse.Button.PRESSED = 1;
Psychlops.Mouse.Button.RELEASED = 2;
Psychlops.Mouse.Button.CHROME_PUSHED = 3;

Psychlops.Mouse.left = new Psychlops.Mouse.Button();
Psychlops.Mouse.right = new Psychlops.Mouse.Button();
Psychlops.Mouse.middle = new Psychlops.Mouse.Button();
Psychlops.Mouse.getWheelDelta = function () {
	return new Psychlops.Point(Psychlops.Mouse.scrollOffsetX, Psychlops.Mouse.scrollOffsetY);
};
Psychlops.Mouse.show = function () {
};
Psychlops.Mouse.hide = function () {
};
Psychlops.Mouse._INITIALIZE_ = function () {
	Psychlops.Mouse.refresh();
	Psychlops.Mouse.downTime = Date.now();
	Psychlops.Mouse.longPressed = false;
}
Psychlops.Mouse.refresh = function () {
	Psychlops.Mouse.position.x = Psychlops.Mouse.x = 0;
	Psychlops.Mouse.position.y = Psychlops.Mouse.y = 0;
	for (var i = 0; i < 3; i += 1) {
		Psychlops.Mouse.left[i] = false;
		Psychlops.Mouse.right[i] = false;
		Psychlops.Mouse.middle[i] = false;
	}
};

//////// Clock ////////
Psychlops.Clock = function () {
	this.tick = new Date();
};
Psychlops.Clock.prototype = {
	dup: function () { return new Psychlops.Clock(); }
	, update: function () {
		this.tick = new Date();
	}
	, at_msec: function () {
		return this.tick.getTime();
	}
};

//////// Display ////////
Psychlops.Display = new Object();
Psychlops.Display.clear = function (col) { Psychlops.the_canvas.clear(col); }
Psychlops.Display.flip = function () { return Psychlops.the_canvas.flip(); }
Psychlops.Display.msg = function (s, l, t, c, horiz_align, vertical_align, max__width) {
	var col;
	switch (arguments.length) {
		case 4:
			col = c;
			break;
		default:
			col = Psychlops.Color.black;
	}

	var letr = new Psychlops.Letters();
	if (typeof s == "string") {
		letr.setString(s);
	} else if ("vertical_align" in s) {
		letr = s;
	} else {
		alert("Display::msg: string is required.");
	}
	letr.align = horiz_align;
	letr.vertical_align = vertical_align;
	letr.centering(l, t - 20);
	letr.draw(col);
};
Psychlops.Display.message = function (s, l, t, c) {
	Psychlops.Display.msg(s, l, t, c);
};
Psychlops.Display.primary = {
	width: window.screen.width * window.devicePixelRatio,
	height: window.screen.height * window.devicePixelRatio,
	refresh_rate: 60,
	name: "",
	area: null
};

//////// Canvas ////////

Psychlops.the_canvas = null;
Psychlops.flip_lock = false;
Psychlops.flip_frame = 1;
Psychlops.flip_last_clock = 0;
Psychlops.draw_loop = null;
Psychlops.flip_interval = function () {
	if (!Psychlops.flip_lock) {
		nt = Date.now();
		if (16 * (Psychlops.flip_frame - 1) + 10 > nt - Psychlops.flip_last_clock) { return; }

		Psychlops.flip_lock = true;
		Psychlops.draw_loop();
		Psychlops.flip_lock = false;

		Psychlops.flip_last_clock = Date.now();
	}
};

Psychlops.Canvas = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.SHADER_TYPE = { fragment: 1, vertex: 2 }

	this.invGammaValue = [1.0, 1.0, 1.0];
	this.uCoord = [0.0, 0.0, 0.0, 0.0];
	this.uParam = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	this.width = 800 * window.devicePixelRatio;
	this.height = 600 * window.devicePixelRatio;
	this.getWidth = function () { return this.width; }
	this.getHeight = function () { return this.height; }
	this.getHcenter = function () { return this.width / 2.0; }
	this.getVcenter = function () { return this.height / 2.0; }
	this.getCenter = function () { return new Psychlops.Point(this.width / 2.0, this.height / 2.0); };

	this.context = null;
	this.gl = null;
	this.popupwindow = null;
	this.antialiased = false;


	this.ShaderParams = function () {
		this.program = null;
		this.vertexAtt = null;
		this.colorAtt = null;
		this.rotateAtt = null;
	}
	this.shapeShader = new this.ShaderParams();
	this.imageShader = new this.ShaderParams();

	// timer
	this.lastFlipTime = 0;
	this.lastEllapsedTime = 0;
	this.startTime = 0;
	this.endTime = 0;
	this.doShowFPS = false;

	// buffers
	this.colorRenderBuffer = [0, 0];
	this.depthRenderBuffer = [0, 0];
	this.frameBuffer = [0, 0];
	this.currentFrameBuffer = 0;

	//// Rectangle buffer
	this.rotationBuffer = null;
	this.squareVerticesBuffer = null;
	this.squareVerticesColorBuffer = null;
	this.rectF32Buffer = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	this.rectF32ColorBuffer = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	this.imgVerticesTextureCoordBuffer = null;
	this.shaderFieldCoordBuffer = null;
	this.shaderFieldParamBuffer = null;

	// matricies
	this.mvMatrix = null;
	this.vertexPositionAttribute = null;
	this.perspectiveMatrix = null;

	this.set = function (a1, a2, a3, a4) {
		var elem_id = Psychlops.Util.canvas_element_id;
		this.width = 800 * window.devicePixelRatio;
		this.height = 600 * window.devicePixelRatio;
		switch (arguments.length) {
			case 1:
				if (a1 == Psychlops.Canvas.window) {
					this._fullscreen = false;
					this.initialize(elem_id);
				}
				else if (a1 == Psychlops.Canvas.fullscreen) {
					if (Psychlops.Util.trueFullscreen) {
						this.width = Psychlops.Display.primary.width;
						this.height = Psychlops.Display.primary.height;
					} else {
						this.width = Math.round(window.innerWidth * window.devicePixelRatio);
						this.height = Math.round(window.innerHeight * window.devicePixelRatio);
					}
					this._fullscreen = true;
					this.initialize(elem_id);
				}
				break;
			case 2:
				if (true) {
					if (true) {
						this.width = a1;
						this.height = a2;
					}
					this.initialize(elem_id);
				}
				break;
			case 3:
				if (true) {
					this.width = a1;
					this.height = a2;
					if (a3 == Psychlops.Canvas.fullscreen) {
						//this._fullscreen = true;
						this._fullscreen = false;
					} else {
						this._fullscreen = false;
					}
					this.initialize(elem_id);
				}
				break;
			case 4:
				if (true) {
					this.width = a1;
					this.height = a2;
					this._fullscreen = true;
					this.initialize(elem_id);
				}
				break;
			default:
		}
		return this;
	};

	this.initialize = function (element_id) {
		this.initWebGL(element_id);

		this.initRenderProp(this.gl);
		this.initShaders(this.gl);
		this.initBuffers(this.gl);

		Psychlops.the_canvas = this;
	};

	this._trueFullScreen = function () {
	};
	this._pseudoFullScreen = function (element_id) {
		initWebGL(element_id);
	};
	this._resizeTimer = null;
	this._revertHiDPI = function (v) {
		return v * Psychlops.Canvas.HiDPIFactor;
	};
	this._resizeOnPseudoFullscreen = function (evt) {
		if (true) {
			if (this._resizeTimer) { window.clearTimeout(this._resizeTimer); } this._resizeTimer = window.setTimeout(function () {
				var w = this._revertHiDPI(window.innerWidth), h = this._revertHiDPI(window.innerHeight);
				var element = document.getElementById(Psychlops.Util.canvas_element_id);
				element.width = w;
				element.height = h;
				element.style.width = '100%';
				element.style.height = '100%';
				this.width = w;
				this.height = h;
			}, 100);
		}
	}
	this._element = null;
	this._parentelement = null;
	this._element_id = null;
	this.initWebGL = function (element_id) {
		Psychlops.AppInfo._transform_style = (false
			|| (Psychlops.Util.environment.host.name == "firefox" && Psychlops.Util.environment.host.major_version >= 16)
			//|| (Psychlops.Util.environment.host.name == "chrome" && Psychlops.Util.environment.host.major_version >= 36)
			//|| (Psychlops.Util.environment.host.name == "safari" && Psychlops.Util.environment.host.major_version >= 9)
			//|| (Psychlops.Util.environment.host.name == "edge") //overflow:hidden?;
		);
		var style_width = this.width / Psychlops.Canvas.HiDPIFactor;
		var style_height = this.height / Psychlops.Canvas.HiDPIFactor;
		var style_zoom = "zoom:" + (1.0 / Psychlops.Canvas.HiDPIFactor + ";");
		if (Psychlops.AppInfo._transform_style) {
			var trans_size = -100 * (Psychlops.Canvas.HiDPIFactor - 1.0) / 2;
			var scale_ratio = 1.0 / Psychlops.Canvas.HiDPIFactor;
			style_zoom = "transform: scale(" + scale_ratio + "," + scale_ratio + ")"
						+ " translate(" + trans_size + "%," + trans_size + "%);";
			style_zoom += "position:absolute;left:0;top:0;";
		}

		var s;
		//if ((!Psychlops.Util.trueFullscreen) && this._fullscreen) {
		if (this._fullscreen) {
			//s = '<canvas id="' + element_id + '" width="' + this.width + '" height="' + this.height + '" tabindex="0" style="z-index:9999;position:fixed;top:0;left:0;width:' + style_width + ';height:' + style_height + ';">We are sorry, but your browser does not seem to support WebGL.</canvas>';
			s = '<canvas id="' + element_id + '" width="' + this.width + '" height="' + this.height + '" tabindex="0" style="touch-action:none;z-index:9999;position:fixed;top:0;left:0;' + style_zoom + ';">We are sorry, but your browser does not seem to support WebGL.</canvas>';
			//window.addEventListener('resize', this._resizeOnPseudoFullscreen);
		} else {
			//s = '<canvas id="' + element_id + '" width="' + this.width + '" height="' + this.height + '" tabindex="0" style="width:' + style_width + ';height:' + style_height + ';">We are sorry, but your browser does not seem to support WebGL.</canvas>';
			s = '<canvas id="' + element_id + '" width="' + this.width + '" height="' + this.height + '" tabindex="0" style="touch-action:none;' + style_zoom + ';">We are sorry, but your browser does not seem to support WebGL.</canvas>';
		}
		var div = document.createElement('div');
		div.innerHTML = s;
		if (Psychlops.AppInfo._transform_style) { div.style.cssText = "margin:0;padding:0;width:" + style_width + "px;height:" + style_height + "px;"; }
		var newelement = div.childNodes[0];

		var element;
		if (typeof (Psychlops.Util.window_canvas_container_element_id) == "string" && typeof (Psychlops.Util.fullscreen_canvas_container_element_id) == "string") {
			var window_container = document.getElementById(Psychlops.Util.window_canvas_container_element_id);
			var fullscreen_container = document.getElementById(Psychlops.Util.fullscreen_canvas_container_element_id);
			if (typeof Psychlops.Canvas.resizeCallback == "function") {
				Psychlops.Canvas.resizeCallback(style_width, style_height);
			}
			window_container.innerHTML = "";
			fullscreen_container.innerHTML = "";
			if (this._fullscreen) {
				fullscreen_container.appendChild(newelement);
				Psychlops.Util.makeFullscreenCallback();
			} else {
				window_container.appendChild(div); // (newelement);
			}
			element = newelement;

			try { this.gl = element.getContext('webgl', { antialias: this.antialiased }) || element.getContext("experimental-webgl", { antialias: this.antialiased }); }
			catch (e) { }
			if (!this.gl) { alert("Unable to initialize WebGL. Your browser may not support it."); }

			Psychlops.Keyboard.linkEventCallback(element);
			Psychlops.Mouse.linkEventCallback(element);
			Psychlops.Mouse.offsetX = element.offsetLeft;
			Psychlops.Mouse.offsetY = element.offsetTop;

			element.focus();
			this._element = element;
			this._parentelement = this._fullscreen ? fullscreen_container : window_container;
			this._element_id = element_id;
		} else {
			alert("HTML Canvas element was not found.");
		}
	}
	this.terminateWebGL = function (element_id) {
	}

	this.initRenderProp = function (gl) {
		//alert(this.width + "  " + window.screen.width);
		//this.perspectiveMatrix = makeOrtho(-0.625, this.width-0.625, this.height-0.625, -0.625, 0.1, 100.0);
		this.perspectiveMatrix = makeOrtho(+0.375, this.width + 0.375, this.height + 0.375, +0.375, 0.1, 100.0);
		this.loadIdentity();
		this.mvTranslate([-0.0, 0.0, -6.0]);

		//gl.enable(gl.ALPHA_TEST);
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		//gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
		//blendfunc���g���� ���� s*a + d*(1-a)�ł͂Ȃ��@s*a+w*(1-a) + d*(1-a)+w*a ��w=���ɂȂ��Ă���
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.DITHER);
		gl.disable(gl.STENCIL_TEST);
		//gl.enable(gl.LINE_STIPPLE);

	};

	this.initBuffers = function (gl) {
		// Render
		/*
				this.frameBuffer[0] = gl.createRenderbuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer[0]);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, this.width, this.height);
		
				this.frameBuffer[1] = gl.createRenderbuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer[1]);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, this.width, this.height);
		
				gl.bindRenderbuffer(gl.RENDERBUFFER, null);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		*/

		// Rectangle
		var vertices = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this.squareVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

		var colors = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this.squareVerticesColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

		var rotation = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this.rotationBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.rotationBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rotation), gl.DYNAMIC_DRAW);

		// Ellipse
		vertices = new Array(32 * 3);
		for (var i = 0; i < 32 * 3; i += 1) { vertices[i] = 0; }
		this.ellipseVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.ellipseVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

		colors = new Array(32 * 4);
		for (var i = 0; i < 32 * 4; i += 1) { colors[i] = 0; }
		this.ellipseVerticesColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.ellipseVerticesColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

		// Image
		var textureCoordinates = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this.imgVerticesTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.imgVerticesTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.DYNAMIC_DRAW);

		// Shader
		textureCoordinates = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this.shaderFieldCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderFieldCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.DYNAMIC_DRAW);
	};

	this.createShader = function (vert, frag) {
		var gl = this.gl;
		var vertexShader = this.getShader(gl, vert, this.SHADER_TYPE.vertex);
		var fragmentShader = this.getShader(gl, frag, this.SHADER_TYPE.fragment);
		var program = gl.createProgram();

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { alert("Unable to initialize the shader program."); }

		gl.useProgram(program);
		var vertexAtt = gl.getAttribLocation(program, "aVertexPosition");
		gl.enableVertexAttribArray(vertexAtt);
		var rotateAtt = gl.getAttribLocation(program, "aRotate");
		gl.enableVertexAttribArray(rotateAtt);

		var coordAtt = gl.getAttribLocation(program, "aCoord");
		gl.enableVertexAttribArray(coordAtt);
		if (0 <= vert.indexOf("aTextureCoord")) {
			var texAtt = gl.getAttribLocation(program, "aTextureCoord");
			gl.enableVertexAttribArray(texAtt);
		}
		this.setMatrixUniforms(program);
		this.gl.uniform3fv(this.gl.getUniformLocation(program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		this.gl.uniform4fv(this.gl.getUniformLocation(program, "uCoord"), new Float32Array(this.uCoord));
		this.gl.uniformMatrix4fv(this.gl.getUniformLocation(program, "uParam"), false, new Float32Array(this.uParam));

		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.gl.useProgram(this.shapeShader.program);

		var r = { "vertexShader": vertexShader, "fragmentShader": fragmentShader, "program": program, "vertexAtt": vertexAtt, "coordAtt": coordAtt, "rotateAtt": rotateAtt };
		if (0 <= vert.indexOf("aTextureCoord")) { r.texAtt = texAtt; }
		return r;
	};
	this.drawShader = function (shader, area, coord, param, params_quarter_length) {
		//var width_s = area.getWidth() - 1, height_s = area.getHeight() - 1;
		var width_s = area.getWidth(), height_s = area.getHeight();
		var vl = -coord[0], vr = width_s - coord[0], vt = -coord[1], vb = height_s - coord[1];

		var v = [
			area.right + 1, area.bottom + 1, 0.0,
			area.left, area.bottom + 1, 0.0,
			area.right + 1, area.top, 0.0,
			area.left, area.top, 0.0
		];
		var t = [vr, vb, 0, 0, vl, vb, 0, 0, vr, vt, 0, 0, vl, vt, 0, 0];

		this.gl.useProgram(shader.program);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVerticesBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(v), this.gl.DYNAMIC_DRAW);
		this.gl.vertexAttribPointer(shader.vertexAtt, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shaderFieldCoordBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(t), this.gl.DYNAMIC_DRAW);
		this.gl.vertexAttribPointer(shader.coordAtt, 4, this.gl.FLOAT, false, 0, 0);

		this.gl.uniform3fv(this.gl.getUniformLocation(shader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		this.gl.uniform4fv(this.gl.getUniformLocation(shader.program, "uCoord"), new Float32Array(coord));
		this.gl.uniformMatrix4fv(this.gl.getUniformLocation(shader.program, "uParam"), false, new Float32Array(param));
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

		this.gl.useProgram(this.shapeShader.program);
		this.gl.uniform3fv(this.gl.getUniformLocation(this.shapeShader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		this.gl.useProgram(this.shapeShader.program);
		this.gl.uniform4fv(this.gl.getUniformLocation(this.shapeShader.program, "uCoord"), new Float32Array(this.uCoord));
	}
	this.drawShaderImage = function (shader, image_array, coord, param, params_quarter_length) {
		var img = image_array[0];
		if (image_array.length == 2) {
			var img2 = image_array[1];
		}
		if (img.targetarea_ == null) { alert("The image object is not set"); }
		if (!img.hasCache()) { this.cacheImageBody(img); }
		if (image_array.length == 2 && !img2.hasCache()) { this.cacheImageBody(img2); }
		var left = img.targetarea_.getLeft(), top = img.targetarea_.getTop();
		var WID = img.targetarea_.getWidth(), HEI = img.targetarea_.getHeight();
		
		var width = img.getWidth() * (img._zoomPercentage_ / 100), height = img.getHeight() * (img._zoomPercentage_ / 100);
		var tex_top = (img.height) / img.storage.height;
		var tex_bottom = 0.0;
		var tex_right = (img.width - 1) / (img.storage.width - 1);
		var v, t, u;
		if (img._zoomPercentage_ == 100) {
			v = [
				width / 2, height / 2, 0.0,
				-width / 2, height / 2, 0.0,
				width / 2, -height / 2, 0.0,
				-width / 2, -height / 2, 0.0,
			];
		} else {
			v = [
				width / 2, height / 2, 0.0,
				-width / 2, height / 2, 0.0,
				width / 2, -height / 2, 0.0,
				-width / 2, -height / 2, 0.0,
			];
			tex_top = (img.height - 0.375) / img.storage.height;
			tex_right = (img.width - 1.375) / (img.storage.width - 1);
		}
		t = [
			tex_right, tex_top,
			0.0, tex_top,
			tex_right, tex_bottom,
			0.0, tex_bottom,
		];
		rot = [
			img._rotate_, left + width / 2, top + height / 2,
			img._rotate_, left + width / 2, top + height / 2,
			img._rotate_, left + width / 2, top + height / 2,
			img._rotate_, left + width / 2, top + height / 2,
		];
		u = [img.storage.width, img.storage.height, WID, HEI];

		var width_s = img.targetarea_.getWidth() - 1, height_s = img.targetarea_.getHeight() - 1;
		var vl = -coord[0], vr = width_s - coord[0], vt = -coord[1], vb = height_s - coord[1];
		var s = [vr, vb, 0, 0, vl, vb, 0, 0, vr, vt, 0, 0, vl, vt, 0, 0];

		var gl = this.gl;

		gl.useProgram(shader.program);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(shader.vertexAtt, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderFieldCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(s), this.gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(shader.coordAtt, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.imgVerticesTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(shader.texAtt, 2, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(shader.rotateAtt);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.rotationBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rot), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(shader.rotateAtt, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, img.storage.VRAMoffset);
		if (true || img._zoomPercentage_ != 100) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
		}
		gl.uniform1i(gl.getUniformLocation(shader.program, "uSampler0"), 0);
		if (image_array.length == 2) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, img2.storage.VRAMoffset);
			if (true || img._zoomPercentage_ != 100) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
			}
			gl.uniform1i(gl.getUniformLocation(shader.program, "uSampler1"), 1);
		}

		gl.uniform3fv(gl.getUniformLocation(shader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		gl.uniform4fv(gl.getUniformLocation(shader.program, "uCoord"), new Float32Array(u));
		gl.uniformMatrix4fv(gl.getUniformLocation(shader.program, "uParam"), false, new Float32Array(param));
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		if (true || img._zoomPercentage_ != 100) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(this.shapeShader.program);
		gl.uniform3fv(gl.getUniformLocation(this.shapeShader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		gl.uniform4fv(gl.getUniformLocation(this.shapeShader.program, "uCoord"), new Float32Array(this.uCoord));
	}

	this.initShaders = function (gl) {
		var vertexShader = this.getShader(gl, "\
attribute vec3 aVertexPosition; \
attribute vec4 aVertexColor; \
attribute vec3 aRotate; \
uniform mat4 uMVMatrix; \
uniform mat4 uPMatrix; \
varying lowp vec4 vColor; \
void main(void) { \
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); \
	vColor = aVertexColor; \
} \
", this.SHADER_TYPE.vertex);
		var fragmentShader = this.getShader(gl, "varying mediump vec4 vColor; uniform highp vec3 uInvColorGamma; void main(void) { lowp vec4 c = vColor; c.r = pow(c.r, uInvColorGamma.r); c.g = pow(c.g, uInvColorGamma.g); c.b = pow(c.b, uInvColorGamma.b); gl_FragColor = c; }", this.SHADER_TYPE.fragment);

		var texVertexShader = this.getShader(gl, "\
vec3 translate(vec3 p, vec3 base){ \
    return base + p; \
} \
vec3 rotate(vec3 p, float angle, vec3 axis){ \
    vec3 a = normalize(axis); \
    float s = sin(angle); \
    float c = cos(angle); \
    float r = 1.0 - c; \
    mat3 m = mat3( \
        a.x * a.x * r + c, \
        a.y * a.x * r + a.z * s, \
        a.z * a.x * r - a.y * s, \
        a.x * a.y * r - a.z * s, \
        a.y * a.y * r + c, \
        a.z * a.y * r + a.x * s, \
        a.x * a.z * r + a.y * s, \
        a.y * a.z * r - a.x * s, \
        a.z * a.z * r + c \
    ); \
    return m * p; \
} \
attribute vec3 aVertexPosition; \
attribute vec2 aTextureCoord; \
attribute vec3 aRotate; \
uniform mat4 uMVMatrix; \
uniform mat4 uPMatrix; \
varying highp vec2 vTextureCoord; \
void main(void) { \
	vec3 v = rotate(aVertexPosition, float(aRotate.x), vec3(0.0,0.0,1.0)); \
	v = translate(v, vec3(aRotate[1], aRotate[2], 0.0)); \
	gl_Position = uPMatrix * uMVMatrix * vec4(v, 1.0); \
	vTextureCoord = aTextureCoord; \
} \
", this.SHADER_TYPE.vertex);
		var texFragmentShader = this.getShader(gl, "varying highp vec2 vTextureCoord; uniform highp vec3 uInvColorGamma; uniform sampler2D uSampler; void main(void) { lowp vec4 c = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); c.r = pow(c.r, uInvColorGamma.r); c.g = pow(c.g, uInvColorGamma.g); c.b = pow(c.b, uInvColorGamma.b); gl_FragColor = c; }", this.SHADER_TYPE.fragment);

		//dither
		//var texFragmentShader = this.getShader(gl, "varying highp vec2 vTextureCoord; uniform lowp vec3 uInvColorGamma; uniform sampler2D uSampler; void main(void) { lowp vec4 c = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); c.r = pow(c.r, uInvColorGamma.r); c.g = pow(c.g, uInvColorGamma.g); c.b = pow(c.b, uInvColorGamma.b); gl_FragColor = c; }", this.SHADER_TYPE.fragment );

		//		var texFragmentShader = this.getShader(gl, "varying highp vec2 vTextureCoord; uniform sampler2D uSampler; void main(void) { gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); }", this.SHADER_TYPE.fragment );
		//**	var texFragmentShader = this.getShader(gl, "varying highp vec2 vTextureCoord; uniform sampler2D uSampler; void main(void) { highp vec4 c = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); gl_FragColor = vec4(c[3], c[3],c[3],1.0); }", this.SHADER_TYPE.fragment );

		this.imageShader.program = gl.createProgram();
		gl.attachShader(this.imageShader.program, texVertexShader);
		gl.attachShader(this.imageShader.program, texFragmentShader);
		gl.linkProgram(this.imageShader.program);

		if (!gl.getProgramParameter(this.imageShader.program, gl.LINK_STATUS)) {
			alert("Unable to initialize the imageShader program.");
		}
		gl.useProgram(this.imageShader.program);

		this.imageShader.vertexAtt = gl.getAttribLocation(this.imageShader.program, "aVertexPosition");
		gl.enableVertexAttribArray(this.imageShader.vertexAtt);

		this.imageShader.colorAtt = gl.getAttribLocation(this.imageShader.program, "aTextureCoord");
		gl.enableVertexAttribArray(this.imageShader.colorAtt);

		this.imageShader.rotateAtt = gl.getAttribLocation(this.imageShader.program, "aRotate");
		gl.enableVertexAttribArray(this.imageShader.rotateAtt);

		this.setMatrixUniforms(this.imageShader.program);



		this.shapeShader.program = gl.createProgram();
		gl.attachShader(this.shapeShader.program, vertexShader);
		gl.attachShader(this.shapeShader.program, fragmentShader);
		gl.linkProgram(this.shapeShader.program);

		if (!gl.getProgramParameter(this.shapeShader.program, gl.LINK_STATUS)) {
			alert("Unable to initialize the shapeShader program.");
		}
		gl.useProgram(this.shapeShader.program);

		this.shapeShader.vertexAtt = gl.getAttribLocation(this.shapeShader.program, "aVertexPosition");
		gl.enableVertexAttribArray(this.shapeShader.vertexAtt);

		this.shapeShader.colorAtt = gl.getAttribLocation(this.shapeShader.program, "aVertexColor");
		gl.enableVertexAttribArray(this.shapeShader.colorAtt);

		this.shapeShader.rotateAtt = gl.getAttribLocation(this.shapeShader.program, "aRotate");
		if(this.shapeShader.rotateAtt>=0) { gl.enableVertexAttribArray(this.shapeShader.rotateAtt); }

		this.setMatrixUniforms(this.shapeShader.program);
		this.gl.uniform3fv(this.gl.getUniformLocation(this.shapeShader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		this.setMatrixUniforms(this.shapeShader.program);
		this.gl.uniform4fv(this.gl.getUniformLocation(this.shapeShader.program, "uCoord"), new Float32Array(this.uCoord));

		// https://qiita.com/emadurandal/items/5966c8374f03d4de3266
	};

	this.getShader = function (gl, theSource, shadertype) {
		if (!theSource) { return null; }

		var shader;
		if (shadertype == 1) {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else {
			shader = gl.createShader(gl.VERTEX_SHADER);
		}
		gl.shaderSource(shader, theSource);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	};

	//this.flip = function* (arg1) {
	this.flip = function (arg1) {
		Psychlops.flip_frame = arg1 || 1;
		var currentFlipTime = Date.now();
		var ellapsed = currentFlipTime - this.lastFlipTime;
		this.lastFlipTime = currentFlipTime;
		this.lastEllapsedTime = ellapsed;
		if (this.doShowFPS) {
			let letters = sprintf("%");
			this.var(ellapsed, this.getWidth() - 150, 100, Psychlops.Color.cyan);
		}

		this.gl.flush();

		if (this.currentFrameBuffer == 0) { this.currentFrameBuffer = 1; }
		else { this.currentFrameBuffer = 0; }

		//// Mouse
		Psychlops.Mouse.scrollOffsetX = 0;
		Psychlops.Mouse.scrollOffsetY = 0;
		Psychlops.Mouse.left.states[Psychlops.Mouse.Button.CHROME_PUSHED] = false;
		//// Mouse

		return ellapsed;

		//yield;
		//gl.bindFramebuffer(gl.TEXTURE_2D, this.frameBuffer[this.currentFrameBuffer]);
	};
	this.setGammaValue = function (r, g, b) {
		this.invGammaValue = [1 / r, 1 / g, 1 / b];
	};

	this.clear = function (arg1) {
		var c = arg1 || new Psychlops.Color(0.0, 0.0, 0.0, 1.0);
		if (typeof c == "number") { c = new Psychlops.Color(c, c, c, 1.0); }
		if (!Psychlops.Util.useNoisyBit) {
			this.gl.clearColor(Math.pow(c.r, this.invGammaValue[0]), Math.pow(c.g, this.invGammaValue[1]), Math.pow(c.b, this.invGammaValue[2]), c.a);
			this.gl.clearDepth(1.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		} else {
			if (typeof Psychlops.Figures.NoisyBitClearGLSL.instance == "undefined") {
				Psychlops.Figures.NoisyBitClearGLSL.instance = new Psychlops.Figures.NoisyBitClearGLSL();
			}
			Psychlops.Figures.NoisyBitClearGLSL.instance.area.set(this.getWidth(), this.getHeight());
			Psychlops.Figures.NoisyBitClearGLSL.instance.fill.set(c.r, c.g, c.b);
			Psychlops.Figures.NoisyBitClearGLSL.instance.draw(this);
		}
	};

	this.line = function (arg1) {
		var m1 = (arg1.end.y - arg1.start.y) / (arg1.end.x - arg1.start.x);
		var m2 = -1 / m1;
		var th = Math.atan2(m2, 1);
		var xs = arg1.stroke.width * cos(th);
		var ys = arg1.stroke.width * sin(th);

		var poly = new Psychlops.Polygon();
		//poly.append(arg1.start.x, arg1.start.y);
		//poly.append(arg1.end.x, arg1.end.y);
		poly.append(arg1.start.x + xs, arg1.start.y + ys);
		poly.append(arg1.start.x - xs, arg1.start.y - ys);
		poly.append(arg1.end.x - xs, arg1.end.y - ys);
		poly.append(arg1.end.x + xs, arg1.end.y + ys);
		poly.fill = arg1.stroke.color.dup();
		poly.draw();
	}
	this.rect = function (arg1) {
		// check type here //

		col = arg1.fill;
		var vertices = [
			arg1.left, arg1.top, 0.0,
			arg1.right + 1, arg1.top, 0.0,
			arg1.right + 1, arg1.bottom + 1, 0.0,
			arg1.left, arg1.bottom + 1, 0.0,
		];
		var colors = new Array(4 * 4);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVerticesBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
		this.gl.vertexAttribPointer(this.shapeShader.vertexAtt, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVerticesColorBuffer);
		this.gl.vertexAttribPointer(this.shapeShader.colorAtt, 4, this.gl.FLOAT, false, 0, 0);

		this.gl.disableVertexAttribArray(this.imageShader.rotateAtt);
		//this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rotationBuffer);
		//this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(rot), this.gl.DYNAMIC_DRAW);
		//this.gl.vertexAttribPointer(this.shapeShader.rotateAtt, 3, this.gl.FLOAT, false, 0, 0);

		if (arg1.fill.a != 0) {
			col = arg1.fill;
			for (var i = 0; i < 4; i += 1) { colors[i * 4] = col.r; colors[i * 4 + 1] = col.g; colors[i * 4 + 2] = col.b; colors[i * 4 + 3] = col.a; }
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
			this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
		}
		if (arg1.stroke != null && arg1.stroke.color.a != 0) {
			col = arg1.stroke.color;
			for (var i = 0; i < 4; i += 1) { colors[i * 4] = col.r; colors[i * 4 + 1] = col.g; colors[i * 4 + 2] = col.b; colors[i * 4 + 3] = col.a; }
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
			this.gl.lineWidth(arg1.stroke.width);
			//this.gl.lineStipple(arg1.stroke.pattern);
			this.gl.drawArrays(this.gl.LINE_LOOP, 0, 4);
		}
	};
	this.ellipse = function (arg1) {
		// check type here //

		var col;
		var h = arg1.getCenter().x, v = arg1.getCenter().y;
		var hw = arg1.getWidth() / 2.0, hh = arg1.getHeight() / 2.0;

		var resolution = Math.floor(Math.sqrt(hw * hh) / 4);
		if (resolution < 32) { resolution = 32; }

		var vertices = new Array(resolution * 3);
		for (var i = 0; i < resolution; i += 1) {
			vertices[i * 3 + 0] = h + hw * Math.cos(2 * Math.PI * i / resolution);
			vertices[i * 3 + 1] = v + hh * Math.sin(2 * Math.PI * i / resolution);
			vertices[i * 3 + 2] = 0;
		}
		var colors = new Array(resolution * 4);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ellipseVerticesBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
		this.gl.vertexAttribPointer(this.shapeShader.vertexAtt, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ellipseVerticesColorBuffer);
		this.gl.vertexAttribPointer(this.shapeShader.colorAtt, 4, this.gl.FLOAT, false, 0, 0);

		this.gl.disableVertexAttribArray(this.imageShader.rotateAtt);

		if (arg1.fill.a != 0) {
			col = arg1.fill;
			for (var i = 0; i < resolution; i += 1) { colors[i * 4] = col.r; colors[i * 4 + 1] = col.g; colors[i * 4 + 2] = col.b; colors[i * 4 + 3] = col.a; }
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
			this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, resolution);
		}
		if (arg1.stroke != null && arg1.stroke.color.a != 0) {
			col = arg1.stroke.color;
			for (var i = 0; i < resolution; i += 1) { colors[i * 4] = col.r; colors[i * 4 + 1] = col.g; colors[i * 4 + 2] = col.b; colors[i * 4 + 3] = col.a; }
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
			this.gl.lineWidth(arg1.stroke.width);
			this.gl.drawArrays(this.gl.LINE_LOOP, 0, resolution);
		}

	};
	this.polygon = function (arg1) {
		// check type here //

		var col;
		var h = arg1.datum.x, v = arg1.datum.y, d = arg1.datum.z;
		var nVerts = arg1.vertices.length;

		var vertices = new Array(nVerts * 3);
		for (var i = 0; i < nVerts; i += 1) {
			vertices[i * 3 + 0] = h + arg1.vertices[i].x;
			vertices[i * 3 + 1] = v + arg1.vertices[i].y;
			vertices[i * 3 + 2] = d + arg1.vertices[i].z;
		}
		var colors = new Array(nVerts * 4);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ellipseVerticesBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
		this.gl.vertexAttribPointer(this.shapeShader.vertexAtt, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ellipseVerticesColorBuffer);
		this.gl.vertexAttribPointer(this.shapeShader.colorAtt, 4, this.gl.FLOAT, false, 0, 0);

		this.gl.disableVertexAttribArray(this.imageShader.rotateAtt);

		if (arg1.fill.a != 0) {
			col = arg1.fill;
			for (var i = 0; i < nVerts; i += 1) { colors[i * 4] = col.r; colors[i * 4 + 1] = col.g; colors[i * 4 + 2] = col.b; colors[i * 4 + 3] = col.a; }
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
			this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, nVerts);
		}
		if (arg1.stroke != null && arg1.stroke.color.a != 0) {
			col = arg1.stroke.color;
			/*
			for (var i = 0; i < nVerts; i += 1) { colors[i * 4] = col.r; colors[i * 4 + 1] = col.g; colors[i * 4 + 2] = col.b; colors[i * 4 + 3] = col.a; }
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
			this.gl.lineWidth(arg1.stroke.width);
			this.gl.drawArrays(this.gl.LINE_LOOP, 0, nVerts);
			*/
			var str = new Psychlops.Line();
			str.stroke = arg1.stroke.dup();
			for (var i = 1; i < nVerts; i += 1) {
				str.set(arg1.vertices[i - 1].x + h, arg1.vertices[i - 1].y + v, arg1.vertices[i].x + h, arg1.vertices[i].y + v);
				str.draw();
			}
			str.set(arg1.vertices[nVerts - 1].x + h, arg1.vertices[nVerts - 1].y + v, arg1.vertices[0].x + h, arg1.vertices[0].y + v);
			str.draw();
		}

	};

	this.loadIdentity = function () {
		this.mvMatrix = Matrix.I(4);
	};

	this.multMatrix = function (m) {
		this.mvMatrix = this.mvMatrix.x(m);
	};

	this.mvTranslate = function (v) {
		this.multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
	};

	this.setMatrixUniforms = function (program) {
		var pUniform = this.gl.getUniformLocation(program, "uPMatrix");
		this.gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

		var mvUniform = this.gl.getUniformLocation(program, "uMVMatrix");
		this.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(this.mvMatrix.flatten()));
	};

	this.cacheImageBody = function (arg) {
		if (arg.hasCache()) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, arg.storage.VRAMoffset);
			this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, arg.storage.width, arg.storage.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arg.storage.data);
		} else {
			arg.storage.VRAMoffset = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, arg.storage.VRAMoffset);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, arg.storage.width, arg.storage.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arg.storage.data);
			//this.gl.generateMipmap(this.gl.TEXTURE_2D);
		}
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	};
	this.cacheImage = function (img) {
		this.cacheImageBody(img);
	};
	this.uncacheImage = function (arg) {
		if (arg.hasCache()) {
			if (arg.storage.VRAMoffset != null) { this.gl.deleteTexture(arg.storage.VRAMoffset); }
			arg.storage.VRAMoffset = null;
		}
	};
	this.image = function (img, left, top) {
		if (img.targetarea_ == null) { alert("The image object is not set"); }
		if (!img.hasCache()) { this.cacheImageBody(img); }

		//this.rect(img.targetarea_, Psychlops.Color.Red);

		var width = img.getWidth() * (img._zoomPercentage_ / 100), height = img.getHeight() * (img._zoomPercentage_ / 100);
		var tex_top = (img.height) / img.storage.height;
		var tex_bottom = 0.0;
		var tex_right = (img.width - 1) / (img.storage.width - 1);
		var v, t;
		if (img._zoomPercentage_ == 100) {
			v = [
				width / 2, height / 2, 0.0,
				-width / 2, height / 2, 0.0,
				width / 2, -height / 2, 0.0,
				-width / 2, -height / 2, 0.0,
			];
		} else {
			v = [
				width / 2, height / 2, 0.0,
				-width / 2, height / 2, 0.0,
				width / 2, -height / 2, 0.0,
				-width / 2, -height / 2, 0.0,
			];
			tex_top = (img.height - 0.375) / img.storage.height;
			tex_right = (img.width - 1.375) / (img.storage.width - 1);
		}
		t = [
			tex_right, tex_top,
			0.0, tex_top,
			tex_right, tex_bottom,
			0.0, tex_bottom,
		];
		rot = [
			img._rotate_, left + width / 2, top + height / 2,
			img._rotate_, left + width / 2, top + height / 2,
			img._rotate_, left + width / 2, top + height / 2,
			img._rotate_, left + width / 2, top + height / 2,
		];

		//gl.enable(gl.BLEND);
		//gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
		var gl = this.gl;

		gl.useProgram(this.imageShader.program);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.imageShader.vertexAtt, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.imgVerticesTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.imageShader.colorAtt, 2, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(this.imageShader.rotateAtt);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.rotationBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rot), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.imageShader.rotateAtt, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, img.storage.VRAMoffset);
		if (img._zoomPercentage_ != 100) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
		}
		gl.uniform1i(gl.getUniformLocation(this.imageShader.program, "uSampler"), 0);
		gl.uniform3fv(gl.getUniformLocation(this.imageShader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		gl.uniform4fv(gl.getUniformLocation(this.imageShader.program, "uCoord"), new Float32Array(this.uCoord));
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		if (img._zoomPercentage_ != 100) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(this.shapeShader.program);
		gl.uniform3fv(gl.getUniformLocation(this.shapeShader.program, "uInvColorGamma"), new Float32Array(this.invGammaValue));
		gl.uniform4fv(gl.getUniformLocation(this.shapeShader.program, "uCoord"), new Float32Array(this.uCoord));

	};
	this.getRefreshRate = function () { return Psychlops.Util._refreshRate; };
	this.getHiDPIFactor = function () { return Psychlops.Canvas.HiDPIFactor; };
	this.getPixelRatio = function () { return Psychlops.Canvas.HiDPIFactor; };
	this.msg = function (arg, left, top, col, horiz_align, vertical_align, max__width) {
		var color = col ? col : new Psychlops.Color(0.75);
		var letr;
		if (typeof this.__MSG_PREV__ != "undefined" && this.__MSG_PREV__ == arg) {
			letr = this.__MSG_LETR__;
		} else {
			letr = new Psychlops.Letters();
			this.__MSG_LETR__ = letr;
			this.__MSG_PREV__ = arg;
		}
		letr.setString(String(arg));
		letr.centering(left, top - 20);
		letr.fill = color;
		letr.align = horiz_align;
		letr.vertical_align = vertical_align;
		letr.draw();
	};
	this.var = function (arg, left, top, col) {
		this.msg(String(arg), left, top, col);
	}
	this.eventroot = {
		tabstop_list: []
		, nextTabStop: function () { }
		, prevTabStop: function () { }
	};

	this.showFPS = function (onoff_) {
		let onoff = arguments.length == 0 ? true : onoff_;
		this.doShowFPS = onoff;
	};


	switch (arguments.length) {
		case 1:
			this.set(iniarg1);
			break;
		case 2:
			this.set(iniarg1, iniarg2);
			break;
		case 3:
			this.set(iniarg1, iniarg2, iniarg3);
			break;
		case 4:
			this.set(iniarg1, iniarg2, iniarg3, iniarg4);
			break;
	}
};
Psychlops.Canvas.window = -100;
Psychlops.Canvas.fullscreen = -101;
Psychlops.Canvas._trueFullScreen = function () { if (Psychlops.the_canvas) { Psychlops.the_canvas._trueFullScreen(Psychlops.Util.canvas_element_id); } };
Psychlops.Canvas._pseudoFullScreen = function () { if (Psychlops.the_canvas) { Psychlops.the_canvas._pseudoFullScreen(Psychlops.Util.canvas_element_id); } };
Psychlops.Canvas.requirePopup = false;
Psychlops.Canvas.resizeCallback = null;
Psychlops.Canvas.useNoisyBit = function (arg) {
	var a = arguments.length == 0 ? true : arg;
	if (a) { Psychlops.Util.useNoisyBit = true; } else { Psychlops.Util.useNoisyBit = false; }
}
Psychlops.Canvas.HiDPIFactor = 1.0;
Psychlops.Canvas.setHiDPIFactor = function (arg) {
	switch (arguments.length) {
		case 0:
			if (typeof Psychlops.Util.localSettings.DPIFactor == "undefined") {
				Psychlops.Canvas.HiDPIFactor = 1.0;
			} else {
				Psychlops.Canvas.HiDPIFactor = Number(Psychlops.Util.localSettings.DPIFactor);
			}
			break;
		case 1:
			Psychlops.Canvas.HiDPIFactor = arg;
			break;
	}
}
Psychlops.Canvas.Geometry = function (dist_cm_, horiz_cm_, vert_cm_, cnvs) {
	this.dist_cm;
	this.horiz_cm;
	this.vert_cm;
	this.horiz_pix;
	this.vert_pix;
	this.aspect_ratio;	// int[2]

	if ((typeof arguments[0] == "number") && (typeof arguments[1] == "number") && (typeof arguments[2] == "number")) {
		this.setPhysical(dist_cm_, horiz_cm_, vert_cm_);
	} else if ((typeof arguments[0] == "number") && (typeof arguments[1] == "number")) {
		this.setPhysicalByDiagonalInch(dist_cm_, horiz_cm_);
	} else {
		alert("Geometry should be specified.");
	}

	this.horiz_pix_per_cm = this.horiz_pix / this.horiz_cm;
	this.vert_pix_per_cm = this.vert_pix / this.vert_cm;
	this.pix_per_cm = this.horiz_pix_per_cm;

	this.fromMode = Psychlops.Canvas.Geometry.Unit.percent;
	this.toMode = Psychlops.Canvas.Geometry.Unit.pixel;
}
Psychlops.Canvas.Geometry.prototype = {
	gdc: function (m, n) {
		if (m < n) return this.gdc(n, m);
		var r = m % n;
		if (r == 0) return n;
		return this.gdc(n, r);
	}
	, setLogical: function (cnvs_) {
		var cnvs = arguments.length == 0 ? Psychlops.the_canvas : cnvs_;
		this.horiz_pix = cnvs.getWidth();
		this.vert_pix = cnvs.getHeight();
		var gdc = this.gdc(this.horiz_pix, this.vert_pix);
		this.aspect_ratio = [this.horiz_pix / gdc, this.vert_pix / gdc];
	}
	, setPhysical: function (dist_cm_, horiz_cm_, vert_cm_) {
		this.setLogical();
		var long, short
		if (horiz_cm_ > vert_cm_) { long = horiz_cm_; short = vert_cm_; } else { short = horiz_cm_; long = vert_cm_; }
		var dir = this.horiz_pix > this.vert_pix;
		this.dist_cm = dist_cm_;
		this.horiz_cm = dir ? long : short;
		this.vert_cm = dir ? short : long;
	}
	, setPhysicalByDiagonalInch: function (dist_cm_, diag_inch) {
		this.setLogical();
		var diag_cm = diag_inch * 2.54;
		var diag_pix = Math.sqrt((this.horiz_pix * this.horiz_pix) + (this.vert_pix * this.vert_pix));
		this.pix_per_cm = diag_pix / diag_cm;
		this.setPhysical(dist_cm_, this.horiz_pix / this.pix_per_cm, this.vert_pix / this.pix_per_cm);
	}
	, calc: function (arg, unit, toUnit) {
		var pix = 0;
		var from_mode, to_mode;
		if (unit == "arcdeg") {
			from_mode = Psychlops.Canvas.Geometry.Unit.arcdeg;
		} else if (unit == "centimeter" || unit == "cm") {
			from_mode = Psychlops.Canvas.Geometry.Unit.centimeter;
		} else if (unit == "percentOfWidth" || unit == "%h") {
			from_mode = Psychlops.Canvas.Geometry.Unit.percentOfHeight;
		} else if (unit == "percentOfHeight" || unit == "%v") {
			from_mode = Psychlops.Canvas.Geometry.Unit.percentOfHeight;
		} else if (unit == "pixel" || unit == "px") {
			from_mode = Psychlops.Canvas.Geometry.Unit.pixel;
		} else {
			from_mode = this.fromMode;
		}
		if (toUnit == "arcdeg") {
			to_mode = Psychlops.Canvas.Geometry.Unit.arcdeg;
		} else if (toUnit == "centimeter" || toUnit == "cm") {
			to_mode = Psychlops.Canvas.Geometry.Unit.centimeter;
		} else if (toUnit == "percentOfWidth" || toUnit == "%h") {
			to_mode = Psychlops.Canvas.Geometry.Unit.percentOfHeight;
		} else if (toUnit == "percentOfHeight" || toUnit == "%v") {
			to_mode = Psychlops.Canvas.Geometry.Unit.percentOfHeight;
		} else if (toUnit == "pixel" || toUnit == "px") {
			to_mode = Psychlops.Canvas.Geometry.Unit.pixel;
		} else {
			to_mode = this.toMode;
		}
		switch (from_mode) {
			case Psychlops.Canvas.Geometry.Unit.pixel:
				pix = arg;
				break;
			case Psychlops.Canvas.Geometry.Unit.arcdeg:
				if ((typeof this.horiz_cm == "number") && (typeof this.vert_cm == "number") && (typeof this.dist_cm == "number")) {
					pix = Math.tan(arg / 360 * 2 * Math.PI) * this.dist_cm * this.pix_per_cm;
				} else {
					throw { value: arg + " " + unit, message: "", toString: function () { return this.value + this.message; } };
				}
				break;
			case Psychlops.Canvas.Geometry.Unit.centimeter:
				pix = this.pix_per_cm * arg;
				break;
			case Psychlops.Canvas.Geometry.Unit.percent:
				pix = this.horiz_pix * (arg / 100);
				break;
			case Psychlops.Canvas.Geometry.Unit.percentOfWidth:
				pix = this.horiz_pix * (arg / 100);
				break;
			case Psychlops.Canvas.Geometry.Unit.percentOfHeight:
				pix = this.vert_pix * (arg / 100);
				break;
		}
		switch (to_mode) {
			case Psychlops.Canvas.Geometry.Unit.pixel:
				return pix;
				break;
			case Psychlops.Canvas.Geometry.Unit.arcdeg:
				return 360 * (Math.atan2(pix / this.pix_per_cm, this.dist_cm) / 2 / Math.PI);
				break;
			case Psychlops.Canvas.Geometry.Unit.centimeter:
				return pix / this.pix_per_cm;
				break;
			case Psychlops.Canvas.Geometry.Unit.percent:
				return pix / this.horiz_pix;
				break;
			case Psychlops.Canvas.Geometry.Unit.percentOfWidth:
				return pix / this.horiz_pix;
				break;
			case Psychlops.Canvas.Geometry.Unit.percentOfHeight:
				return pix / this.vert_pix;
				break;
		}
	}
	//,inPercentageOfHeight: function (p) { return this.vert_pix * (p / 100); }
	//, inPercentageOfWidth: function (p) { return this.horiz_pix_per_cm * (p / 100); }
	//, inArcdeg: function (p) { Math.atan2(pix / this.horiz_pix_per_cm, this.dist_cm); }
}
Psychlops.Canvas.Geometry.Unit = { "pixel": 0, "arcdeg": 1, "centimeter": 2, "percent": 3, "percentOfWidth": 4, "percentOfHeight": 5, };

//////// Line ////////

Psychlops.Line = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.start = new Psychlops.Point();
	this.end = new Psychlops.Point();
	this.stroke = new Psychlops.Stroke();
}
Psychlops.Line.prototype = {
	getStart: function () {
		return this.start.dup();
	}
	, getEnd: function () {
		return this.end.dup();
	}
	, set: function (x1, y1, x2, y2) {
		this.start.set(x1, y1);
		this.end.set(x2, y2);
		return this;
	}
	, centering: function (a1, a2, a3) {
		var vector = new Psychlops.Point(this.end.x - this.start.x, this.end.y - this.start.y, this.end.z - this.start.z);
		var center = new Psychlops.Point();
		switch (arguments.length) {
			case 0:
				center.set(Psychlops.the_canvas.getHcenter(), Psychlops.the_canvas.getVcenter());
				break;
			case 1:
				center.set(a1);
				break;
			case 2:
				center.set(a1, a2);
				break;
			case 3:
				center.set(a1, a2, a3);
				break;
		}
		this.start.set(center.x - vector.x / 2, center.y - vector.y / 2, center.z - vector.z / 2);
		this.end.set(center.x + vector.x / 2, center.y + vector.y / 2, center.z + vector.z / 2);
		return this;
	}
	, shift: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				this.start.shift(a1);
				this.end.shift(a1);
				break;
			case 2:
				this.start.shift(a1, a2);
				this.end.shift(a1, a2);
				break;
			case 3:
				this.start.shift(a1, a2, a3);
				this.end.shift(a1, a2, a3);
				break;
		}
		return this;
	}
	, draw: function (a1) {
		Psychlops.Line.__BUF__.set(this.start.x, this.start.y, this.end.x, this.end.y);
		if (arguments.length == 0) {
			Psychlops.the_canvas.line(this);
		} else {
			if (typeof a1.pattern !== "undefined") {
				Psychlops.Line.__BUF__.stroke = a1.dup();
			} else {
				Psychlops.Line.__BUF__.stroke = new Psychlops.Stroke(a1);
			}
			Psychlops.the_canvas.line(Psychlops.Line.__BUF__);
		}
	}
}
Psychlops.Line.__BUF__ = new Psychlops.Line();


//////// Rectangle ////////

Psychlops.Rectangle = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.top = 0;
	this.left = 0;
	this.bottom = 0;
	this.right = 0;
	this.fill = Psychlops.Color.transparent.dup();
	this.stroke = Psychlops.Stroke.null_line.dup();

	this.set(iniarg1, iniarg2, iniarg3, iniarg4);
};
Psychlops.Rectangle.prototype = {
	getWidth: function () { return this.right > this.left ? this.right - this.left + 1 : this.left - this.right + 1; }
	, getHeight: function () { return this.bottom > this.top ? this.bottom - this.top + 1 : this.top - this.bottom + 1; }

	, getTop: function () { return this.top; }
	, getLeft: function () { return this.left; }
	, getBottom: function () { return this.bottom; }
	, getRight: function () { return this.right; }
	, getCenter: function () { return new Psychlops.Point((this.right + this.left) / 2.0, (this.bottom + this.top) / 2.0); }

	, dup: function () { var a = new Psychlops.Rectangle(); a.top = this.top; a.left = this.left; a.bottom = this.bottom; a.right = this.right; return a; }
	, equals: function (a) { return a.top == this.top && a.left == this.left && a.bottom == this.bottom && a.right == this.right; }
	, correctInversion: function (l, t, r, b) { var tmp; if (l > r) { tmp = l; l = r; r = tmp; } if (t > b) { tmp = t; t = b; b = tmp; } }
	, setbypix: function (a1, a2, a3, a4) {
		switch (arguments.length) {
			case 2:
				this.left = 0; this.top = 0; this.right = a1 - 1; this.bottom = a2 - 1;
				break;
			case 4:
				this.left = a1; this.top = a2; this.right = a3; this.bottom = a4;
				break;
		}
	}
	, set: function (a1, a2, a3, a4) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1; if (a3 != null) argn += 1; if (a4 != null) argn += 1;
		switch (argn) {
			case 1:
				break;
			case 2:
				this.setbypix(a1, a2);
				break;
			case 3:
				break;
			case 4:
				this.setbypix(a1, a2, a3, a4);
				break;
			default:
		}
		return this;
	}
	, centering: function (a1, a2) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1;
		var cx, cy;
		switch (argn) {
			case 0:
				cx = Psychlops.the_canvas.getHcenter();
				cy = Psychlops.the_canvas.getVcenter();
				break;
			case 1:
				var target_center = a1.getCenter();
				cx = target_center.x;
				cy = target_center.y;
				break;
			case 2:
				cx = a1;
				cy = a2;
				break;
		}
		var hx = (this.getWidth() - 1) / 2.0;
		var hy = (this.getHeight() - 1) / 2.0;
		this.left = cx - hx;
		this.right = cx + hx;
		this.top = cy - hy;
		this.bottom = cy + hy;
		return this;
	}
	, shift: function (a1, a2) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1;
		switch (argn) {
			case 1:
				this.top += a1.y;
				this.left += a1.x;
				this.bottom += a1.y;
				this.right += a1.x;
				break;
			case 2:
				this.top += a2;
				this.left += a1;
				this.bottom += a2;
				this.right += a1;
				break;
			default:
		}
		return this;
	}
	, resize: function (a1, a2) {
		var p = this.getCenter();
		this.set(a1, a2);
		this.centering(p.x, p.y);
		return this;
	}
	, include: function (a1, a2) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1;
		var x, y;
		if (argn == 1) { x = a1.x; y = a1.y; } else { x = a1; y = a2; }
		return x > this.left && x < this.right && y > this.top && y < this.bottom;
	}
	, draw: function (a1, a2) {
		switch (arguments.length) {
			case 0:
				Psychlops.the_canvas.rect(this);
				break;
			case 1:
				Psychlops.Rectangle.__BUF__.top = this.top;
				Psychlops.Rectangle.__BUF__.left = this.left;
				Psychlops.Rectangle.__BUF__.bottom = this.bottom;
				Psychlops.Rectangle.__BUF__.right = this.right;
				Psychlops.Rectangle.__BUF__.fill = a1;
				Psychlops.the_canvas.rect(Psychlops.Rectangle.__BUF__);
				break;
			case 2:
				Psychlops.the_canvas.rect(this);
				break;
			default:
		}
		return this;
	}
};
Psychlops.Rectangle.__BUF__ = new Psychlops.Rectangle();

//////// Ellipse ////////

Psychlops.Ellipse = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.top = 0;
	this.left = 0;
	this.bottom = 0;
	this.right = 0;
	this.fill = Psychlops.Color.transparent.dup();
	this.stroke = Psychlops.Stroke.null_line.dup();

	this.set(iniarg1, iniarg2, iniarg3, iniarg4);
};
Psychlops.Ellipse.prototype = {
	getWidth: function () { return this.right > this.left ? this.right - this.left + 1 : this.left - this.right + 1; }
	, getHeight: function () { return this.bottom > this.top ? this.bottom - this.top + 1 : this.top - this.bottom + 1; }

	, getTop: function () { return this.top; }
	, getLeft: function () { return this.left; }
	, getBottom: function () { return this.bottom; }
	, getRight: function () { return this.right; }
	, getHcenter: function () { return (this.right + this.left) / 2.0; }
	, getVcenter: function () { return (this.bottom + this.top) / 2.0; }
	, getCenter: function () { return new Psychlops.Point((this.right + this.left) / 2.0, (this.bottom + this.top) / 2.0); }

	, dup: function () { var a = new Psychlops.Rectangle(); a.top = this.top; a.left = this.left; a.bottom = this.bottom; a.right = this.right; return a; }
	, equals: function (a) { return a.top == this.top && a.left == this.left && a.bottom == this.bottom && a.right == this.right; }
	, correctInversion: function (l, t, r, b) { var tmp; if (l > r) { tmp = l; l = r; r = tmp; } if (t > b) { tmp = t; t = b; b = tmp; } }
	, setbypix: function (a1, a2, a3, a4) {
		switch (arguments.length) {
			case 2:
				this.left = 0; this.top = 0; this.right = a1 - 1; this.bottom = a2 - 1;
				break;
			case 4:
				this.left = a1; this.top = a2; this.right = a3; this.bottom = a4;
				break;
		}
	}
	, set: function (a1, a2, a3, a4) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1; if (a3 != null) argn += 1; if (a4 != null) argn += 1;
		switch (argn) {
			case 1:
				break;
			case 2:
				this.setbypix(a1, a2);
				break;
			case 3:
				break;
			case 4:
				this.setbypix(a1, a2, a3, a4);
				break;
			default:
		}
		return this;
	}
	, centering: function (a1, a2) {
		var cx, cy;
		switch (arguments.length) {
			case 0:
				cx = Psychlops.the_canvas.getHcenter();
				cy = Psychlops.the_canvas.getVcenter();
				break;
			case 1:
				var target_center = a1.getCenter();
				cx = target_center.x;
				cy = target_center.y;
				break;
			case 2:
				cx = a1;
				cy = a2;
				break;
		}
		var hx = (this.getWidth() - 1) / 2.0;
		var hy = (this.getHeight() - 1) / 2.0;
		this.left = cx - hx;
		this.right = cx + hx;
		this.top = cy - hy;
		this.bottom = cy + hy;
		return this;
	}
	, shift: function (a1, a2) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1;
		switch (argn) {
			case 1:
				this.top += a1.y;
				this.left += a1.x;
				this.bottom += a1.y;
				this.right += a1.x;
				break;
			case 2:
				this.top += a2;
				this.left += a1;
				this.bottom += a2;
				this.right += a1;
				break;
			default:
		}
		return this;
	}
	, resize: function (a1, a2) {
		var p = this.getCenter();
		this.set(a1, a2);
		this.centering(p.x, p.y);
		return this;
	}
	, include: function (a1, a2) {
		var argn = 0; if (a1 != null) argn += 1; if (a2 != null) argn += 1;
		var x, y;
		if (argn == 1) { x = a1.x; y = a1.y; } else { x = a1; y = a2; }
		return x > this.left && x < this.right && y > this.top && y < this.bottom;
	}
	, draw: function (a1, a2) {
		switch (arguments.length) {
			case 0:
				Psychlops.the_canvas.ellipse(this);
				break;
			case 1:
				var r = new Psychlops.Rectangle();
				r.set(this.left, this.top, this.right, this.bottom);
				r.fill = a1;
				Psychlops.the_canvas.ellipse(r);
				break;
			case 2:
				Psychlops.the_canvas.ellipse(this);
				break;
			default:
		}
		return this;
	}
};

//////// Polygon ////////

Psychlops.Polygon = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.vertices = [];
	this.datum = new Psychlops.Point();
	this.fill = Psychlops.Color.transparent.dup();
	this.stroke = Psychlops.Stroke.null_line.dup();
};
Psychlops.Polygon.prototype = {
	_shallow_copy: function () { var a = new Psychlops.Polygon(); a.vertices = this.vertices; a.datum = this.datum; a.fill = this.fill; a.stroke = this.stroke; return a; }
	, empty: function () {
		this.vertices = [];
	}
	, getNumberOfVertices: function () {
		return this.vertices.length;
	}
	, append: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				if (a1 instanceof Array) {
					this.vertices = this.vertices.concat(a1);
				} else {
					this.vertices.push(a1);
				}
				break;
			case 2:
				this.vertices.push(new Psychlops.Point(a1, a2));
				break;
			case 3:
				this.vertices.push(new Psychlops.Point(a1, a2, a3));
				break;
			default:
		}
		return this;
	}
	, centering: function (a1, a2, a3) {
		switch (arguments.length) {
			case 0:
				this.datum.centering(Psychlops.the_canvas.getHcenter(), Psychlops.the_canvas.getVcenter());
				break;
			case 1:
				this.datum.centering(a1.x, a1.y, a1.z);
				break;
			case 2:
				this.datum.centering(a1, a2);
				break;
			case 3:
				this.datum.centering(a1, a2, a3);
				break;
		}
		return this;
	}
	, shift: function (a1, a2, a3) {
		switch (arguments.length) {
			case 2:
				this.datum.shift(a1, a2);
				break;
			case 3:
				this.datum.shift(a1, a2, a3);
				break;
			default:
				break;
		}
		return this;
	}
	, draw: function (a1, a2, a3) {
		switch (arguments.length) {
			case 0:
				Psychlops.the_canvas.polygon(this);
				break;
			case 1:
				var r = this._shallow_copy();
				r.fill = a1;
				Psychlops.the_canvas.polygon(r);
				break;
			case 2:
				Psychlops.the_canvas.polygon(this);
				break;
			default:
		}
		return this;
	}
};


//////// Image ////////

Psychlops.Image = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.width = 0;
	this.height = 0;
	this.elements = null;
	this.storage = null;
	this.area = null;
	this.targetarea_ = null;

	this.pix_direct = this.pix;

	switch (arguments.length) {
		case 1:
			if (typeof iniarg1 == "string") {
				this.load(iniarg1);
			}
			break;
		case 2:
			this.set(iniarg1, iniarg2);
			break;
		case 3:
			this.set(iniarg1, iniarg2, iniarg3);
			break;
		case 4:
			this.set(iniarg1, iniarg2, iniarg3, iniarg4);
			break;
	}
};
Psychlops.Image.prototype = {
	__destruct: function () {
		if (this.storage != null) {
			this.uncache();
			this.storage.data = null;
			this.storage = null;
		}
	}
	, hasCache: function () {
		if (this.storage) {
			return this.storage.VRAMoffset ? true : false;
		} else {
			return false;
		}
	}
	, makeTextureStorage: function (w, h) {
		var tex_width = 0, tex_height = 0;
		var i;
		i = 0;
		while (Math.pow(2.0, ++i) < w) { }
		tex_width = Math.pow(2.0, i);
		i = 0;
		while (Math.pow(2.0, ++i) < h) { }
		tex_height = Math.pow(2.0, i);
		if (!(tex_width == tex_height)) {
			if (tex_width > tex_height) { tex_height = tex_width; }
			if (tex_width < tex_height) { tex_width = tex_height; }
		}
		var val = null;
		if (this.storage != null && tex_width == this.storage.width && tex_height == this.storage.height) {
			this.uncache();
			val = this.storage;
		} else {
			if (this.storage != null) {
				this.uncache();
				this.storage.data = null;
			}
			val = { width: tex_width, height: tex_height, data: new Uint8Array(tex_width * tex_height * 4), VRAMoffset: null };
		}
		return val;
	}
	, set: function (w, h) {
		if (this.width == w && this.height == h) {
			this.clear(Psychlops.Color.black);
			this.uncache();
		} else {
			this.__destruct();
			this.width = w;
			this.height = h;
			this.storage = this.makeTextureStorage(w, h);
		}
		this.area = new Psychlops.Rectangle();
		this.area.set(w, h);
		this.targetarea_ = new Psychlops.Rectangle(this.area.getWidth(), this.area.getHeight());
		return this;
	}
	, clear: function (col) {
		if (this.targetarea_ == null) { alert("Image::clear: The image object is not set"); }
		var max = this.storage.width * this.storage.height * 4;
		var r = col.r * 255;
		var g = col.g * 255;
		var b = col.b * 255;
		var a = col.a * 255;
		for (var i = 0; i < max; i += 4) {
			this.storage.data[i] = r;
			this.storage.data[i + 1] = g;
			this.storage.data[i + 2] = b;
			this.storage.data[i + 3] = a;
		}
	}
	, pix: function (x, y, col) {
		var p = (x + y * this.storage.height) * 4;
		this.storage.data[p] = col.r * 255;
		this.storage.data[p + 1] = col.g * 255;
		this.storage.data[p + 2] = col.b * 255;
		this.storage.data[p + 3] = col.a * 255;
	}
	, pix_raw: function (x, y, col) {
		var p = (x + y * this.storage.height) * 4;
		this.storage.data[p] = col.r * 255;
		this.storage.data[p + 1] = col.g * 255;
		this.storage.data[p + 2] = col.b * 255;
		this.storage.data[p + 3] = col.a * 255;
	}
	, pix_8bit: function (x, y, r, g, b, a) {
		var p = (x + y * this.storage.height) * 4;
		this.storage.data[p] = r;
		this.storage.data[p + 1] = g;
		this.storage.data[p + 2] = b;
		this.storage.data[p + 3] = a;
	}
	, alpha: function (x, y, a) {
		var p = (x + y * this.storage.height) * 4;
		this.storage.data[p + 3] = a * 255;
	}
	, getPix: function (x, y) {
		var p = (x + y * this.storage.height) * 4;
		var col = new Psychlops.Color(this.storage.data[p] / 255.0, this.storage.data[p + 1] / 255.0, this.storage.data[p + 2] / 255.0, this.storage.data[p + 3] / 255.0);
		return col;
	}

	, shift: function (arg1, arg2) {
		if (this.targetarea_ == null) { alert("Image::shift: The image object is not set"); }
		this.targetarea_.shift(arg1, arg2);
		return this;
	}
	, centering: function (arg1, arg2) {
		if (this.targetarea_ == null) { alert("Image::centering: The image object is not set"); }
		this.targetarea_.centering(arg1, arg2);
		return this;
	}

	, draw: function (left, top) {
		var l = left || this.targetarea_.left;
		var t = top || this.targetarea_.top;
		switch (arguments.length) {
			case 0:
				l = this.targetarea_.left;
				t = this.targetarea_.top;
				break;
			case 1:
				l = this.targetarea_.left;
				t = this.targetarea_.top;
				break;
			case 2:
				l = left;
				t = top;
				break;
		}
		if (this.targetarea_ == null) { alert("Image::draw: The image object is not set"); }
		Psychlops.the_canvas.image(this, l, t);
		return this;
	}
	, cache: function () {
		Psychlops.the_canvas.cacheImage(this);
		return this;
	}
	, uncache: function () {
		Psychlops.the_canvas.uncacheImage(this);
		return this;
	}
	, load: function (url) {
		var object;
		if (typeof Psychlops.Image._STORE_[url] == 'undefined') {
			switch (Psychlops.Util.getEnvironmentVersion()) {
				case Psychlops.Util.EnvironmentVersion.Latest:
					Psychlops.Image._STORE_[url] = new Image();
					Psychlops.Image._STORE_[url].addEventListener("load", function () { Psychlops.Image._LOADING_ -= 1; return; });
					Psychlops.Image._STORE_[url].addEventListener("error", function () { alert("An error was occured in loading a image: " + url); Psychlops.Image._LOADING_ -= 1; return; });
					Psychlops.Image._STORE_[url].src = url;
					Psychlops.Image._LOADING_ += 1;
					break;
				case Psychlops.Util.EnvironmentVersion.Env2013:
					var THIS = this;
					Psychlops.Image._LOADERFUNC_ARRAY_.push(function () {
						Psychlops.Image._STORE_[url] = new Image();
						Psychlops.Image._STORE_[url].addEventListener("load", function () { Psychlops.Image._LOADING_ -= 1; THIS.load(url); return; });
						Psychlops.Image._STORE_[url].addEventListener("error", function () { alert("An error was occured in loading a image: " + url); Psychlops.Image._LOADING_ -= 1; return; });
						Psychlops.Image._STORE_[url].src = url;
						Psychlops.Image._LOADING_ += 1;
					});
					break;
			}
			return true;
		} else {
			switch (Psychlops.Util.getEnvironmentVersion()) {
				case Psychlops.Util.EnvironmentVersion.Latest:
					if (Psychlops.Image._LOADING_ > 0) { return true; }
					break;
			}
			object = Psychlops.Image._STORE_[url];
		}
		//var w = object.naturalWidth;
		//var h = object.naturalHeight;
		var w = object.width;
		var h = object.height;
		var canvas = document.createElement('canvas');
		canvas.width = w; canvas.height = h;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(object, 0, 0);
		var input = ctx.getImageData(0, 0, w, h);
		var inputData = input.data;
		var i, r, g, b, a;
		this.set(w, h);
		for (var y = 0; y < h; y += 1) {
			for (var x = 0; x < w; x += 1) {
				i = (y * w + x) * 4;
				r = inputData[i];
				g = inputData[i + 1];
				b = inputData[i + 2];
				a = inputData[i + 3];
				this.pix_8bit(x, y, r, g, b, a);
			}
		}
		canvas = null; ctx = null; input = null;
		return false;
	}

	, getWidth: function () { return this.width; }
	, getHeight: function () { return this.height; }
	, getWidth: function () { return this.width; }
	, getTop: function () { return this.targetarea_.top; }
	, getBottom: function () { return this.targetarea_.bottom; }
	, getLeft: function () { return this.targetarea_.left; }
	, getRight: function () { return this.targetarea_.right; }
	, getHcenter: function () { return (this.targetarea_.right + this.targetarea_.left) / 2.0; }
	, getVcenter: function () { return (this.targetarea_.bottom + this.targetarea_.top) / 2.0; }
	, getCenter: function () { return new Psychlops.Point((this.targetarea_.right + this.targetarea_.left) / 2.0, (this.targetarea_.bottom + this.targetarea_.top) / 2.0); }


	// this is experimental!!
	, _rotate_: 0
	, _zoomPercentage_: 100
	, _zoom_: function (percentage) {
		this._zoomPercentage_ = percentage;
		if (this.targetarea_) {
			this.targetarea_.resize(this.width * (percentage / 100), this.height * (percentage / 100));
		}
		return this;
	}
	, _zoomTo_: function (h_, v_) {
		var h, v, percentage = 100;
		if (h_ == 0) { percentage = (v_ / this.height); h = this.width * percentage; } else { h = h_; }
		if (v_ == 0) { percentage = (h_ / this.width); v = this.height * percentage; } else { v = v_; }
		this.targetarea_.resize(h, v);
		this._zoomPercentage_ = percentage;
		return this;
	}
	, _getZoomPercentage_: function () { return this._zoomPercentage_; }
	, _getZoomedHeight: function () { return this.targetarea_.getHeight(); }
	, _getZoomedWidth: function () { return this.targetarea_.getWidth(); }
};
Psychlops.Image.load = function (array, str, begin0, end0, begin1, end1) {
	/*
	var filename;
	switch (arguments.length) {
		case 4:
			for (var i = begin0; i <= end0; i++) {
				filename = sprintf(str, i);
				array[i].load(filename);
			}
			break;
		case 6:
			for (var i = begin0; i <= end0; i++) {
				for (var j = begin1; j <= end1; j++) {
					filename = sprintf(str, i, j);
					array[i][j].load(filename);
				}
			}
			break;
	}
	*/
	return false;
};
Psychlops.Image.GRAY = -100;
Psychlops.Image.RGB = -101;
Psychlops.Image.RGBA = -102;
Psychlops.Image.BYTE = -202;
Psychlops.Image.FLOAT = -202;
Psychlops.Image._STORE_ = {};

Psychlops.Image._LOADERFUNC_ARRAY_ = [];
Psychlops.Image._LOADED_ARRAY_ = [];
Psychlops.Image._LOADED_ = 0;
Psychlops.Image._LOADING_ = 0;
Psychlops.Image._LOAD_ = function () {
	var urlarray = Psychlops.Image._LOADED_ARRAY_;
	Psychlops.Image._LOADING_ += urlarray.length;
	var ImageLoadFunc = function () { Psychlops.Image._LOADING_ -= 1; return; }
	var ImageErrorFunc = function (url) { alert("An error was occured in loading a image: " + url); Psychlops.Image._LOADING_ -= 1; return; }
	for (var i = 0; i < urlarray.length; i += 1) {
		Psychlops.Image._STORE_[urlarray[i]] = new Image();
		Psychlops.Image._STORE_[urlarray[i]].addEventListener("load", ImageLoadFunc);
		Psychlops.Image._STORE_[urlarray[i]].addEventListener("error", function () { ImageErrorFunc(urlarray[i]) });
		Psychlops.Image._STORE_[urlarray[i]].src = urlarray[i];
	}
};
Psychlops.Image.preload = function (url, data) {
	Psychlops.Image._STORE_[url] = new Image();
	Psychlops.Image._STORE_[url].addEventListener("load", function () { Psychlops.Image._LOADING_ -= 1; return; });
	Psychlops.Image._STORE_[url].addEventListener("error", function () { alert("An error was occured in loading a image: " + url); Psychlops.Image._LOADING_ -= 1; return; });
	Psychlops.Image._LOADING_ += 1;
	switch (arguments.length) {
		case 1:
			Psychlops.Image._STORE_[url].src = url;
			break;
		case 2:
			Psychlops.Image._STORE_[url].src = data;
			break;
	}
}


//////// Font ////////

Psychlops.Font = function (iniarg1, iniarg2, iniarg3, iniarg4) {
	this.size = 20 * Psychlops.Canvas.HiDPIFactor;
	this.weight = 400;
	this.style = 0;
	this.family = ["Arial"];

	this.dup = function () { var a = new Psychlops.Font(); a.size = this.size; a.weight = this.weight; a.style = this.style; a.family = this.family; return a; }
	this.equals = function (a) { return a.size == this.size && a.weight == this.weight && a.style == this.style && a.family[0] == this.family[0]; }
	this.set = function (a1, a2, a3, a4) {
		var family_, size_, weight_, style_;
		if (typeof (a1) == "string") {
			family_ = [a1];
			size_ = a2 ? a2 : 20;
			weight_ = a3 ? a3 : Psychlops.Font.normal_weight;
			style_ = a4 ? a4 : Psychlops.Font.normal_style;
		} else {
			family_ = [a4];
			size_ = a1 ? a1 : 20;
			weight_ = a2 ? a2 : Psychlops.Font.normal_weight;
			style_ = a3 ? a3 : Psychlops.Font.normal_style;
		}
		this.size = size_;
		this.weight = weight_;
		this.style = style_;
		this.family = family_;
	};

	switch (arguments.length) {
		case 1:
			this.set(iniarg1);
			break;
		case 2:
			this.set(iniarg1, iniarg2);
			break;
		case 3:
			this.set(iniarg1, iniarg2, iniarg3);
			break;
		case 4:
			this.set(iniarg1, iniarg2, iniarg3, iniarg4);
			break;
	}
};
Psychlops.Font.default_font = { "size": 20 * Psychlops.Canvas.HiDPIFactor, "weight": 400, "style": 0, "family": ["Arial"] };
Psychlops.Util.initializerList.push(function () {
	Psychlops.Font.default_font = new Psychlops.Font();
});
Psychlops.Font.normal_style = 0;
Psychlops.Font.italic = 1;
Psychlops.Font.oblique = 2;
Psychlops.Font.normal_weight = 400;
Psychlops.Font.bold = 700;

//////// Letters ////////

Psychlops.Letters = function (initarg1, initarg2, initarg3) {
	this.storage = null;
	this.storage_fill = null;
	this.storage_font = null;
	this.storage_str = null;

	this.font = Psychlops.Font.default_font.dup();
	this.str = "";
	this.align = 0;
	this.vertical_align = 0;

	this.fill = Psychlops.Color.white.dup();
	this.datum = new Psychlops.Point();

	this.area = function () { return this.storage.area; }


	switch (arguments.length) {
		case 0:
			this.str = "";
			break;
		case 1:
			this.str = initarg1;
			break;
		case 2:
			this.str = initarg1;
			if (typeof (initarg2) == "object") { this.font = initarg2; }
			else { this.font.size = initarg2; }
			break;
		case 3:
			this.str = initarg1;
			this.font = initarg3;
			this.font.size = initarg2;
			break;
	}
}
Psychlops.Letters.prototype = {
	getFont: function () { return this.font; }
	, setFont: function (init_font) {
		this.font = init_font;
		return this;
	}
	, getString: function () { return this.str; }
	, setString: function (init_str, size_) {
		this.str = init_str;
		if (typeof size_ == "number") this.font.size = size_;
		return this;
	}
	, string: function (init_str) { this.setString(init_str); }
	, cache: function (spec_color) {
		var col;
		if (arguments.length == 1) { col = spec_color; } else { col = this.fill; }
		var canvas = document.createElement('canvas');
		var w = Math.floor(this.font.size * this.str.length), h = Math.floor(this.font.size * 1.5);
		canvas.width = w; canvas.height = h;
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = 'rgb(' + String(col.r * 255) + "," + String(col.g * 255) + "," + String(col.b * 255) + ")";
		var font_text = "";
		if (this.font.style > 0) {
			font_text += "italic"
		}
		font_text += " " + String(this.font.weight);
		font_text += " " + String(this.font.size) + "px";
		font_text += " " + this.font.family[0];
		ctx.font = font_text;
		ctx.textAlign = 'left';
		ctx.fillText(this.str, 0, h - h / 3);

		var input = ctx.getImageData(0, 0, w, h);
		var i, r, g, b, a, mx = 0;
		var inputData = input.data;
		for (var y = 0; y < h; y += 1) {
			for (var x = 0; x < w; x += 1) {
				if (0 < inputData[(y * w + x) * 4 + 3] && mx < x) mx = x;
			}
		}
		this.storage = new Psychlops.Image(mx, h);
		for (var y = 0; y < h; y += 1) {
			for (var x = 0; x < mx; x += 1) {
				i = (y * w + x) * 4;
				r = inputData[i];
				g = inputData[i + 1];
				b = inputData[i + 2];
				a = inputData[i + 3];
				this.storage.pix_8bit(x, y, r, g, b, a);
			}
		}
		this.storage_fill = col.dup();
		this.storage_font = this.font.dup();
		this.storage_str = this.str;
		return this;
	}
	, uncache: function () {
		return this;
	}
	, shift: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				this.datum.shift(a1.x, a1.y);
				break;
			case 2:
				this.datum.shift(a1, a2);
				break;
			case 3:
				this.datum.shift(a1, a2, a3);
				break;
		}
		return this;
	}
	, locate: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				this.datum.set(a1.x, a1.y);
				break;
			case 2:
				this.datum.set(a1, a2);
				break;
			case 3:
				this.datum.set(a1, a2, a3);
				break;
		}
	}
	, centering: function (a1, a2, a3) {
		switch (arguments.length) {
			case 0:
				this.datum.set(Psychlops.the_canvas.getHcenter(), Psychlops.the_canvas.getVcenter());
				this.align = Psychlops.Letters.TEXT_ALIGN_CENTER;
				break;
			case 1:
				//Figure
				this.datum.set(a1.x, a1.y);
				this.align = Psychlops.Letters.TEXT_ALIGN_CENTER;
				break;
			case 2:
				this.datum.set(a1, a2);
				this.align = Psychlops.Letters.TEXT_ALIGN_CENTER;
				break;
			case 3:
				this.datum.set(a1, a2, a3);
				this.align = Psychlops.Letters.TEXT_ALIGN_CENTER;
				break;
		}
		return this;
	}

	/*
	virtual Letters& draw(Drawable &target = *Drawable::prime);
	virtual Letters& draw(const Color &col, Drawable &target = *Drawable::prime);
	virtual Letters& draw(const Stroke &strk, Drawable &target = *Drawable::prime);
	virtual Letters& draw(const Color &col, HorizontalAlign horiz_align, Drawable &target = *Drawable::prime);
	*/
	, draw: function (spec_color) {
		var col;
		if (arguments.length == 1) { col = spec_color; } else { col = this.fill; }
		var sx = 0, sy = 0;
		if (this.storage == null || !this.storage_fill.equals(col) || !this.storage_font.equals(this.font) || !this.storage_str == this.str) {
			this.cache(col);
		}
		if (this.storage) {
			if (this.align == Psychlops.Letters.TEXT_ALIGN_CENTER) { sx = this.storage.getWidth() / 2.0; }
			else if (this.align == Psychlops.Letters.TEXT_ALIGN_RIGHT) { sx = this.storage.getWidth(); }
			sy = this.storage.getHeight() / 3 * 2;
			this.storage.draw(this.datum.x - sx, this.datum.y - sy);
		}
	}
};
Psychlops.Letters.NOT_SPECIFIED = -1;
Psychlops.Letters.TEXT_ALIGN_LEFT = 0;
Psychlops.Letters.TEXT_ALIGN_CENTER = 1;
Psychlops.Letters.TEXT_ALIGN_RIGHT = 2;
Psychlops.Letters.BASELINE = 0;
Psychlops.Letters.TEXT_ALIGN_TOP = 1;
Psychlops.Letters.TEXT_ALIGN_MIDDLE = 2;
Psychlops.Letters.TEXT_ALIGN_BOTTOM = 3;
Psychlops.Letters.TEXT_ALIGN_TEXT_TOP = 4;
Psychlops.Letters.TEXT_ALIGN_TEXT_BOTTOM = 5;


//////// Movie ////////

Psychlops.Movie = function (initarg1, initarg2, initarg3) {
	this.loaded = false;
	this.playing = false;
	this.datum = new Psychlops.Point();
	this.currentFrame = 0;
	this.align = Psychlops.Movie.ALIGN_LEFTTOP;
	this.MaxFrame = 0;
	this._cache = [];
	this._cached = false;
	this._decodingFrame = 0;

	switch (arguments.length) {
		case 0:
			break;
		case 1:
			this.load(initarg1);
			break;
		case 3:
			this.load(initarg1, initarg2, initarg3);
			break;
	}
	if (!Psychlops.Util.isUIExclusive) {
		this.nextFrame = this._nextFrame;
	}
}
Psychlops.Movie.ALIGN_LEFTTOP = 1;
Psychlops.Movie.ALIGN_CENTER = 2;
Psychlops.Movie.playstack_ = [];
Psychlops.Movie.__decoderPath = "./import/video/Decoder.js";
Psychlops.Movie.prototype = {
	load: function (filename, width, height) {
		//this.player = new MP4Player(new Stream(src), useWorkers, webgl, render);
		this.player = new MP4Player(new Stream(filename), false, false, false);
	}
	, initialize: function () {
		var reader = this.player.reader;
		if (!reader) {
			this.player.readAll((function () {
				var reader = this.player.reader;
				this.video = reader.tracks[1];
				var audio = reader.tracks[2];
				var avc = reader.tracks[1].trak.mdia.minf.stbl.stsd.avc1.avcC;
				var sps = avc.sps[0];
				var pps = avc.pps[0];
				this.player.avc.decode(sps);
				this.player.avc.decode(pps);

				this.MaxFrame = this.video.getSampleCount();
				this._cache = new Array(this.MaxFrame);
				for (var i = 0; i < this.MaxFrame; i++) { this._cache[i] = null; }

				this.loaded = true;
			}).bind(this));
			return;
		};
	}
	, _decodeFrame: function (num) {
		var avc = this.player.avc;
		if (this._cache[num] == null) {
			this.video.getSampleNALUnits(num).forEach((function (nal) {
				avc.geometry = { left: this.datum.x, top: this.datum.y, align: this.align, cache: this._cache, cached: false, frame: num };
				avc.decode(nal);
			}).bind(this));
		}
	}
	, tryDecoding: function () {
		if (this.loaded) {
			var percentage = this._decodingFrame / (this.MaxFrame - 1);
			if (this._decodingFrame >= this.MaxFrame) { return percentage; }
			if (this._decodingFrame == 0) { this._decodeFrame(0); this._decodingFrame += 1; return percentage; }
			if (this._cache[this._decodingFrame] == null && this._cache[this._decodingFrame - 1] != null) {
				this._decodeFrame(this._decodingFrame);
				this._decodingFrame += 1;
				return percentage;
			}
		} else {
			return 0;
		}
		return 0; // Why dropped down here?
	}
	, showFrame: function (num) {
		if (this.loaded) {
			if (num >= 0 && num < this.MaxFrame) {
				if (this._cache[num] == null) {
					this._decodeFrame(num);
				} else { this._cache[num].centering(this.datum.x, this.datum.y).draw(); }
			} else {
			}
		}
		return this;
	}
	, decodeNextFrame: function () {
		if (this.loaded) {
			this._decodeFrame(this.currentFrame);
			this.currentFrame += 1;
			if (this.MaxFrame <= this.currentFrame) { this.currentFrame = 0; }
		}
	}
	, isReady: function () {
		var state = false;
		if (this.loaded) {
			for (var i = 0; i < this.MaxFrame; i++) { state = state || (this._cache[i] == null); }
			return !state;
		} else {
			return false;
		}
	}
	, play: function () {
		if (!this.playing) { this.playing = true; }
		return this;
	}
	, draw: function () {
		this._howFrame(this.currentFrame);
		if (!this.playing) {
			this.currentFrame += 1;
		}
		return this;
	}
	, nextFrame: function () { Psychlops.Movie.playstack_.push(this) }
	, _nextFrame: function () {
		if (this.loaded) {
			this.showFrame(this.currentFrame);
			this.currentFrame += 1;
			if (this.MaxFrame <= this.currentFrame) { this.currentFrame = 0; }
		}
		return this;
	}
	, shift: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				this.datum.shift(a1.x, a1.y);
				break;
			case 2:
				this.datum.shift(a1, a2);
				break;
			case 3:
				this.datum.shift(a1, a2, a3);
				break;
		}
		return this;
	}
	, locate: function (a1, a2, a3) {
		switch (arguments.length) {
			case 1:
				this.datum.set(a1.x, a1.y);
				break;
			case 2:
				this.datum.set(a1, a2);
				break;
			case 3:
				this.datum.set(a1, a2, a3);
				break;
		}
	}
	, centering: function (a1, a2, a3) {
		switch (arguments.length) {
			case 0:
				this.datum.set(Psychlops.the_canvas.getHcenter(), Psychlops.the_canvas.getVcenter());
				this.align = Psychlops.Movie.ALIGN_CENTER;
				break;
			case 1:
				//Figure
				this.datum.set(a1.x, a1.y);
				break;
			case 2:
				this.datum.set(a1, a2);
				break;
			case 3:
				this.datum.set(a1, a2, a3);
				break;
		}
		return this;
	}
	, getWidth: function () {
		if (this.isReady) {
			return this.player.size.h;
			//if(this.player.avc.canvasObj.webGLCanvas) {
			//return this.player.avc.canvasObj.webGLCanvas.width;
			//}
		}
		return 0;
	}
	, getHeight: function () {
		if (this.isReady) {
			return this.player.size.w;
			//if(this.player.avc.canvasObj.webGLCanvas) {
			//return this.player.avc.canvasObj.webGLCanvas.height;
			//}
		}
		return 0;
	}
}

//////// Watch Variables ////////

Psychlops.Variable = function (closure_getter, closure_setter, name_, range_, step_, step_shift_) {
	this.getValue = closure_getter;
	this.closure_setter = closure_setter;
	this.setValue = function (v) { this.changed_flag = true; this.closure_setter(v); };
	this.name = name_;
	if (range_ == null || range_.dup == null) {
		this.intvl = range_;
	} else {
		this.intvl = range_.dup();
	}
	this.level = 0;
	this.step1 = step_;
	this.step2 = step_shift_ || 0;

	this.changed_flag = false;
}
Psychlops.Variable.prototype = {
	setByValue: function (val) { this.setValue(val); this.changed_flag = true; }
	, setByRatio: function (ratio) { this.setValue(ratio * (this.intvl.end - this.intvl.begin) + this.intvl.begin); this.changed_flag = true; }
	, setByRatioInStep: function (ratio) { this.setValue(ratio * (this.intvl.end - this.intvl.begin) + this.intvl.begin); this.changed_flag = true; }
	, setByLevel: function (level) { this.changed_flag = true; }
	, increment: function (modulation) { if (modulation) { this.setValue(this.getValue() + this.step2); } else { this.setValue(this.getValue() + this.step1); } }
	, decrement: function (modulation) { if (modulation) { this.setValue(this.getValue() - this.step2); } else { this.setValue(this.getValue() - this.step1); } }
	, changed: function () { var v = this.changed_flag; this.changed_flag = false; return v; }
};


//////// Widgets ////////

Psychlops.Widgets = new Object();
Psychlops.Widgets.external = false;

Psychlops.Widgets.Theme = function () {
	this.normal_foreground = [new Psychlops.Color(0.9), new Psychlops.Color(0.9)];
	this.normal_background = [new Psychlops.Color(0.25), new Psychlops.Color(0.35, 0.15, 0.15)];
	this.normal_stroke = [Psychlops.Stroke.null_line, Psychlops.Stroke.null_line];
	this.active_foreground = [new Psychlops.Color(1.0), new Psychlops.Color(1.0)];
	this.active_background = [new Psychlops.Color(0.30), new Psychlops.Color(0.35, 0.25, 0.15)];
	this.active_stroke = [Psychlops.Stroke.hair_line, Psychlops.Stroke.hair_line];
	this.over_background = [Psychlops.Color.blue, Psychlops.Color.red];
	//Image *button_back, *horiz_grad;
}
Psychlops.Widgets.Theme.TYPE_TAG = { "NORMAL": 0, "ALERT": 1 };
Psychlops.Widgets.Theme.setDarkTheme = function () {
	Psychlops.Widgets.Theme.current = new Psychlops.Widgets.Theme();
}
Psychlops.Widgets.Theme.setLightTheme = function () {
	var v = new Psychlops.Widgets.Theme();
	v.normal_foreground = [new Psychlops.Color(0.1), new Psychlops.Color(0.1)];
	v.normal_background = [new Psychlops.Color(0.85), new Psychlops.Color(0.95, 0.85, 0.85)];
	v.normal_stroke = [Psychlops.Stroke.null_line, Psychlops.Stroke.null_line];
	v.active_foreground = [new Psychlops.Color(0.0), new Psychlops.Color(0.0)];
	v.active_background = [new Psychlops.Color(0.65, 0.65, 0.85), new Psychlops.Color(0.85, 0.65, 0.65)];
	v.active_stroke = [Psychlops.Stroke.hair_line, Psychlops.Stroke.hair_line];
	v.over_background = [Psychlops.Color.blue, Psychlops.Color.red];
	Psychlops.Widgets.Theme.current = v;
}
Psychlops.Widgets.Theme.current = new Psychlops.Widgets.Theme();


//////// Button ////////
Psychlops.Widgets.Button = function (label, height) {
	this.label = new Psychlops.Letters();
	this.imagelabel = null;
	this.area = new Psychlops.Rectangle();
	this.targetarea_ = this.area;
	switch (arguments.length) {
		case 0:
			break;
		case 1:
			this.set(label, Psychlops.Font.default_font.size);
			break;
		case 2:
			this.set(label, height);
			break;
	}

	this.toggled = false;

	this.pushed_ = false;
	this.pressed_ = false;
	this.released_ = false;
};
Psychlops.Widgets.Button.prototype = {
	set: function (str, hei) {
		if (typeof str == "string") {
			this.imagelabel = null;
			var label = str ? str : " ";
			var v = (label.length * 20 + 20) * Psychlops.Canvas.HiDPIFactor;
			var h = 40 * Psychlops.Canvas.HiDPIFactor;
			if (arguments.length == 2) {
				v = (label.length * hei) + 20 * Psychlops.Canvas.HiDPIFactor;
				h = hei;
			}

			this.area = this.targetarea_ = new Psychlops.Rectangle(v, h);
			this.setColor(label);
			return this;
		} else if ("pix_raw" in str) {
			this.imagelabel = str;
			if ("_zoomPercentage_" in str) {
				this.area = this.targetarea_ = new Psychlops.Rectangle(this.imagelabel.getWidth() * this.imagelabel._zoomPercentage_ / 100.0 * 1.1, this.imagelabel.getHeight() * this.imagelabel._zoomPercentage_ / 100.0 * 1.1);
			} else {
				this.area = this.targetarea_ = new Psychlops.Rectangle(this.imagelabel.getWidth() * 1.1, this.imagelabel.getHeight() * 1.1);
			}
			this.setColor("");
			return this;
		} else {
			alert("Button: label is illegal")
		}
	}
	, draw: function () {
		var pos = Psychlops.Mouse.getPosition();
		if (this.targetarea_.include(pos.x, pos.y)) {
			this.targetarea_.draw(Psychlops.Widgets.Theme.current.over_background[0]);
		} else {
			this.targetarea_.draw();
		}
		if (this.imagelabel == null) {
			this.label.centering(this.targetarea_.getCenter().x, this.targetarea_.getCenter().y + 6 * Psychlops.Canvas.HiDPIFactor);
			this.label.draw();
		} else {
			this.imagelabel.centering(this.targetarea_.getCenter().x, this.targetarea_.getCenter().y);
			this.imagelabel.draw();
		}

		var p = Psychlops.Mouse.left.pressed();
		var pq = (this.pressed_ == true && p == false);
		//if (Psychlops.Util.environment.host.name == "chrome") { pq = pq || Psychlops.Mouse.left.states[3]; }
		if (pq) {
			var pos = Psychlops.Mouse.getPosition();
			if (this.targetarea_.include(pos.x, pos.y)) {
				this.pushed_ = true;
			}
		}
		this.pressed_ = p;
	}
	, pushed: function () { var v = this.pushed_; this.pushed_ = false; return v; }
	, toggle: function (arg) {
		switch (arguments.length) {
			case 0:
				this.toggled = !this.toggled;
				break;
			case 1:
				this.toggled = (arg == true ? true : false);
				break;
		}
		this.setColor(this.label.str);
	}
	, isToggled: function () { return this.toggled; }
	, setColor: function (str) {
		if (this.toggled) {
			this.targetarea_.fill = Psychlops.Widgets.Theme.current.active_background[0].dup();
			this.targetarea_.stroke = Psychlops.Widgets.Theme.current.active_stroke[0].dup();
			this.label = new Psychlops.Letters(str, this.area.getHeight() * 0.6);
			this.label.fill = Psychlops.Widgets.Theme.current.active_foreground[0].dup();
		} else {
			this.targetarea_.fill = Psychlops.Widgets.Theme.current.normal_background[0].dup();
			this.targetarea_.stroke = Psychlops.Widgets.Theme.current.normal_stroke[0].dup();
			this.label = new Psychlops.Letters(str, this.area.getHeight() * 0.6);
			this.label.fill = Psychlops.Widgets.Theme.current.normal_foreground[0].dup();
		}
	}
	, shift: function (a1, a2) {
		this.targetarea_.shift(a1, a2);
		return this;
	}
	, centering: function (a1, a2) {
		this.targetarea_.centering(a1, a2);
		return this;
	}
	, getCenter: function () {
		return this.targetarea_.getCenter();
	}
	, getWidth: function () {
		return this.targetarea_.getWidth();
	}
	, getHeight: function () {
		return this.targetarea_.getHeight();
	}
};

Psychlops.Widgets.Button.TAFC = null;
Psychlops.Widgets.Button.TwoAFC = function (a1, a2) {
	var label1 = "yes";
	var label2 = "no";
	if (arguments.length == 2) { label1 = a1; label2 = a2 }
	this.positive = new Psychlops.Widgets.Button(label1);
	this.negative = new Psychlops.Widgets.Button(label2);
	this.positive.centering().shift(-100, 200);
	this.negative.centering().shift(100, 200);

	this.draw = function () {
		this.positive.draw();
		this.negative.draw();
		if (this.positive.pushed()) {
			return 1;
		} else if (this.negative.pushed()) {
			return 2;
		} else {
			return 0;
		}
	};
};
Psychlops.Widgets.Button.make2AFC = function (a1, a2) {
	if (arguments.length == 2) { Psychlops.Button.TAFC = new Psychlops.Widgets.Button.TwoAFC(a1, a2); }
	else { Psychlops.Widgets.Button.TAFC = new Psychlops.Widgets.Button.TwoAFC(); }
};
Psychlops.Widgets.Button.get2AFC = function () { return Psychlops.Widgets.Button.TAFC.draw(); }



//////// Slider ////////

Psychlops.Widgets.Slider = function (closure_getter, closure_setter, name, range_, step, step_shift) {
	var ratio = Psychlops.the_canvas.getPixelRatio();
	this.area = this.targetarea_ = new Psychlops.Rectangle(200 * ratio, 30 * ratio);
	this.inner = new Psychlops.Rectangle(200 * ratio, 30 * ratio);
	this._changed_ = true;

	var p = Psychlops.Widgets.Slider._AUTO_ALIGN_();
	this.targetarea_.shift(p.x, p.y);

	this.link(closure_getter, closure_setter, name, range_, step, step_shift);
};
Psychlops.Widgets.Slider.prototype = {
	link: function (closure_getter, closure_setter, name, range_, step, step_shift) {
		if (range_) this.range = range_.dup();
		this.variable = new Psychlops.Variable(closure_getter, closure_setter, name, this.range, step, step_shift);
		this.old_value = null;//this.variable.getValue();
		this.letter = new Psychlops.Letters(name, 16 * Psychlops.the_canvas.getPixelRatio());
	}
	, draw: function () {
		var mouse = Psychlops.Mouse.getPosition();
		var mouse_over = this.targetarea_.include(mouse);
		var focused = true;
		var value = this.variable.getValue();

		if (mouse_over && Psychlops.Mouse.left.pressed()) {
			this.variable.setByRatioInStep((Psychlops.Mouse.x - this.targetarea_.getLeft()) / this.targetarea_.getWidth());
		}

		this.targetarea_.draw(Psychlops.Widgets.Slider.BGCOLOR);
		if (mouse_over) this.targetarea_.draw(Psychlops.Widgets.Slider.BGCOLOR2);
		var width = this.targetarea_.getWidth() * (value - this.range.begin) / (this.range.end - this.range.begin);
		this.inner.set(this.targetarea_.getLeft(), this.targetarea_.getTop(), this.targetarea_.getLeft() + width, this.targetarea_.getBottom());
		this.inner.draw(Psychlops.Widgets.Slider.FGCOLOR);

		this.letter.locate(this.targetarea_.getLeft() + 5, this.targetarea_.getBottom() - 10);
		this.letter.draw();

		if (this.old_value != value) { this._changed_ = this._changed_ || true; } else { this._changed_ = false; }
		this.old_value = value;
		return this;
	}
	, changed: function () {
		var val = this._changed_;
		this._changed_ = false;
		return val;
	}
	//void setByRatio(double ratio);
	//double getRatio() const;
	//Interval getInterval() const;
	//Interval setInterval(const Interval &itvl);
	//void increment(int modulation = 0);
	//void decrement(int modulation = 0);
}
Psychlops.Widgets.Slider.initialize = function () {
	Psychlops.Widgets.Slider._AUTO_ALIGN_POS_ = new Psychlops.Point(5, 5);
};
Psychlops.Widgets.Slider.FGCOLOR = Psychlops.Color.blue;
Psychlops.Widgets.Slider.BGCOLOR = new Psychlops.Color(0.25);
Psychlops.Widgets.Slider.BGCOLOR2 = new Psychlops.Color(0.35);
Psychlops.Widgets.Slider._AUTO_ALIGN_POS_ = new Psychlops.Point(5, 5);
Psychlops.Widgets.Slider._AUTO_ALIGN_ = function () {
	var v = new Psychlops.Point(Psychlops.Widgets.Slider._AUTO_ALIGN_POS_.x, Psychlops.Widgets.Slider._AUTO_ALIGN_POS_.y);
	Psychlops.Widgets.Slider._AUTO_ALIGN_POS_.shift(0, 40 * Psychlops.the_canvas.getPixelRatio());
	return v;
};



//////// Math ////////
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var sqrt = Math.sqrt;
var log = Math.log;
var exp = Math.exp;
var pow = Math.pow;

var PI = Psychlops.Math.PI;
var random = Psychlops.random;


//////// File ////////
Psychlops.File = new Object();

Psychlops.File.saveToServer = false;
Psychlops.File.saveToLocalFile = true;
Psychlops.File.saveToOneDrive = false;
Psychlops.File.saveToIndexDB = true;
Psychlops.File.indexedDB_ = null;
Psychlops.File.resultsDB = null;
Psychlops.File.pseudoDBkey = "PsychlopsResultDB.";
Psychlops.File.targetStorage = sessionStorage;
Psychlops.File.DBsetup = function () {
	// https://developer.mozilla.org/ja/docs/IndexedDB
	var db;
	//var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	//Psychlops.File.indexedDB_ = indexedDB;
	if (indexedDB) {
		var dbreq = indexedDB.open("PsychlopsResults", 1.0);

		dbreq.onupgradeneeded = function (ev) {
			var db = ev.target.result;
			ev.target.transaction.onerror = function (err) { };
			if (db.objectStoreNames.contains('PsychlopsResults')) { db.deleteObjectStore('PsychlopsResults'); }
			var store = db.createObjectStore("session", { keyPath: "filename" });
			//db.createIndex("date", "date", { unique: false });
			//db.createIndex("expname", "expname", { unique: false });
			//db.createIndex("participant", "participant", { unique: false });
			//db.createIndex("body", "body", { unique: false });
		}
		dbreq.onsuccess = function (ev) {
			//Psychlops.File.resultsDB = (ev.target) ? ev.target.result : ev.result;
			Psychlops.File.resultsDB = dbreq.result;
		};
	} else {
		try {
			Psychlops.File.targetStorage.setItem("PsychlopsResultsDBCapacityTest", "null");
			Psychlops.File.targetStorage.removeItem("PsychlopsResultsDBCapacityTest");
		} catch (e) {
			alert("Result files exceeds disk quota.");
		}
	}
}
Psychlops.File.DBreset = function () {
	if (Psychlops.File.resultsDB) {
		var tx = resultsDB.transaction(["session"], "readwrite");
		var store = tx.objectStore("session");
		var rq = store.clear();
		rq.onerror = function (event) { alert("Failed clearing result database."); };
	} else {
		var key;
		for (var i = 0; i < Psychlops.File.targetStorage.length; i++) {
			key = Psychlops.File.targetStorage.key(i);
			if (key.indexOf(Psychlops.File.pseudoDBkey) == 0) {
				Psychlops.File.targetStorage.removeItem(key);
			}
		}
	}
}
Psychlops.File.DBputResults = function (filename, expname, participant, body) {
	var data = { filename: filename, date: Date.now(), expname: expname, participant: participant, body: body };
	if (Psychlops.File.resultsDB) {
		var db = Psychlops.File.resultsDB;
		var tx = db.transaction(["session"], "readwrite");
		tx.oncomplete = function () { tx.close(); };
		tx.onerror = function (err) { alert("Failed to write result to database. " + err.type); };
		var store = tx.objectStore("session");
		var req = store.add(data);
	} else {
		Psychlops.File.targetStorage.setItem(Psychlops.File.pseudoDBkey + filename, JSON.stringify(data));
	}
}
Psychlops.File.DBallResults = null;
Psychlops.File.DBallResultsCallback = null;
Psychlops.File.DBgetAllResults = function () {
	if (Psychlops.File.resultsDB) {
		Psychlops.File.DBallResults = null;
		var all = [];
		var db = Psychlops.File.resultsDB;
		var tx = db.transaction(["session"], "readwrite");
		var store = tx.objectStore("session");
		var range = IDBKeyRange.lowerBound(0);
		var cursorRequest = store.openCursor(range);
		cursorRequest.onsuccess = function (e) {
			var cursor = e.target.result;
			if (cursor) {
				all.push(cursor.value);
				cursor.continue();
			} else {
				//Psychlops.File.DBallResults = all;
				if (Psychlops.File.DBallResultsCallback) { Psychlops.File.DBallResultsCallback(all); }
			}
		}
		cursorRequest.onerror = function (err) {
			Psychlops.File.DBallResults = null;
			alert("An error occurred while reading results database.")
		}
	} else {
		var all = [];
		for (var i = 0; i < Psychlops.File.targetStorage.length; i++) {
			key = Psychlops.File.targetStorage.key(i);
			if (key.indexOf(Psychlops.File.pseudoDBkey) == 0) {
				all.push(JSON.parse(Psychlops.File.targetStorage.getItem(key)));
			}
		}
		//Psychlops.File.DBallResults = all;
		if (Psychlops.File.DBallResultsCallback) { Psychlops.File.DBallResultsCallback(all); }
	}
}
Psychlops.File.saveText = function (text, filename_) {
	var filename = Psychlops.File.decodePath(filename_);
	if (Psychlops.File.saveToServer) {
		Psychlops.File.sendToServer(text, filename, 5);
	}
	if (Psychlops.File.saveToLocalFile) {
		Psychlops.File.saveTextByBlob(text, filename);
	}
	if (Psychlops.File.saveToOneDrive) {
		Psychlops.File.saveTextToOneDrive(filename, text);
	}
	if (Psychlops.File.saveToIndexDB) {
		Psychlops.File.DBputResults(filename, Psychlops.AppInfo.expname, Psychlops.AppInfo.participant_name, text);
	}
}
Psychlops.File.sendToServer = function (text, filename, retry) {
	function EncodeHTMLForm(data) {
		var params = [];
		for (var name in data) {
			var value = data[name];
			var param = encodeURIComponent(name).replace(/%20/g, '+')
				+ '=' + encodeURIComponent(value).replace(/%20/g, '+');
			params.push(param);
		}
		return params.join('&');
	}
	var data = { 'content': text, 'filename': filename };
	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.onreadystatechange = function () {
		var READYSTATE_COMPLETED = 4;
		var HTTP_STATUS_OK = 200;
		if (this.readyState == READYSTATE_COMPLETED && this.status == HTTP_STATUS_OK) {
		}
		if (this.readyState == READYSTATE_COMPLETED && this.status != HTTP_STATUS_OK) {
			//location.href = '/error';
			if (retry > 0) { Psychlops.File.sendToServer(text, filename, retry-1); }
			else {
				alert("データを送信できませんでした")
			}
		}
	}
	xmlHttpRequest.open('POST', Psychlops.File.ServerURL);
	if ($('#dummyForm').length) {
		xmlHttpRequest.setRequestHeader('X-CSRF-Token', $('#dummyForm input[name="_csrfToken"]').val());
	}
	xmlHttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlHttpRequest.send(EncodeHTMLForm(data));
}
Psychlops.File.ServerURL = "results/psychlops.reciever.php";
Psychlops.File.saveTextByBlob = function (text, filename) {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
		var blob = new Blob([bom, text], { type: "text/plain" });

		if (window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(blob, filename); // IE/Edge
		} else {
			var ua = window.navigator.userAgent.toLowerCase();
			if (ua.indexOf('firefox') != -1) {
				var a = document.createElement("a");
				a.style = "display: none";
				var url = window.URL.createObjectURL(blob);
				a.href = url;
				a.target = '_blank';
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				setTimeout(function () {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}, 100);
			} else {
				var a = document.createElement("a");
				var url = window.URL.createObjectURL(blob);
				a.href = url;
				a.target = '_blank';
				a.download = filename;
				a.click();
			}
		}
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}
}
Psychlops.File.downloadText = Psychlops.File.saveTextByBlob;
Psychlops.File.decodePath = function (path) {
	var filename = path;
	var APP_BASE_PATH = "";
	//if (!(typeof Psychlops.Util.localSettings["InternetFilePrefix"] == "undefined")) {
	//	APP_BASE_PATH = Psychlops.Util.localSettings["InternetFilePrefix"];
	//}

	var now = new Date();
	var yyyymmdd = now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "_" + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2);// + "_" + ("0" + now.getSeconds()).slice(-2);
	filename = filename.replace("%TIME_", yyyymmdd + "_").replace("%TIME%", yyyymmdd);
	filename = filename.replace("%EXPNAME_", Psychlops.AppInfo.expname + "_").replace("%EXPNAME%", Psychlops.AppInfo.expname);
	filename = filename.replace("%PARNAME_", Psychlops.AppInfo.participant_name + "_").replace("%PARNAME%", Psychlops.AppInfo.participant_name);

	filename = filename.replace("%APP%", "");
	filename = filename.replace("%RESOURCES%", "");
	filename = filename.replace("%USER_HOME%", "");
	filename = filename.replace("%USER_SETTING%", "");
	filename = filename.replace("%USER_DOCUMENTS%", "");
	filename = filename.replace("%USER_DOCUMENTS_ROOT%", "");

	return APP_BASE_PATH + filename;
}
Psychlops.File.isOneDriveReady = false;
Psychlops.File.OneDriveBasePath = "";
Psychlops.File.saveToOneDriveCallback = null;
Psychlops.File.saveTextToOneDrive = function (filename, data) {
	if (Psychlops.File.isOneDriveReady && Psychlops.File.saveToOneDriveCallback != null) { Psychlops.File.saveToOneDriveCallback(filename, data); return true; } else { return false; }
}
Psychlops.File.loadFromOneDriveCallback = null
Psychlops.File.loadFromOneDrive = function (filename) { if (Psychlops.File.isOneDriveReady && Psychlops.File.saveToOneDriveCallback != null) { return Psychlops.File.loadFromOneDriveCallback(filename); } else { return false; } }

Psychlops.Util.initializerList.push(function () {
	Psychlops.File.DBsetup();
});

//////// Data ////////

Psychlops.Data = new Object();
Psychlops.Data.delimiter = ",";
Psychlops.Data.saveToFileButton = null;
Psychlops.Data.savearrayCallback = null;
Psychlops.Data.savearrayData = null;
Psychlops.Data.savearrayTable = null;
Psychlops.Data.savearrayText = null;
Psychlops.Data.formatText = function (header, length, arr0, arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10, arr11, arr12, arr13, arr14, arr15) {
	var cols = arguments.length - 2;
	if (cols < 1) { alert("Data::formatText : number of arguments was not enough. (filename, header, length, arr0, arr1,...)"); }
	var arr = [];
	if (cols > 0) { arr.push(arr0); }
	if (cols > 1) { arr.push(arr1); }
	if (cols > 2) { arr.push(arr2); }
	if (cols > 3) { arr.push(arr3); }
	if (cols > 4) { arr.push(arr4); }
	if (cols > 5) { arr.push(arr5); }
	if (cols > 6) { arr.push(arr6); }
	if (cols > 7) { arr.push(arr7); }
	if (cols > 8) { arr.push(arr8); }
	if (cols > 9) { arr.push(arr9); }
	if (cols > 10) { arr.push(arr10); }
	if (cols > 11) { arr.push(arr11); }
	if (cols > 12) { arr.push(arr12); }
	if (cols > 13) { arr.push(arr13); }
	if (cols > 14) { arr.push(arr14); }
	if (cols > 15) { arr.push(arr15); }

	var text = "exp," + Psychlops.AppInfo.expname + "\r\nparticipant," + Psychlops.AppInfo.participant_name + "\r\n" + header + "\r\n";
	for (var i = 0; i < length; i += 1) {
		for (var j = 0; j < cols; j += 1) {
			text += arr[j][i] + Psychlops.Data.delimiter;
		}
		text += "\r\n";
	}
	return text;
}
Psychlops.Data.savearray = function (filename, header, length, arr0, arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10, arr11, arr12, arr13, arr14, arr15) {
	var cols = arguments.length - 2;
	if (cols < 1) { alert("Data::formatText : number of arguments was not enough. (filename, header, length, arr0, arr1,...)"); }
	var arr = [];
	if (cols > 0) { arr.push(arr0); }
	if (cols > 1) { arr.push(arr1); }
	if (cols > 2) { arr.push(arr2); }
	if (cols > 3) { arr.push(arr3); }
	if (cols > 4) { arr.push(arr4); }
	if (cols > 5) { arr.push(arr5); }
	if (cols > 6) { arr.push(arr6); }
	if (cols > 7) { arr.push(arr7); }
	if (cols > 8) { arr.push(arr8); }
	if (cols > 9) { arr.push(arr9); }
	if (cols > 10) { arr.push(arr10); }
	if (cols > 11) { arr.push(arr11); }
	if (cols > 12) { arr.push(arr12); }
	if (cols > 13) { arr.push(arr13); }
	if (cols > 14) { arr.push(arr14); }
	if (cols > 15) { arr.push(arr15); }

	var text = "exp," + Psychlops.AppInfo.expname + "\r\nparticipant," + Psychlops.AppInfo.participant_name + "\r\n" + header + "\r\n";
	for (var i = 0; i < length; i += 1) {
		for (var j = 0; j < cols; j += 1) {
			text += arr[j][i] + Psychlops.Data.delimiter;
		}
		text += "\r\n";
	}
	return text;
}
Psychlops.Data.savearray = function (filename, header, length, arr0, arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10, arr11, arr12, arr13, arr14, arr15) {
	var cols = arguments.length - 3;
	if (cols < 1) { alert("Data::savearray : number of arguments was not enough. (filename, header, length, arr0, arr1,...)"); }
	var arr = [];
	if (cols > 0) { arr.push(arr0); }
	if (cols > 1) { arr.push(arr1); }
	if (cols > 2) { arr.push(arr2); }
	if (cols > 3) { arr.push(arr3); }
	if (cols > 4) { arr.push(arr4); }
	if (cols > 5) { arr.push(arr5); }
	if (cols > 6) { arr.push(arr6); }
	if (cols > 7) { arr.push(arr7); }
	if (cols > 8) { arr.push(arr8); }
	if (cols > 9) { arr.push(arr9); }
	if (cols > 10) { arr.push(arr10); }
	if (cols > 11) { arr.push(arr11); }
	if (cols > 12) { arr.push(arr12); }
	if (cols > 13) { arr.push(arr13); }
	if (cols > 14) { arr.push(arr14); }
	if (cols > 15) { arr.push(arr15); }

	var text = "exp," + Psychlops.AppInfo.expname + "\r\nparticipant," + Psychlops.AppInfo.participant_name + "\r\n" + header + "\r\n";
	for (var i = 0; i < length; i += 1) {
		for (var j = 0; j < cols; j += 1) {
			text += arr[j][i] + Psychlops.Data.delimiter;
		}
		text += "\r\n";
	}
	//var text = Psychlops.Data.formatText(header, length, arr0, arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10);	Psychlops.Data.savearrayText = text;
	Psychlops.Data.savearrayData = { "filename": filename, "header": header, "array": arr }
	Psychlops.Data.savearrayTable = [];

	var header_arr = (Psychlops.Data.savearrayData.header).split(/\r\n|\r|\n/).pop().split(Psychlops.Data.delimiter);
	if (cols <= 0) { alert("Data::savearray: inappropriate header"); }
	Psychlops.Data.savearrayTable = [];
	Psychlops.Data.savearrayTable.push(header_arr);
	for (var i = 0; i < arr0.length; i++) {
		var row = [];
		for (var j = 0; j < cols; j++) {
			if (cols > 0) { row.push(arr0[i]); }
			if (cols > 1) { row.push(arr1[i]); }
			if (cols > 2) { row.push(arr2[i]); }
			if (cols > 3) { row.push(arr3[i]); }
			if (cols > 4) { row.push(arr4[i]); }
			if (cols > 5) { row.push(arr5[i]); }
			if (cols > 6) { row.push(arr6[i]); }
			if (cols > 7) { arr.push(arr7[i]); }
			if (cols > 8) { arr.push(arr8[i]); }
			if (cols > 9) { arr.push(arr9[i]); }
			if (cols > 10) { arr.push(arr10[i]); }
			if (cols > 11) { arr.push(arr11[i]); }
			if (cols > 12) { arr.push(arr12[i]); }
			if (cols > 13) { arr.push(arr13[i]); }
			if (cols > 14) { arr.push(arr14[i]); }
			if (cols > 15) { arr.push(arr15[i]); }
		}
		Psychlops.Data.savearrayTable.push(row);
	}

	Psychlops.File.saveText(text, filename);

	if (Psychlops.Data.savearrayCallback) {
		Psychlops.Data.savearrayCallback(text, filename);
	}
}
Psychlops.Data.invokeSavearray = function (filename) {
	Psychlops.File.downloadText(Psychlops.Data.savearrayText, filename);
}
Psychlops.Data.getUniqueArray = function (arr) {
	var a = arr.filter(function (x, i, self) {
		return self.indexOf(x) === i;
	});
	return a.sort();
}
Psychlops.Data.loadCSV = function (filename, delim) {
	var delimiter = ",";
	if (typeof delim == "string" && delim != "") { delimiter = delim; }
	var data;
	var fn0 = function (filename) {
		var request = new XMLHttpRequest();
		request.open("GET", filename, false);
		request.send(null);
		if (request.status == 200
			|| (request.status == 0 && (request.responseText.length != 0))
		) {
			return request.responseText;
		} else {
			return null;
		}
	};
	var fn = function (text) {
		data = [];
		var lines = text.split(/\r\n|\r|\n/);
		for (var i = 0; i < lines.length; i++) {
			console.log(lines[i]);
			lines[i] = lines[i].split(delimiter);
			data.push([]);
			for (var j = 0; j < lines[i].length; j++) {
				data[i].push(lines[i][j].trim());
			}
		}
		return data;
	};
	switch (arguments.length) {
		case 1:
		case 2:
			var text = fn0(filename);
			return fn(text);
			break;
	}
}
Psychlops.Data.loadCSVasFloat = function (filename, delim) {
	var data = Psychlops.Data.loadCSV(filename, delim);
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].length; j++) {
			data[i][j] = parseFloat(data[i][j]);
		}
	}
	return data;
}


//////// Figures ////////
Psychlops.Figures = new Object();


Psychlops.Shader = new Object();
Psychlops.Shader.POLAR = 0;
Psychlops.Shader.LEFT_TOP = 1;
Psychlops.Shader.baseVartexShader = "\
	vec3 translate(vec3 p, vec3 base){ \
		return base + p; \
	} \
	vec3 rotate(vec3 p, float angle, vec3 axis){ \
		vec3 a = normalize(axis); \
		float s = sin(angle); \
		float c = cos(angle); \
		float r = 1.0 - c; \
		mat3 m = mat3( \
			a.x * a.x * r + c, \
			a.y * a.x * r + a.z * s, \
			a.z * a.x * r - a.y * s, \
			a.x * a.y * r - a.z * s, \
			a.y * a.y * r + c, \
			a.z * a.y * r + a.x * s, \
			a.x * a.z * r + a.y * s, \
			a.y * a.z * r - a.x * s, \
			a.z * a.z * r + c \
		); \
		return m * p; \
	} \
	attribute vec3 aVertexPosition; \
	uniform mat4 uMVMatrix; \
	uniform mat4 uPMatrix; \
	attribute vec4 aRotate; \
	attribute highp vec4 aCoord; \
	varying highp vec4 vCoord; \
	";
Psychlops.Shader.baseFragmentShader = ""
	+ "uniform highp vec3 uInvColorGamma;"
	+ "varying highp vec4 vCoord;"
	+ "uniform highp vec4 uCoord;"
	+ "uniform highp mat4 uParam;"
	+ "const highp float HALF_BIT = 0.00196078431;"
	+ "const highp float PI = 3.14159265358979323846264338327950288;"
	+ "const highp float PI_DOUBLE = 2.0 * PI;"
	+ "const highp float PI_HALF = 1.5707963267948966192313216916398;"
	+ "const highp float E  = 2.718281828459045235360287471352;"
	+ "const highp vec4 field_origin = vec4(0.5,0.5,0.0,1.0);"
	+ "highp float xp() { return vCoord.x; }"
	+ "highp float yp() { return vCoord.y; }"
	+ "highp vec2 point() { return vCoord.xy; }"
	+ "highp float rp() { return length(vec2(xp(),yp())); }"
	+ "highp float thetaf() { return atan(yp(), xp()); }"
	+ "highp float width() { return uCoord[2]; }"
	+ "highp float height() { return uCoord[3]; }"
	+ "\r\n";
Psychlops.Shader.pixUtilsGLSL = ""
	+ "void pix(highp float r, highp float g, highp float b) { pix(r,g,b,1.0); }"
	+ "void pix(highp float l, highp float a) { pix(l,l,l,a); }"
	+ "void pix(highp float l) { pix(l,l,l,1.0); }"
	+ "void pix(highp vec4 c) { pix(c.r, c.g, c.b, c.a); }"
	+ "\r\n";
Psychlops.Shader.revertGLSL = function (source) {
	var jscode = source;
	jscode = jscode.replace(/([^\w\.])Math\.sin\(/g, "$1sin(");
	jscode = jscode.replace(/([^\w\.])Math\.cos\(/g, "$1cos(");
	jscode = jscode.replace(/([^\w\.])Math\.sqrt\(/g, "$1sqrt(");
	jscode = jscode.replace(/([^\w\.])Math\.floor\(/g, "$1floor(");
	jscode = jscode.replace(/([^\w\.])Math\.ceil\(/g, "$1ceil(");
	jscode = jscode.replace(/([^\w\.])Math\.PI/g, "$1PI");
	jscode = jscode.replace(/([^\w\.])Math\.atan\(/g, "$1atan(");
	jscode = jscode.replace(/([^\w\.])Math\.atan2\(/g, "$1atan2(");
	jscode = jscode.replace(/([^\w\.])Math\.pow\(/g, "$1pow(");
	jscode = jscode.replace(/([^\w\.])Psychlops\.Math\.mod\(/g, "$1mod(");
	return jscode;
}


Psychlops.Figures.ShaderField = function (vert, frag) {
	this.shader = null;
	this.area = this.targetarea_ = new Psychlops.Rectangle();
	this.coordMode = Psychlops.Shader.POLAR;
	this.vertSource = Psychlops.Shader.baseVartexShader + Psychlops.Figures.ShaderField.vertSource;
	this.flagSource = "";
	this.flagSources = {};
}
Psychlops.Figures.ShaderField.prototype = {
	setFunction: function (source) {
		this.flagSource = source;
	}
	, compile: function (arg1) {
		if (this.shader == null) {
			var c = arg1 || Psychlops.the_canvas;
			var jscode = this.flagSource;
			jscode = Psychlops.Shader.revertGLSL(jscode);
			jscode = Psychlops.Shader.pixUtilsGLSL + jscode;
			if (Psychlops.Util.useNoisyBit) {
				jscode = Psychlops.Figures.ShaderField.pseudoRandomGLSL + jscode;
			} else {
				jscode = Psychlops.Figures.ShaderField.normalPixFragmentShader + jscode;
			}
			jscode = Psychlops.Shader.baseFragmentShader + jscode;
			jscode = "precision highp float;\r\n" + jscode;
			this.shader = c.createShader(this.vertSource, jscode);
		}
	}
	, draw: function (target_area, params, params_quarter_length, target_canvas) {
		if (this.shader == null) { this.compile(); }
		var c = target_canvas || Psychlops.the_canvas;
		var area = target_area || this.targetarea_;
		var WID = area.getWidth(), HEI = area.getHeight();
		var ADJPX = -0.125, ADJPY = -0.1255;
		var PX, PY;
		switch (this.coordMode) {
			case Psychlops.Shader.POLAR:
				PX = WID / 2;//area.getLeft() + WID / 2 + .5;
				PY = HEI / 2;//- Psychlops.the_canvas.getHeight() + area.getTop() + HEI / 2 + .5;
				break;
			case Psychlops.Shader.LEFT_TOP:
			default:
				PX = 0;//area.getLeft();
				PY = 0;//-Psychlops.the_canvas.getHeight() + area.getTop();
				break;
		}
		var coords = [PX, PY, WID, HEI];
		c.drawShader(this.shader, area, coords, params, params_quarter_length);
	}
	, setCoordMode: function (mode) {
		this.coordMode = mode;
	}
}
Psychlops.Figures.ShaderField.vertSource = ""
	+ "void main(void) {"
	+ "  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);"
	+ "  vCoord = aCoord;"
	+ "}";
Psychlops.Figures.ShaderField.lightPixFragmentShader = ""
	+ "void pix(float r, float g, float b, float a) {"
	+ "  gl_FragColor = vec4(r,g,b,a);"
	+ "}"
	+ "\r\n";
Psychlops.Figures.ShaderField.normalPixFragmentShader = ""
	+ "void pix(float r, float g, float b, float a) {"
	+ "  gl_FragColor = vec4("
	+ "    floor(255.0*pow(r,uInvColorGamma[0])+0.5)/255.0,"
	+ "    floor(255.0*pow(g,uInvColorGamma[1])+0.5)/255.0,"
	+ "    floor(255.0*pow(b,uInvColorGamma[2])+0.5)/255.0,"
	+ "    a);"
	+ "  }"
	+ "\r\n";
Psychlops.Figures.ShaderField.pseudoRandomGLSL = "\
	const highp vec2 FIX_SEED = vec2(12.9898,78.233);\
	vec3 pseudo_random(highp vec4 co){\
		highp vec3 r;\
		r[0] = fract(sin(dot(co.xy, FIX_SEED)) * 43758.5453);\
		r[1] = fract(sin(dot(co.xz, FIX_SEED)) * 43758.5453);\
		r[2] = fract(sin(dot(co.xw, FIX_SEED)) * 43758.5453);\
		return r; \
	} \
	void pix(highp float r, highp float g, highp float b, highp float a) { \
		vec4 l = vec4(pow(r,uInvColorGamma[0]),pow(g,uInvColorGamma[1]),pow(b,uInvColorGamma[2]), a); \
		l.rgb *= 255.0; \
		vec3 p = pseudo_random(vec4(vCoord.x+uParam[3][0], vCoord.y+uParam[3][1], vCoord.y+uParam[3][2], vCoord.y+uParam[3][3])); \
		if(fract(l.r)>p.r) { l.r = floor(l.r)+1.0; } else { l.r = floor(l.r); } \
		if(fract(l.g)>p.g) { l.g = floor(l.g)+1.0; } else { l.g = floor(l.g); } \
		if(fract(l.b)>p.b) { l.b = floor(l.b)+1.0; } else { l.b = floor(l.b); } \
		l.rgb /= 255.0; \
		gl_FragColor = l; \
	} \
	\r\n";

Psychlops.Figures.ShaderImage = function () {
	this.shader = null;
	this.images = [];
	this.sampler_num = 1;
	this.coordMode = Psychlops.Shader.LEFT_TOP;
	this.vertSource = Psychlops.Shader.baseVartexShader + Psychlops.Figures.ShaderImage.vertSource;
	this.flagSource = Psychlops.Figures.ShaderImage.defaultFragmentShader;
	this.flagSources = {};
}
Psychlops.Figures.ShaderImage.prototype = {
	setImageNumber: function (num) {
		this.sampler_num = num;
	}
	, setFunction: function (source) {
		this.flagSource = source;
	}
	, compile: function (arg1) {
		if (this.shader == null) {
			var c = arg1 || Psychlops.the_canvas;
			var jscode = this.flagSource;
			jscode = Psychlops.Shader.revertGLSL(jscode);
			jscode = Psychlops.Shader.pixUtilsGLSL + jscode;
			if (this.sampler_num == 2) { jscode = Psychlops.Figures.ShaderImage.texFragmentShader2 + jscode; }
			jscode = Psychlops.Figures.ShaderImage.texFragmentShader + jscode;
			if (Psychlops.Util.useNoisyBit) {
				jscode = Psychlops.Figures.ShaderField.pseudoRandomGLSL + jscode;
			} else {
				jscode = Psychlops.Figures.ShaderField.normalPixFragmentShader + jscode;
			}
			jscode = Psychlops.Shader.baseFragmentShader + jscode;
			jscode = "precision highp float;\r\n" + jscode;
			this.shader = c.createShader(this.vertSource, jscode);
		}
	}
	, draw: function (target_images, params, params_quarter_length, target_canvas) {
		if (Array.isArray(target_images)) { this.images = target_images; }
		else { this.images = [target_images]; }
		if (this.shader == null) { this.compile(); }
		var c = target_canvas || Psychlops.the_canvas;
		var area = this.images[0].targetarea_;
		var WID = area.getWidth(), HEI = area.getHeight();
		var ADJPX = -0.125, ADJPY = -0.1255;
		var PX, PY;
		switch (this.coordMode) {
			case Psychlops.Shader.POLAR:
				PX = WID / 2;//area.getLeft() + WID / 2 + .5;
				PY = HEI / 2;//- Psychlops.the_canvas.getHeight() + area.getTop() + HEI / 2 + .5;
				break;
			case Psychlops.Shader.LEFT_TOP:
			default:
				PX = 0;//area.getLeft();
				PY = 0;//-Psychlops.the_canvas.getHeight() + area.getTop();
				break;
		}
		var coords = [PX, PY, WID, HEI];
		c.drawShaderImage(this.shader, this.images, coords, params, params_quarter_length);
	}
	, setCoordMode: function (mode) {
		this.coordMode = mode;
	}
}
Psychlops.Figures.ShaderImage.vertSource = "\
	attribute vec2 aTextureCoord; \
	varying highp vec2 vTextureCoord; \
	void main(void) { \
		vec3 v = rotate(aVertexPosition, float(aRotate.x), vec3(0.0,0.0,1.0)); \
		v = translate(v, vec3(aRotate[1], aRotate[2], 0.0)); \
		gl_Position = uPMatrix * uMVMatrix * vec4(v, 1.0); \
		vTextureCoord = aTextureCoord; \
		vCoord = aCoord; \
	}";
Psychlops.Figures.ShaderImage.texFragmentShader = "\
	varying highp vec2 vTextureCoord; \
	uniform sampler2D uSampler0; \
	vec4 getPix() { return texture2D(uSampler0, vec2(vTextureCoord.s, vTextureCoord.t) ); } \
	vec4 getPix(highp float x, highp float y) { return texture2D(uSampler0, vec2(float(x)/float(uCoord[0]), float(y)/float(uCoord[1])) ); } \
	vec4 getPix(vec2 p) { return texture2D(uSampler0, p/vec2(uCoord.xy)); } \
	vec4 getPixOffset(highp float x, highp float y) { return texture2D(uSampler0, vec2((float(x)+vCoord.x)/float(uCoord[0]), (float(y)+vCoord.y)/float(uCoord[1])) ); } \
	vec4 getPixOffset(highp vec2 p) { return texture2D(uSampler0, (p+vCoord.xy)/uCoord.xy); } \
	";
Psychlops.Figures.ShaderImage.texFragmentShader2 = "\
	uniform sampler2D uSampler1; \
	vec4 getPix2() { return texture2D(uSampler1, vec2(vTextureCoord.s, vTextureCoord.t) ); } \
	vec4 getPix2(highp float x, highp float y) { return texture2D(uSampler1, vec2(float(x)/float(uCoord[0]), float(y)/float(uCoord[1])) ); } \
	vec4 getPix2(vec2 p) { return texture2D(uSampler1, p/vec2(uCoord.xy)); } \
	vec4 getPixOffset2(highp float x, highp float y) { return texture2D(uSampler1, vec2((float(x)+vCoord.x)/float(uCoord[0]), (float(y)+vCoord.y)/float(uCoord[1])) ); } \
	vec4 getPixOffset2(highp vec2 p) { return texture2D(uSampler1, (p+vCoord.xy)/uCoord.xy); } \
	";
Psychlops.Figures.ShaderImage.defaultFragmentShader = "\
	void main(void) { \
		pix(getPix()); \
	}\
"
//uniform sampler2D SIZE_LOG; \

Psychlops.Figures.NoisyBitClearGLSL = function () {
	this.fill = new Psychlops.Color(0.0, 0.0, 0.0, 1.0);
	this.area = new Psychlops.Rectangle();
}
Psychlops.Figures.NoisyBitClearGLSL.prototype = {
	draw: function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		if (Psychlops.Util.useNoisyBit) {
			Psychlops.Figures.NoisyBitClearGLSL.shader.draw(this.area, [this.fill.r, this.fill.g, this.fill.b, 1.0, 0, 0, 0, 0, 0, 0, 0, 0, Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()], 3, arg1);
		} else {
			Psychlops.Figures.NoisyBitClearGLSL.shader.draw(this.area, [this.fill.r, this.fill.g, this.fill.b, 1.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
		}
	}
	, cache: function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shader.compile();
	}
}
Psychlops.Util.initializerList.push(function () {
	Psychlops.Figures.NoisyBitClearGLSL.shader = new Psychlops.Figures.ShaderField();
	Psychlops.Figures.NoisyBitClearGLSL.shader.flagSource = Psychlops.Figures.NoisyBitClearGLSL.flagSource;
	//Psychlops.Figures.NoisyBitClearGLSL.instance = new Psychlops.Figures.NoisyBitClearGLSL();
});
Psychlops.Figures.NoisyBitClearGLSL.flagSource = "\
	void main(void) { \
		pix(uParam[0][0], uParam[0][1], uParam[0][2], 1.0); \
	}";





Psychlops.Audio = function (arg) {
	this._playing = false;
	this._context = null;
	this._buffer = null;
	this._source = null;
	this._gain = null;
	this._loop = false;
	this._sourceType = "";
	this._onended = null;

	this.initialized = false;
	this.initialize();
	switch (arguments.length) {
		case 1:
			this.load(arg);
			break;
	}
}
Psychlops.Audio._context = new (window.AudioContext || window.webkitAudioContext)();
Psychlops.Audio.prototype = {
	initialize: function () {
		if (!this.initialized) {
			this._gain = Psychlops.Audio._context.createGain();
			//this._gain.connect(Psychlops.Audio._context.destination);
		}
		this.initialized = true;
	}
	, _onended: function () { this._ended = true; }
	, _beeptone: function (freq) {
	var oscillator = Psychlops.Audio._context.createOscillator();
		oscillator.type = 'square';
		oscillator.frequency.value = 440;
		this._source = oscillator;
		this._sourceType = "OSCILLATOR";
	}
	, isPlaying() { return this._playing; }
	, load: function (url) {
		var parentObj = this;
		//alert(typeof Psychlops.Image._STORE_[url]);
		if (url in Psychlops.Audio._STORE_) {
			parentObj.buffer = Psychlops.Audio._STORE_[url];
		} else {
			if (!(url in Psychlops.Audio._LOADING_ARRAY_)) {
				Psychlops.Audio._LOADING_ARRAY_[url] = url;
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'arraybuffer';
				xhr.addEventListener("loadend", function () {
					if (xhr.status === 200 || (xhr.status == 0 && (xhr.responseText.length != 0))) {
						var data = xhr.response;
						Psychlops.Audio._context.decodeAudioData(data, function (buffer) {
							parentObj._buffer = buffer;
							Psychlops.Audio._STORE_[url] = parentObj._buffer;
							delete Psychlops.Audio._LOADING_ARRAY_[url];
						});
					}
					//Psychlops.Image._LOADING_ -= 1;
				});
				xhr.addEventListener("error", function () { alert("An error was occured in loading a audio: " + URL); Psychlops.Image._LOADING_ -= 1; return; });
				xhr.open('GET', url, true);
				xhr.send();
				//Psychlops.Image._LOADING_ += 1;
				this._sourceType = "PCM";
			}
			return true;
		}
		return false;
	}
	, pause: function () {
		if (this._source !== null) {
			if(Psychlops.Util.isUIExclusive) {
			} else {
				this._source.stop();
			}
		}
		if (this._playing) { this._gain.disconnect(); }
		this._playing = false;
		if (this._onended !== null) { window.clearTimeout(this._onended); this._onended = null; }
	}
	, stop: function () {
		if (this._source !== null) {
			if(Psychlops.Util.isUIExclusive) {
			} else {
				this._source.stop();
			}
		}
		if (this._playing) { this._gain.disconnect(); }
		this._playing = false;
		if (this._onended !== null) { window.clearTimeout(this._onended); this._onended = null; }
	}
	, play: function () {
		this.playFromRatio(0);
	}
	, playFromRatio: function (percent) {
		switch (this._sourceType) {
		case "PCM":
			var parentObj = this;
			if (this._buffer !== null && this._playing == false) {
				//if (this._source == null) {
				if (true) {
					if (Psychlops.Util.isUIExclusive && this._source !== null && this._source.loop==true) this._source.stop();
					this._source = Psychlops.Audio._context.createBufferSource();
					this._source.loop = this._loop;
					if (this._source.buffer != this._buffer) { this._source.buffer = this._buffer; }
					//this._source.connect(Psychlops.Audio._context.destination);
					this._source.connect(this._gain);
					this._gain.connect(Psychlops.Audio._context.destination);
				}
				this._source.loop = this._loop;
				this._source.start(0, (percent / 100) * parentObj._buffer.length / parentObj._buffer.sampleRate);
				if (!this._loop) {
					this._onended = window.setTimeout(function () {
						parentObj._source.stop();
						if (parentObj._playing) { parentObj._gain.disconnect(); }
						parentObj._playing = false;
					}, ((100 - percent) / 100) * 1000 * parentObj._buffer.length / parentObj._buffer.sampleRate);
					//this._source.onended = new function () { parentObj.stop(); }
				}
				this._playing = true;
				this._source.onended = this._onended;
				this._ended = false;
			}
			break;
		case "OSCILLATOR":
			if (this._playing == false) {
				this._source.connect(this._gain);
				this._gain.connect(Psychlops.Audio._context.destination);
			}
			this._source.start();
			this._playing = true;
			break;
		}
	}
	, loop: function (on) {
		this._loop = on;
		switch (this._sourceType) {
		case "PCM":
			if (this._source !== null) { this._source.loop = this._loop; }
			break;
		}
	}
	, setVolumeInRatio: function (ratio) {
		var r = ratio < 0 ? 0 : ratio;
		this._gain.gain.value = r;
	}
	, setVolumeInRelativedB: function (dB) {
		var r = Math.pow(10, dB / 10);
		this._gain.gain.value = r;
	}
	, ended: function () { return this._ended; }
}
Psychlops.Audio.beep = function () {
	var a = new Psychlops.Audio();
	a._beeptone();
	a.play();
	window.setTimeout(function () { a.stop(); }, 125);
}
Psychlops.Audio._STORE_ = {};
Psychlops.Audio._LOADING_ARRAY_ = {};
Psychlops.Audio._TOUCH_INITIALIZED_ = false;
Psychlops.Audio._TOUCH_INIT_ = function () { Psychlops.Audio._context.createBufferSource().start(0); Psychlops.Audio._TOUCH_INITIALIZED_ = true; } // call this from touch context

