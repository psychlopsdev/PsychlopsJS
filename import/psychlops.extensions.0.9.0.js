Psychlops.Extensions = new Object();

Psychlops.Extensions.Browser = new Object();
//https://github.com/uupaa/UserAgent.js
Psychlops.Extensions.Browser.BROWSER_ENGINES = {
	"Chrome": "Blink",
	"Firefox": "Gecko",
	"IE": "Trident",
	"Edge": "Trident",
	"AOSP": "WebKit",
	"Safari": "WebKit",
	"WebKit": "WebKit",
	"Chrome for iOS": "WebKit",
};
Psychlops.Extensions.Browser.WebGLDetector = {
	"detect": null,
	"DETECTED": false,
	"WEBGL_CONTEXT": "",     // WebGL context. "webgl", "webgl2", "experimental-webgl", ...
	"WEBGL_VERSION": "",     // WebGL version string.
	"MAX_TEXTURE_SIZE": 0,      // MAX_TEXTURE_SIZE (0, 1024 - 16384)
	"repository": "https://github.com/uupaa/WebGLDetector.js",
};
Psychlops.Extensions.Browser.WebGLDetector_detect = function () {
	//if (IN_BROWSER || IN_NW) {
	if (!Psychlops.Extensions.Browser.WebGLDetector["DETECTED"]) {
		var canvas = document.createElement("canvas");
		if (canvas &&
			canvas.getContext) { // avoid [IE8]
			var idents = ["webgl2", "experimental-webgl2", "webgl", "experimental-webgl"];

			for (var i = 0, iz = idents.length; i < iz; ++i) {
				var ctx = idents[i];
				var gl = canvas.getContext(ctx);

				if (gl) {
					Psychlops.Extensions.Browser.WebGLDetector["WEBGL_CONTEXT"] = ctx;
					Psychlops.Extensions.Browser.WebGLDetector["WEBGL_VERSION"] = gl["getParameter"](gl["VERSION"]);
					Psychlops.Extensions.Browser.WebGLDetector["MAX_TEXTURE_SIZE"] = gl["getParameter"](gl["MAX_TEXTURE_SIZE"]);
					Psychlops.Extensions.Browser.WebGLDetector["DETECTED"] = true;
					break;
				}
			}
		}
	}
	//}
}
Psychlops.Extensions.Browser.WebGLDetector.detect = Psychlops.Extensions.Browser.WebGLDetector_detect;
Psychlops.Extensions.Browser.identifyUserAgent = function () {
	// --- class / interfaces ----------------------------------
	function UserAgent(userAgent, // @arg String = navigator.userAgent
					   options) { // @arg Object = {} - { WEB_VIEW, DISPLAY_DPR, DISPLAY_LONG, DISPLAY_SHORT }
		options = options || {};

		var nav = window.navigator || {};
		var ua = userAgent || nav["userAgent"] || "";
		var os = _detectOS(ua);
		var osVersion = _detectOSVersion(ua, os);
		var browser = _detectBrowser(ua);
		var browserVersion = _detectBrowserVersion(ua, browser);
		var device = _detectDevice(ua, os, osVersion, options);
		var lang = (nav["language"] || nav["userLanguage"] || "en").split("-", 1)[0]; // "en-us" -> "en"

		var r = {};
		r.OS = os;
		r.OS_VERSION = osVersion;
		r.BROWSER = browser;
		r.BROWSER_ENGINE = Psychlops.Extensions.Browser.BROWSER_ENGINES[browser] || "";
		r.BROWSER_VERSION = browserVersion;
		r.MOBILE = /Android|iOS/.test(os) || /Windows Phone/.test(ua);
		r.USER_AGENT = ua;
		r.LANGUAGE = lang;
		r.WEB_VIEW = _isWebView(ua, os, browser, browserVersion, options);
		r.DEVICE = device;
		r.AOSP = _isAOSP(ua, os, browser, parseFloat(browserVersion));
		r["ES5"] = /native/.test(Object["keys"] + "");
		r["ES6"] = /native/.test(String["raw"] + "");
		r.Android = (r.OS === "Android");
		r.iOS = (r.OS === "iOS");
		return r;
	}

	// --- implements ------------------------------------------
	function _detectOS(ua) {
		switch (true) {
			case /Android/.test(ua): return "Android";
			case /iPhone|iPad|iPod/.test(ua): return "iOS";
			case /Windows/.test(ua): return "Windows";
			case /Mac OS X/.test(ua): return "Mac";
			case /CrOS/.test(ua): return "Chrome OS";
			case /Firefox/.test(ua): return "Firefox OS";
		}
		return "";
	}

	function _detectOSVersion(ua, os) {
		switch (os) {
			case "Android": return _getVersion(ua, "Android");
			case "iOS": return _getVersion(ua, /OS /);
			case "Windows": return _getVersion(ua, /Phone/.test(ua) ? /Windows Phone (?:OS )?/
																						: /Windows NT/);
			case "Mac": return _getVersion(ua, /Mac OS X /);
		}
		return "0.0.0";
	}

	function _detectBrowser(ua) {
		switch (true) {
			case /CriOS/.test(ua): return "Chrome for iOS"; // https://developer.chrome.com/multidevice/user-agent
			case /Edge/.test(ua): return "Edge";
			case /Chrome/.test(ua): return "Chrome";
			case /Firefox/.test(ua): return "Firefox";
			case /Android/.test(ua): return "AOSP"; // AOSP stock browser
			case /MSIE|Trident/.test(ua): return "IE";
			case /Safari\//.test(ua): return "Safari";
			case /AppleWebKit/.test(ua): return "WebKit";
		}
		return "";
	}

	function _detectBrowserVersion(ua, browser) {
		switch (browser) {
			case "Chrome for iOS": return _getVersion(ua, "CriOS/");
			case "Edge": return _getVersion(ua, "Edge/");
			case "Chrome": return _getVersion(ua, "Chrome/");
			case "Firefox": return _getVersion(ua, "Firefox/");
			case "AOSP": return _getVersion(ua, /Silk/.test(ua) ? "Silk/" : "Version/");
			case "IE": return /IEMobile/.test(ua) ? _getVersion(ua, "IEMobile/")
													 : /MSIE/.test(ua) ? _getVersion(ua, "MSIE ") // IE 10
																		   : _getVersion(ua, "rv:");  // IE 11
			case "Safari": return _getVersion(ua, "Version/");
			case "WebKit": return _getVersion(ua, "WebKit/");
		}
		return "0.0.0";
	}

	function _detectDevice(ua, os, osVersion, options) {
		var screen = window.screen || {};
		var screenWidth = screen["width"] || 0;
		var screenHeight = screen["height"] || 0;
		var dpr = options["DISPLAY_DPR"] || window.devicePixelRatio || 1.0;
		var long_ = options["DISPLAY_LONG"] || Math.max(screenWidth, screenHeight);
		var short_ = options["DISPLAY_SHORT"] || Math.min(screenWidth, screenHeight);
		var retina = dpr >= 2;
		var longEdge = Math.max(long_, short_); // iPhone 4s: 480, iPhone 5: 568

		switch (os) {
			case "Android": return _getAndroidDevice(ua, retina);
			case "iOS": return _getiOSDevice(ua, retina, longEdge, osVersion);
		}
		return "";
	}

	function _getAndroidDevice(ua, retina) {
		if (/Firefox/.test(ua)) { return ""; } // exit Firefox for Android
		try {
			var result = ua.split("Build/")[0].split(";").slice(-1).join().trim().
						 replace(/^SonyEricsson/, "").
						 replace(/^Sony/, "").replace(/ 4G$/, "");
			if (result === "Nexus 7") {
				return retina ? "Nexus 7 2nd" // Nexus 7 (2013)
							  : "Nexus 7";    // Nexus 7 (2012)
			}
			return result;
		} catch (o__o) {
			// ignore
		}
		return "";
	}

	function _getiOSDevice(ua, retina, longEdge, osVersion) {
		var WebGLDetector = Psychlops.Extensions.Browser.WebGLDetector;
		if ("detect" in WebGLDetector) { WebGLDetector.detect(); }
		var glVersion = WebGLDetector["WEBGL_VERSION"] || "";
		//var SGX535 = /535/.test(glVersion); // iPhone 3GS, iPhone 4
		var SGX543 = /543/.test(glVersion); // iPhone 4s/5/5c, iPad 2/3, iPad mini
		var SGX554 = /554/.test(glVersion); // iPad 4
		var A7 = /A7/.test(glVersion);  // iPhone 5s, iPad mini 2/3, iPad Air
		var A8X = /A8X/.test(glVersion); // A8X, iPad Air 2
		var A8 = /A8/.test(glVersion);  // A8,  iPhone 6/6+, iPad mini 4, iPod touch 6
		var A9 = /A9/.test(glVersion);  // A9, A9X, iPhone 6s/6s+, iPad Pro

		if (/iPhone/.test(ua)) {
			return !retina ? "iPhone 3GS"
				 : longEdge <= 480 ? (SGX543 || osVersion >= 8 ? "iPhone 4s" : "iPhone 4") // iPhone 4 stopped in iOS 7.
				 : longEdge <= 568 ? (A7 ? "iPhone 5s" : "iPhone 5") // iPhone 5 or iPhone 5c
				 : longEdge <= 667 ? (A9 ? "iPhone 6s" : "iPhone 6")
				 : longEdge <= 736 ? (A9 ? "iPhone 6s Plus" : "iPhone 6 Plus") : "";
		} else if (/iPad/.test(ua)) {
			return !retina ? "iPad 2" // iPad 1/2, iPad mini
				 : SGX543 ? "iPad 3"
				 : SGX554 ? "iPad 4"
				 : A7 ? "iPad mini 2" // iPad mini 3, iPad Air
				 : A8X ? "iPad Air 2"
				 : A8 ? "iPad mini 4"
				 : A9 ? "iPad Pro" : "";
		} else if (/iPod/.test(ua)) {
			return longEdge <= 480 ? (retina ? "iPod touch 4" : "iPod touch 3")
								   : (A8 ? "iPod touch 6" : "iPod touch 5");
		}
		return "";
	}

	function _getVersion(ua, token) { // @ret SemverString - "0.0.0"
		try {
			return _normalizeSemverString(ua.split(token)[1].trim().split(/[^\w\.]/)[0]);
		} catch (o_O) {
			// ignore
		}
		return "0.0.0";
	}

	function _normalizeSemverString(version) { // @arg String - "Major.Minor.Patch"
		// @ret SemverString - "Major.Minor.Patch"
		var ary = version.split(/[\._]/); // "1_2_3" -> ["1", "2", "3"]
		// "1.2.3" -> ["1", "2", "3"]
		return (parseInt(ary[0], 10) || 0) + "." +
			   (parseInt(ary[1], 10) || 0) + "." +
			   (parseInt(ary[2], 10) || 0);
	}

	function _isAOSP(ua, os, browser, version) { // @ret Boolean - is AOSP Stock UserAgent
		if (os === "Android" && browser === "AOSP") {
			if (!/Silk/.test(ua)) {
				if (version >= 4.0 && version < 4.4) {
					return true;
				}
			}
		}
		return false;
	}

	function _isWebView(ua, os, browser, version, options) { // @ret Boolean - is WebView
		switch (os + browser) {
			case "iOSSafari": return false;
			case "iOSWebKit": return _isWebView_iOS(options);
			case "AndroidAOSP": return false; // can not accurately detect
			case "AndroidChrome": return parseFloat(version) >= 42 ? /; wv/.test(ua)
										 : /\d{2}\.0\.0/.test(version) ? true // 40.0.0, 37.0.0, 36.0.0, 33.0.0, 30.0.0
										 : _isWebView_Android(options);
		}
		return false;
	}

	function _isWebView_iOS(options) { // @arg Object - { WEB_VIEW }
		// @ret Boolean
		// Chrome 15++, Safari 5.1++, IE11, Edge, Firefox10++
		// Android 5.0 ChromeWebView 30: webkitFullscreenEnabled === false
		// Android 5.0 ChromeWebView 33: webkitFullscreenEnabled === false
		// Android 5.0 ChromeWebView 36: webkitFullscreenEnabled === false
		// Android 5.0 ChromeWebView 37: webkitFullscreenEnabled === false
		// Android 5.0 ChromeWebView 40: webkitFullscreenEnabled === false
		// Android 5.0 ChromeWebView 42: webkitFullscreenEnabled === ?
		// Android 5.0 ChromeWebView 44: webkitFullscreenEnabled === true
		var document = (window.document || {});

		if ("WEB_VIEW" in options) {
			return options["WEB_VIEW"];
		}
		return !("fullscreenEnabled" in document ||
				 "webkitFullscreenEnabled" in document || false);
	}

	function _isWebView_Android(options) { // @arg Object - { WEB_VIEW }
		// Chrome 8++
		// Android 5.0 ChromeWebView 30: webkitRequestFileSystem === false
		// Android 5.0 ChromeWebView 33: webkitRequestFileSystem === false
		// Android 5.0 ChromeWebView 36: webkitRequestFileSystem === false
		// Android 5.0 ChromeWebView 37: webkitRequestFileSystem === false
		// Android 5.0 ChromeWebView 40: webkitRequestFileSystem === false
		// Android 5.0 ChromeWebView 42: webkitRequestFileSystem === false
		// Android 5.0 ChromeWebView 44: webkitRequestFileSystem === false
		if ("WEB_VIEW" in options) {
			return options["WEB_VIEW"];
		}
		return !("requestFileSystem" in window ||
				 "webkitRequestFileSystem" in window || false);
	}

	var ua = UserAgent(window.navigator.userAgent);
	return ua; // return entity
}


//// Variable Watcher
Psychlops.Variables = new Object();
Psychlops.Variables.debugMode = false;
Psychlops.Variables.watching = false;
Psychlops.Variables.watchList = new Object();
Psychlops.Variables.watchListName = [];
Psychlops.Variables.initialize = function()
{
	Psychlops.Variables.watchList = new Object();
	Psychlops.Variables.watchListName = [];
}
Psychlops.Variables.watch = function(name, obj) {
	Psychlops.Variables.watchList[name] = obj;
	Psychlops.Variables.watchListName.push(name);
	Psychlops.Variables.watchListName.sort();
};
Psychlops.Variables.set = function(name, value) {
	Psychlops.Variables.watchList[name].setValue(value);
};
Psychlops.Variables.get = function(name) {
	return Psychlops.Variables.watchList[name].getValue();
};
Psychlops.Variables.enumerate = function() {
	var arr = [];
	for(var i=0; i<Psychlops.Variables.watchListName.length; i+=1) {
		var name = Psychlops.Variables.watchListName[i];
		arr.push( [name, Psychlops.Variables.get(name)] );
	}
	return arr;
};
Psychlops.Variables.enumerateHTML = function() {
	var html = "<table><tr><th id='psychlops_watcher_name'>Name</th><th id='psychlops_watcher_value'>Value</th></tr>";
	var arr = Psychlops.Variables.enumerate ();
	for(var i=0; i<arr.length; i++) {
		html += "<tr><td>"+String(arr[i][0])+"</td><td>"+String(arr[i][1])+"</td></tr>";
	}
	html += "</table>";
	return html;
}
Psychlops.Variables.debugCallback = null;


//// Image Kits

Psychlops.Extensions.drawGaborOnImage = function(area,  ori,  wavelength,  phase,  contrast) {
	var freq = 1/wavelength;
	var center_x = area.width/2;
	var center_y = area.height/2;
	var width = area.width/2;
	var height = area.height/2;
	var tmpcol = new Psychlops.Color();
	var _x,_y,_r;
	var sigma = (width)/2.5
	var sigma_sq=sigma*sigma;
	var SINORI, COSORI;
	SINORI=Math.sin(ori);COSORI=Math.cos(ori);
	for(var y=-height; y<height; y++) {
		for(var x=-width; x<width; x++) {
			_x = COSORI*x-SINORI*y;
			_y = SINORI*x+COSORI*y;
			tmpcol.set( 0.5*contrast*Math.exp(-(Math.pow(x,2)+Math.pow(y,2))/(Math.pow(sigma,2)))*Math.cos(phase+2*PI*freq*_x) +0.5 );
			area.pix(x+width,y+height,tmpcol);
		}
	}
}


//// Visualizer
/**
* @license
*
* Regression.JS - Regression functions for javascript
* http://tom-alexander.github.com/regression-js/
*
* copyright(c) 2013 Tom Alexander
* Licensed under the MIT license.
*
**/
!function () { "use strict"; var a = function (a, b) { var c = 0, d = 0, e = 0, f = 0, g = 0, h = a.length - 1, i = new Array(b); for (c = 0; h > c; c++) { for (f = c, d = c + 1; h > d; d++) Math.abs(a[c][d]) > Math.abs(a[c][f]) && (f = d); for (e = c; h + 1 > e; e++) g = a[e][c], a[e][c] = a[e][f], a[e][f] = g; for (d = c + 1; h > d; d++) for (e = h; e >= c; e--) a[e][d] -= a[e][c] * a[c][d] / a[c][c] } for (d = h - 1; d >= 0; d--) { for (g = 0, e = d + 1; h > e; e++) g += a[e][d] * i[e]; i[d] = (a[h][d] - g) / a[d][d] } return i }, b = { linear: function (a) { for (var b = [0, 0, 0, 0, 0], c = 0, d = []; c < a.length; c++) null != a[c][1] && (b[0] += a[c][0], b[1] += a[c][1], b[2] += a[c][0] * a[c][0], b[3] += a[c][0] * a[c][1], b[4] += a[c][1] * a[c][1]); for (var e = (c * b[3] - b[0] * b[1]) / (c * b[2] - b[0] * b[0]), f = b[1] / c - e * b[0] / c, g = 0, h = a.length; h > g; g++) { var i = [a[g][0], a[g][0] * e + f]; d.push(i) } var j = "y = " + Math.round(100 * e) / 100 + "x + " + Math.round(100 * f) / 100; return { equation: [e, f], points: d, string: j } }, linearThroughOrigin: function (a) { for (var b = [0, 0], c = 0, d = []; c < a.length; c++) null != a[c][1] && (b[0] += a[c][0] * a[c][0], b[1] += a[c][0] * a[c][1]); for (var e = b[1] / b[0], f = 0, g = a.length; g > f; f++) { var h = [a[f][0], a[f][0] * e]; d.push(h) } var i = "y = " + Math.round(100 * e) / 100 + "x"; return { equation: [e], points: d, string: i } }, exponential: function (a) { var b = [0, 0, 0, 0, 0, 0], c = 0, d = []; for (i = a.length; i > c; c++) null != a[c][1] && (b[0] += a[c][0], b[1] += a[c][1], b[2] += a[c][0] * a[c][0] * a[c][1], b[3] += a[c][1] * Math.log(a[c][1]), b[4] += a[c][0] * a[c][1] * Math.log(a[c][1]), b[5] += a[c][0] * a[c][1]); for (var e = b[1] * b[2] - b[5] * b[5], f = Math.pow(Math.E, (b[2] * b[3] - b[5] * b[4]) / e), g = (b[1] * b[4] - b[5] * b[3]) / e, h = 0, i = a.length; i > h; h++) { var j = [a[h][0], f * Math.pow(Math.E, g * a[h][0])]; d.push(j) } var k = "y = " + Math.round(100 * f) / 100 + "e^(" + Math.round(100 * g) / 100 + "x)"; return { equation: [f, g], points: d, string: k } }, logarithmic: function (a) { var b = [0, 0, 0, 0], c = 0, d = []; for (h = a.length; h > c; c++) null != a[c][1] && (b[0] += Math.log(a[c][0]), b[1] += a[c][1] * Math.log(a[c][0]), b[2] += a[c][1], b[3] += Math.pow(Math.log(a[c][0]), 2)); for (var e = (c * b[1] - b[2] * b[0]) / (c * b[3] - b[0] * b[0]), f = (b[2] - e * b[0]) / c, g = 0, h = a.length; h > g; g++) { var i = [a[g][0], f + e * Math.log(a[g][0])]; d.push(i) } var j = "y = " + Math.round(100 * f) / 100 + " + " + Math.round(100 * e) / 100 + " ln(x)"; return { equation: [f, e], points: d, string: j } }, power: function (a) { var b = [0, 0, 0, 0], c = 0, d = []; for (h = a.length; h > c; c++) null != a[c][1] && (b[0] += Math.log(a[c][0]), b[1] += Math.log(a[c][1]) * Math.log(a[c][0]), b[2] += Math.log(a[c][1]), b[3] += Math.pow(Math.log(a[c][0]), 2)); for (var e = (c * b[1] - b[2] * b[0]) / (c * b[3] - b[0] * b[0]), f = Math.pow(Math.E, (b[2] - e * b[0]) / c), g = 0, h = a.length; h > g; g++) { var i = [a[g][0], f * Math.pow(a[g][0], e)]; d.push(i) } var j = "y = " + Math.round(100 * f) / 100 + "x^" + Math.round(100 * e) / 100; return { equation: [f, e], points: d, string: j } }, polynomial: function (b, c) { "undefined" == typeof c && (c = 2); for (var d = [], e = [], f = [], g = 0, h = 0, i = 0, j = c + 1; j > i; i++) { for (var k = 0, l = b.length; l > k; k++) null != b[k][1] && (g += Math.pow(b[k][0], i) * b[k][1]); d.push(g), g = 0; for (var m = [], n = 0; j > n; n++) { for (var k = 0, l = b.length; l > k; k++) null != b[k][1] && (h += Math.pow(b[k][0], i + n)); m.push(h), h = 0 } e.push(m) } e.push(d); for (var o = a(e, j), i = 0, l = b.length; l > i; i++) { for (var p = 0, q = 0; q < o.length; q++) p += o[q] * Math.pow(b[i][0], q); f.push([b[i][0], p]) } for (var r = "y = ", i = o.length - 1; i >= 0; i--) r += i > 1 ? Math.round(o[i] * Math.pow(10, i)) / Math.pow(10, i) + "x^" + i + " + " : 1 == i ? Math.round(100 * o[i]) / 100 + "x + " : Math.round(100 * o[i]) / 100; return { equation: o, points: f, string: r } }, lastvalue: function (a) { for (var b = [], c = null, d = 0; d < a.length; d++) a[d][1] ? (c = a[d][1], b.push([a[d][0], a[d][1]])) : b.push([a[d][0], c]); return { equation: [c], points: b, string: "" + c } } }, c = function (a, c, d) { return "string" == typeof a ? b[a](c, d) : void 0 }; "undefined" != typeof exports ? module.exports = c : Psychlops.Data.regression = c }();

Psychlops.Data.logisticRegression = function (data) {
	// ！仮実装．本来は最尤推定を行う．ロジットに変換した単回帰でしかないので確率1＝ロジット+∞と確率0＝ロジット-∞が扱えない
	var logit = [];
	for(var i=0; i<data.length; i++) {
		var p = data[i][1];
		p = p < 1.0 ? p : 0.999;
		p = p > 0.0 ? p : 0.001;
		logit.push([data[i][0], Math.log( p / (1 - p))]);
	}
	var result = Psychlops.Data.regression('linear', logit);
	var points = [];
	for(var i=0; i<result.points.length; i++) {
		var odds = Math.exp(result.points[i][1]);
		points.push([result.points[i][0], odds / (1 + odds)]);
	}
	return { "equation": ["mean", "sd"], "points": points };
}


//// Shader Figures

Psychlops.Figures.Grating = function (tex__, mask__, pix__) {
	this.wavelength = 5;
	this.orientation = 0;
	this.phase = 0;
	this.contrast = 1.0;
	this.set(10, 10);

	if (Psychlops.Util.useNoisyBit_static) {
		this.noiseseed = [Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()];
	}

	this.setFormula = function (tex__, mask__, pix__) {
		this.mask = mask__;
		this.tex = tex__;
		this.pix = pix__;
		if (mask__ && tex__ && pix__) {
			this.cache();
		}
	};
	this.setArea = function (width, height) {
		this.set(width, height);
		return this;
	}
	this.setSigma = function (sigma) {
		this.set(sigma * 8.0, sigma * 8.0);
		return this;
	};
	this.setWave = function (wavelen, cont, orient, phs) {
		this.contrast = cont;
		this.wavelength = wavelen;
		this.orientation = orient;
		this.phase = phs;
		return this;
	};
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		if (Psychlops.Util.useNoisyBit) {
			if (Psychlops.Util.useNoisyBit_static) {
				Psychlops.Figures.Grating.shader[this.shaderID].draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, this.noiseseed[0], this.noiseseed[1], this.noiseseed[2], this.noiseseed[3]], 2, arg1);
			} else {
				Psychlops.Figures.Grating.shader[this.shaderID].draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()], 2, arg1);
			}
		} else {
			Psychlops.Figures.Grating.shader[this.shaderID].draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
		}
	};
	this.cache = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shaderID = this.mask + this.tex + this.pix;
		if (typeof Psychlops.Figures.Grating.shader[this.shaderID] == "undefined") {
			var shader = new Psychlops.Figures.ShaderField();
			shader.flagSource
				= Psychlops.Figures.Grating.flagHeader
				+ (this.mask.indexOf("  ") == 0 ? this.mask : Psychlops.Figures.Grating.flagMask[this.mask])
				+ (this.tex.indexOf("  ") == 0 ? this.tex : Psychlops.Figures.Grating.flagTex[this.tex])
				+ (this.pix.indexOf("  ") == 0 ? this.pix : Psychlops.Figures.Grating.flagPix[this.pix])
				+ Psychlops.Figures.Grating.flagFooter;
			shader.compile();
			Psychlops.Figures.Grating.shader[this.shaderID] = shader;
		}
	};
	this.setFormula(tex__, mask__, pix__);
}
Psychlops.Util.initializerList.push(function () { Psychlops.Figures.Grating.shader = {}; });
Psychlops.Figures.Grating.prototype = new Psychlops.Rectangle();
Psychlops.Figures.Grating.shader = {};
Psychlops.Figures.Grating.flagTex = {
	'uni': "  highp float level = contrast*0.5;",
	'sin': "  highp float level = contrast*0.5*sin(frequency*_x + phase);",
	'sqr': "  highp float level = contrast*(fract( (frequency*_x + phase) / PI_DOUBLE )<.5 ? -.5 : .5);",
	'saw': "  highp float level = contrast*(fract( (frequency*_x + phase) / PI_DOUBLE ) - 0.5);",
	'tri': "  highp float level = contrast*2.0*(abs(fract( (frequency*_x + phase) / PI_DOUBLE ) - 0.5) -0.25);",
};
Psychlops.Figures.Grating.flagMask = {
	"flat": "  highp float env = 1.0;",
	"circle": "  highp float env = 2.0*rp()<width() ? 1.0 : 0.0;",
	"raisedCos": "  highp float _r = min(rp() / width(), 0.5) * PI_DOUBLE;"
	            +"  highp float env = 0.5 + 0.5 * cos(_r);",
	"gauss": "  highp float _r = rp()*8.0/width();"
	        +"  highp float env = exp( -(_r*_r) / 2.0 );",
};
Psychlops.Figures.Grating.flagPix = {
	"gray": "  pix( 0.996078*(0.5+env*(level)) );",
	"gray-alpha": "  highp float mg = 0.5+level; pix(mg,mg,mg,env);",
	"blue": "  pix(0.0,0.0,0.996078*(0.5+env*(level)),1.0);",
};
Psychlops.Figures.Grating.flagHeader
	= "void main(void) {"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
    + "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();";
Psychlops.Figures.Grating.flagFooter 
	= "}";



Psychlops.Figures.ShaderGaussianDot = function () {
	this.set(10, 10);

	if (Psychlops.Util.useNoisyBit) {
		Psychlops.Figures.ShaderGaussianDot.shader.flagSource = Psychlops.Figures.ShaderGaussianDot.flagSource_Noisybit;
	} else {
		Psychlops.Figures.ShaderGaussianDot.shader.flagSource = Psychlops.Figures.ShaderGaussianDot.flagSource;
	}

	this.setSigma = function (sigma) {
		this.set(sigma * 8.0, sigma * 8.0);
		return this;
	};
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		if (Psychlops.Util.useNoisyBit) {
			Psychlops.Figures.ShaderGaussianDot.shader.draw(this, [this.fill.r, this.fill.g, this.fill.b, 0, 8.0 / this.getWidth(), 0, 0, 0, 0, 0, 0, 0, Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()], 2, arg1);
		} else {
			Psychlops.Figures.ShaderGaussianDot.shader.draw(this, [this.fill.r, this.fill.g, this.fill.b, 0, 8.0 / this.getWidth(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
		}
	};
	this.cache = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shader.compile();
	};
}
Psychlops.Figures.ShaderGaussianDot.prototype = new Psychlops.Rectangle();
Psychlops.Util.initializerList.push(function () { Psychlops.Figures.ShaderGaussianDot.shader = new Psychlops.Figures.ShaderField(); });
Psychlops.Figures.ShaderGaussianDot.flagSource
	= "void main(void) {"
	+ "  highp float _r = rp()*uParam[1][0];"
	+ "  highp float level = 0.996078*exp( -(_r*_r) / 2.0 );"
	+ "  highp vec4 col = vec4(uParam[0][0], uParam[0][1], uParam[0][2], level);"
	+ "  pix(col);"
	+ "}";
Psychlops.Figures.ShaderGaussianDot.flagSource_Noisybit
	= "void main(void) {"
	+ "  highp float _r = rp()*uParam[1][0];"
	+ "  highp float level = 0.996078*exp( -(_r*_r) / 2.0 );"
	+ "  highp vec4 col = vec4(uParam[0][0], uParam[0][1], uParam[0][2], level);"
	+ "  pix(col.r, col.g, col.b, level);"
	+ "}";

Psychlops.Figures.ShaderDoG = function () {
	this.setSigma = function (sigma) {
		this.set(sigma * 8.0, sigma * 8.0);
		return this;
	};
	this.setInnerSigma = function (sigma) {
		this._innersigma = sigma * 8.0;
		return this;
	};
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		if (Psychlops.Util.useNoisyBit) {
			Psychlops.Figures.ShaderDoG.shader.draw(this, [this.fill.r, this.fill.g, this.fill.b, 0, 8.0 / this.getWidth(), 8.0 / this._innersigma, 0, 0, 0, 0, 0, 0, Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()], 2, arg1);
		} else {
			Psychlops.Figures.ShaderDoG.shader.draw(this, [this.fill.r, this.fill.g, this.fill.b, 0, 8.0 / this.getWidth(), 8.0 / this._innersigma, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
		}
	};
	this.cache = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shader.compile();
	};

	this.setSigma(4);
	this.setInnerSigma(2);

	if (Psychlops.Util.useNoisyBit) {
		Psychlops.Figures.ShaderDoG.shader.flagSource = Psychlops.Figures.ShaderDoG.flagSource_Noisybit;
	} else {
		Psychlops.Figures.ShaderDoG.shader.flagSource = Psychlops.Figures.ShaderDoG.flagSource;
	}
}
Psychlops.Figures.ShaderDoG.prototype = new Psychlops.Rectangle();
Psychlops.Util.initializerList.push(function () { Psychlops.Figures.ShaderDoG.shader = new Psychlops.Figures.ShaderField(); });
Psychlops.Figures.ShaderDoG.flagSource
	= "void main(void) {"
	+ "  highp float _r = rp()*uParam[1][0];"
	+ "  highp float _q = rp()*uParam[1][1];"
	+ "  highp float level = 0.996078*(exp( -(_r*_r) / 2.0 )-exp( -(_q*_q) / 2.0 ));"
	+ "  highp vec4 col = vec4(uParam[0][0], uParam[0][1], uParam[0][2], level);"
	+ "  pix(col);"
	+ "}";
Psychlops.Figures.ShaderDoG.flagSource_Noisybit
	= "void main(void) {"
	+ "  highp float _r = rp()*uParam[1][0];"
	+ "  highp float _q = rp()*uParam[1][1];"
	+ "  highp float level = 0.996078*(exp( -(_r*_r) / 2.0 )-exp( -(_q*_q) / 2.0 ));"
	+ "  highp vec4 col = vec4(uParam[0][0], uParam[0][1], uParam[0][2], level);"
	+ "  pix(col);"
	+ "}";

Psychlops.Figures.ShaderGabor = function () {
	this.wavelength = 5;
	this.orientation = 0;
	this.phase = 0;
	this.contrast = 1.0;
	this.set(10, 10);
	this.TEST_DITHER = false;

	if (Psychlops.Util.useNoisyBit) {
		Psychlops.Figures.ShaderGabor.shader.flagSource = Psychlops.Figures.ShaderGabor.flagSource_Noisybit;
	} else {
		Psychlops.Figures.ShaderGabor.shader.flagSource = Psychlops.Figures.ShaderGabor.flagSource;
	}

	this.setSigma = function (sigma) {
		this.set(sigma * 8.0, sigma * 8.0);
		return this;
	};
	this.setWave = function (wavelen, cont, orient, phs) {
		this.contrast = cont;
		this.wavelength = wavelen;
		this.orientation = orient;
		this.phase = phs;
		return this;
	};
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		if (Psychlops.Util.useNoisyBit) {
			if (this.TEST_DITHER == true) {
				Psychlops.Figures.ShaderGabor.shader.draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.1, 0.123456789, 0.9], 2, arg1);
			} else {
				Psychlops.Figures.ShaderGabor.shader.draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()], 2, arg1);
			}
		} else {
			Psychlops.Figures.ShaderGabor.shader.draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
		}
	};
	this.cache = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shader.compile();
	};
}
Psychlops.Figures.ShaderGabor.prototype = new Psychlops.Rectangle();
Psychlops.Util.initializerList.push(function () { Psychlops.Figures.ShaderGabor.shader = new Psychlops.Figures.ShaderField(); });
Psychlops.Figures.ShaderGabor.flagSource
	= "void main(void) {"
	+ "  highp float _r = rp()*8.0/width();"
	+ "  highp float env = exp( -(_r*_r) / 2.0 );"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
	+ "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();"
	//+ "float level = 0.5+contrast*0.5*cos(frequency*_x + phase);"
	//+ "pix(level,env);"
	+ "  highp float level = 0.996078*(0.5+env*( contrast*0.5*sin(frequency*_x + phase) ));"
	+ "  pix(level);"
	+ "}";
Psychlops.Figures.ShaderGabor.flagSource_Noisybit
	= "void main(void) {"
	+ "  highp float _r = rp()*8.0/width();"
	+ "  highp float env = exp( -(_r*_r) / 2.0 );"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
	+ "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();"
	//+ "float level = 0.5+contrast*0.5*cos(frequency*_x + phase);"
	//+ "pix(level,env);"
	+ "  highp float level = (0.996078*(0.5+env*( contrast*0.5*sin(frequency*_x + phase) )));"
	+ "  pix(level,level,level,1.0);"
	+ "}";


Psychlops.Figures.ShaderGaborAlpha = function () {
	this.wavelength = 5;
	this.orientation = 0;
	this.phase = 0;
	this.contrast = 1.0;
	this.set(10, 10);

	if (Psychlops.Util.useNoisyBit) {
		Psychlops.Figures.ShaderGaborAlpha.shader.flagSource = Psychlops.Figures.ShaderGaborAlpha.flagSource_Noisybit;
	} else {
		Psychlops.Figures.ShaderGaborAlpha.shader.flagSource = Psychlops.Figures.ShaderGaborAlpha.flagSource;
	}

	this.setSigma = function (sigma) {
		this.set(sigma * 8.0, sigma * 8.0);
		return this;
	};
	this.setWave = function (wavelen, cont, orient, phs) {
		this.contrast = cont;
		this.wavelength = wavelen;
		this.orientation = orient;
		this.phase = phs;
		return this;
	};
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		Psychlops.Figures.ShaderGaborAlpha.shader.draw(this, [this.contrast, (2.0 * Math.PI) / this.wavelength, this.orientation, this.phase, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
	};
	this.cache = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shader.compile();
	};

}
Psychlops.Figures.ShaderGaborAlpha.prototype = new Psychlops.Rectangle();
Psychlops.Util.initializerList.push(function () { Psychlops.Figures.ShaderGaborAlpha.shader = new Psychlops.Figures.ShaderField(); });
Psychlops.Figures.ShaderGaborAlpha.flagSource
	= "void main(void) {"
	+ "  highp float _r = rp()*8.0/width();"
	+ "  highp float env = exp( -(_r*_r) / 2.0 );\r\n"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
	+ "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();"
	//+ "float level = 0.5+contrast*0.5*cos(frequency*_x + phase);"
	//+ "pix(level,env);"
	+ "  highp float level = 0.5+contrast*0.5*sin(frequency*_x + phase);"
	//+ "  float level = 0.996078*(0.5+env*( contrast*0.5*cos(frequency*_x + phase) ));"
	+ "  pix(level,level,level,env);"
	+ "}";
Psychlops.Figures.ShaderGaborAlpha.flagSource_Noisybit
	= "void main(void) {"
	+ "  highp float _r = rp()*8.0/width();"
	+ "  highp float env = exp( -(_r*_r) / 2.0 );"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
	+ "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();"
	//+ "float level = 0.5+contrast*0.5*cos(frequency*_x + phase);"
	//+ "pix(level,env);"
	+ "  highp float level = 0.5+contrast*0.5*sin(frequency*_x + phase);"
	+ "  pix(level,level,level,env);"
	+ "}";


Psychlops.Figures.ShaderPlaid = function () {
	this.wavelength = 5;
	this.orientation = 0;
	this.phase = 0;
	this.contrast = 0.5;
	this.wavelength2 = 5;
	this.orientation2 = Math.PI/2;
	this.phase2 = 0;
	this.contrast2 = 0.5;
	this.set(10, 10);

	if (Psychlops.Util.useNoisyBit) {
		Psychlops.Figures.ShaderPlaid.shader.flagSource = Psychlops.Figures.ShaderPlaid.flagSource_Noisybit;
	} else {
		Psychlops.Figures.ShaderPlaid.shader.flagSource = Psychlops.Figures.ShaderPlaid.flagSource;
	}

	this.setSigma = function (sigma) {
		this.set(sigma * 8.0, sigma * 8.0);
		return this;
	};
	this.setWave = function (wavelen, cont, orient, phs) {
		this.contrast = cont;
		this.wavelength = wavelen;
		this.orientation = orient;
		this.phase = phs;
		return this;
	};
	this.setWave2 = function (wavelen, cont, orient, phs) {
		this.contrast2 = cont;
		this.wavelength2 = wavelen;
		this.orientation2 = orient;
		this.phase2 = phs;
		return this;
	};
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		if (Psychlops.Util.useNoisyBit) {
			Psychlops.Figures.ShaderPlaid.shader.draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, this.contrast2, 2.0 * Math.PI / this.wavelength2, this.orientation2, this.phase2, 0, 0, 0, 0, Psychlops.random(), Psychlops.random(), Psychlops.random(), Psychlops.random()], 2, arg1);
		} else {
			Psychlops.Figures.ShaderPlaid.shader.draw(this, [this.contrast, 2.0 * Math.PI / this.wavelength, this.orientation, this.phase, this.contrast2, 2.0 * Math.PI / this.wavelength2, this.orientation2, this.phase2, 0, 0, 0, 0, 0, 0, 0, 0], 1, arg1);
		}
	};
	this.cache = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.shader.compile();
	};
}
Psychlops.Figures.ShaderPlaid.prototype = new Psychlops.Rectangle();
Psychlops.Util.initializerList.push(function () { Psychlops.Figures.ShaderPlaid.shader = new Psychlops.Figures.ShaderField(); });
Psychlops.Figures.ShaderPlaid.flagSource
	= "void main(void) {"
	+ "  highp float _r = rp()*8.0/width();"
	+ "  highp float env = exp( -(_r*_r) / 2.0 );"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
	+ "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();"
	+ "  highp float _l = contrast*0.5*sin(frequency*_x + phase);"
	+ "  highp float contrast2 = uParam[1][0], frequency2 = uParam[1][1], orientation2 = uParam[1][2], phase2 = uParam[1][3];"
	+ "  highp float _x2 = sin(orientation2)*xp()-cos(orientation2)*yp();"
	+ "  highp float _l2 = contrast2*0.5*sin(frequency2*_x2 + phase2);"
	+ "  highp float level = 0.996078*(0.5+env*(_l+_l2));"
	+ "  pix(level);"
	+ "}";
Psychlops.Figures.ShaderPlaid.flagSource_Noisybit
	= "void main(void) {"
	+ "  highp float _r = rp()*8.0/width();"
	+ "  highp float env = exp( -(_r*_r) / 2.0 );"
	+ "  highp float contrast = uParam[0][0], frequency = uParam[0][1], orientation = uParam[0][2], phase = uParam[0][3];"
	+ "  highp float _x = sin(orientation)*xp()-cos(orientation)*yp();"
	+ "  highp float _l = 0.5+env*( contrast*0.5*sin(frequency*_x + phase) );"
	+ "  highp float contrast2 = uParam[1][0], frequency2 = uParam[1][1], orientation2 = uParam[1][2], phase2 = uParam[1][3];"
	+ "  highp float _x2 = sin(orientation2)*xp()-cos(orientation2)*yp();"
	+ "  highp float _l2 = 0.5+env*( contrast2*0.5*sin(frequency2*_x + phase2) );"
	+ "  highp float level = 0.996078*(_l+_l2);"
	+ "  pix(level,level,level,1.0);"
	+ "}";



//// Widgets

Psychlops.Widgets.Dial = function (closure_getter, closure_setter, name, range_, window_range, initial_value) {
	this.range = new Psychlops.Interval(0, "<=", 1, "<=");
	this.window_range = 1;
	this.phase = 0;
	this.initial_value = 0;
	this.value = 0;
	this._changed_ = true;
	this.label = [new Psychlops.Letters(), new Psychlops.Letters()];
	this.pressed_ = false;
	this.released_ = false;
	this.drag_datum = null;
	this.drag_datum_phase = 0;

	
	this.link = function (closure_getter, closure_setter, name, range_, window_range, initial_value) {
		if (range_) this.range = range_.dup();
		this.variable = new Psychlops.Variable(closure_getter, closure_setter, name, this.range, window_range, window_range);
		this.old_value = null;//this.variable.getValue();
		this.window_range = window_range;
		this.setLabel(name);
		this.setInitialValue(initial_value);
	}
	this.getValue = function () {
		return this.variable.getValue();
	}
	this.setValue = function (a1) {
		this.variable.setValue(a1);
		this.phase = (a1 - this.initial_value) / this.window_range;
	}
	this.setInitialValue = function (a1) {
		this.initial_value = a1;
		this.variable.setValue(a1);
		this.phase = 0;
	}
	this.setLabel = function (arg1, arg2) {
		if (typeof arg1 == "string") { this.label[0].setString(arg1); } else if (typeof arg1 == "Object") { this.label[0] = arg1; }
		return this;
	}
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;

		var w = this.getWidth();
		var rect = new Psychlops.Rectangle();
		rect.fill = Psychlops.Widgets.Theme.current.normal_background[0];
		rect.stroke.color = Psychlops.Widgets.Theme.current.normal_foreground[0];
		rect.set(this.getWidth(), this.getHeight()).centering(this).draw();

		if (this.label[0].str.length>0) { this.label[0].centering(this.getLeft(), this.getBottom() + this.label[0].font.size).draw(this.fill); }

		var pos = Psychlops.Mouse.getPosition();

		var p = Psychlops.Mouse.left.pressed();
		if (p == true) {
			if(this.pressed_ == false && this.include(pos) && this.drag_datum == null) {
				this.drag_datum = pos;
				this.drag_datum_phase = this.phase;
			}
		} else {
			this.drag_datum = null;
		}
		this.pressed_ = p;

		if (this.drag_datum != null) {
			this.phase = this.drag_datum_phase + ((pos.x - this.drag_datum.x) / this.getWidth());
			this.variable.setValue((this.window_range * this.phase) + this.initial_value);
			if (this.variable.getValue() < this.range.begin) { this.variable.setValue(this.range.begin); this.phase = (this.range.begin - this.initial_value) / this.window_range; }
			if (this.variable.getValue() > this.range.end) { this.variable.setValue(this.range.end); this.phase = (this.range.end - this.initial_value) / this.window_range; }
		}

		rect.set(1, this.getHeight());
		for (var i = 0; i < 10; i++) {
			//var pos = -w / 2 + Psychlops.Math.mod(this.phase * w + i * w / 10, w);
			var pos = Psychlops.Math.mod((-this.phase + i/10.0) * PI, PI);
			rect.centering(this).shift(w/2 * cos(pos), 0).draw(Psychlops.Widgets.Theme.current.normal_foreground[0]);
		}
	};
	this.changed = function () {
		return this.variable.changed();
	};

	switch (arguments.length) {
		case 0:
			this.link(function () { return this.value; }, function (v) { this.value = v; }, "", this.range, 0.5, 0.5);
			break;
		case 6:
			this.link(closure_getter, closure_setter, name, range_, window_range, initial_value);
			break;
	}
}
Psychlops.Widgets.Dial.prototype = new Psychlops.Rectangle();

Psychlops.Widgets.ProgressBar = function () {
	this.tmp_rect = new Psychlops.Rectangle();
	this.ratio = 0;
	this.doesShowBox = true;
	this.doesShowNumber = false;

	this.setRatio = function (arg1) {
		this.ratio = arg1;
	}
	this.setValue = function (arg1, arg2) {
		this.ratio = arg1 / arg2;
	}

	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;

		if(this.doesShowBox) {
			this.tmp_rect.set(this.getLeft(), this.getTop(), this.getRight(), this.getBottom());
			this.tmp_rect.draw(Psychlops.Widgets.Slider.BGCOLOR);
			this.tmp_rect.set(this.getLeft(), this.getTop(), this.getLeft() + this.getWidth() * this.ratio, this.getBottom());
			this.tmp_rect.draw(Psychlops.Widgets.Slider.FGCOLOR);
		}
		if(this.doesShowNumber) {
			c.msg(Math.round(this.ratio*100) + "%", this.tmp_rect.getLeft(), this.tmp_rect.getBottom() - this.tmp_rect.getHeight()/10);
		}
	}
}
Psychlops.Widgets.ProgressBar.prototype = new Psychlops.Rectangle();

Psychlops.Widgets.SteppedSlider = function () {
	this.step = 2;
	this.label = [new Psychlops.Letters(), new Psychlops.Letters()];

	this.pushed_item_ = Psychlops.Widgets.SteppedSlider.Undefined;
	this.pressed_ = false;
	this.released_ = false;
	this.cross_point = new Array(this.step);
	for (var _k = 0; _k < this.step; _k++) { this.cross_point[_k] = new Psychlops.Point(); }


	this.setStep = function (arg) {
		this.step = arg;
		this.cross_point = new Array(this.step);
		for (var _k = 0; _k < this.step; _k++) { this.cross_point[_k] = new Psychlops.Point(); }
		return this;
	}
	this.setLabel = function (arg1, arg2) {
		if (typeof arg1 == "string") { this.label[0].setString(arg1); } else if (typeof arg1 == "Object") { this.label[0] = arg1; }
		if (typeof arg2 == "string") { this.label[1].setString(arg2); } else if (typeof arg2 == "Object") { this.label[1] = arg2; }
		return this;
	}
	this.draw = function (arg1) {
		var c = arg1 || Psychlops.the_canvas;
		this.fill.set(Psychlops.Widgets.Theme.current.normal_foreground[0]);

		var rect = new Psychlops.Rectangle();
		rect.set(this.getWidth(), 5).centering(this).draw(this.fill);

		for (var i = 0; i < this.step; i++) {
			var d = i / (this.step - 1);
			this.cross_point[i].set(this.getLeft(), this.getCenter().y).shift(d * this.getWidth(), 0);
			rect.set(5, this.getHeight()).centering(this.cross_point[i]).draw(this.fill);
		}
		this.label[0].centering(this.getLeft(), this.getBottom() + this.label[0].font.size).draw(this.fill);
		this.label[1].centering(this.getRight(), this.getBottom() + this.label[0].font.size).draw(this.fill);

		var pos = Psychlops.Mouse.getPosition();
		var x_pos = Math.floor( (((pos.x - this.getLeft()) / this.getWidth()) * (this.step - 1)) + 0.5 );
		x_pos = x_pos < 0 ? 0 : x_pos;
		x_pos = x_pos >= this.step ? this.step - 1 : x_pos;

		var ell = new Psychlops.Ellipse(15,15);
		ell.centering(this.getLeft(), this.getCenter().y).shift(x_pos * this.getWidth() / (this.step - 1), 0).draw(Psychlops.Color.red);


		var touch_area = new Psychlops.Ellipse(this.getWidth() / (this.step - 1), this.getHeight() + 20 * Psychlops.Canvas.HiDPIFactor);
		var p = Psychlops.Mouse.left.pressed();
		if (this.pressed_ == true && p == false) {
			for (var i = 0; i < this.step; i++) {
				touch_area.centering(this.cross_point[i]);
				if (touch_area.include(pos.x, pos.y)) {
					this.pushed_ = x_pos;
				}
			}
		}
		this.pressed_ = p;
	};
	this.getPushedItem = function () { var v = this.pushed_; this.pushed_ = Psychlops.Widgets.SteppedSlider.Undefined; return v; }
}
Psychlops.Widgets.SteppedSlider.prototype = new Psychlops.Rectangle();
Psychlops.Widgets.SteppedSlider.Undefined = null;


Psychlops.DistanceWatcher = function () {
	this.start = function () { startVideo(); }
	this.stop = function () { stopVideo(); }

	function makeContainer() {
		var tags = '<div id="wathcer_container" style="display:none"><video id="videoel" width="480" height="640" preload="auto" loop playsinline></video><canvas id="overlay" width="480" height="640"></canvas></div>';
		var div = document.createElement('div');
		div.innerHTML = tags;
		var newelement = div.childNodes[0];
		var window_container = document.getElementById("DistanceWatcher");//Psychlops.Util.window_canvas_container_element_id);
		var fullscreen_container = document.getElementById("DistanceWatcher");//(Psychlops.Util.fullscreen_canvas_container_element_id);
		window_container.appendChild(newelement);
	}
	makeContainer();

	var trackingStarted = false;
	var trackingEnabled = false;
	var vid = document.getElementById('videoel');
	var vid_width = vid.width;
	var vid_height = vid.height;
	var overlay = document.getElementById('overlay');
	var overlayCC = overlay.getContext('2d');

	///// Setup of video/webcam and checking for webGL support /////

	function enablestart() {
		trackingEnabled = true;
		//startVideo();
	}

	function adjustVideoProportions() {
		// resize overlay and video if proportions of video are not 4:3
		// keep same height, just change width
		var proportion = vid.videoWidth / vid.videoHeight;
		vid_width = Math.round(vid_height * proportion);
		vid.width = vid_width;
		overlay.width = vid_width;
	}

	function gumSuccess(stream) {
		// add camera stream if getUserMedia succeeded
		if ("srcObject" in vid) {
			vid.srcObject = stream;
		} else {
			vid.src = (window.URL && window.URL.createObjectURL(stream));
		}
		vid.onloadedmetadata = function () {
			adjustVideoProportions();
			vid.play();
		}
		vid.onresize = function () {
			adjustVideoProportions();
			if (trackingStarted) {
				ctrack.stop();
				ctrack.reset();
				ctrack.start(vid);
			}
		}
	}

	function gumFail() {
		// fall back to video if getUserMedia failed
		alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
	}

	function gumTry() {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

		// set up video
		if (navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia({ video: true }).then(gumSuccess).catch(gumFail);
		} else if (navigator.getUserMedia) {
			navigator.getUserMedia({ video: true }, gumSuccess, gumFail);
		} else {
			alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
		}

		vid.addEventListener('canplay', enablestart, false);
	}
	gumTry();
	///// Code for face tracking /////

	var ctrack = new clm.tracker();
	ctrack.init();

	function startVideo() {
		if (trackingEnabled && !trackingStarted) {
			// start tracking
			ctrack.start(vid);
			trackingStarted = true;
			// start loop to draw face
			vid.play();
			drawLoop();
		}
	}
	function stopVideo() {
		if (trackingEnabled && trackingStarted) {
			ctrack.stop();
			vid.pause();
			trackingStarted = false;
		}
	}

	this.distance = 0;
	function drawLoop() {
		if (trackingStarted) requestAnimFrame(drawLoop);
		overlayCC.clearRect(0, 0, vid_width, vid_height);
		//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
		var positions = ctrack.getCurrentPosition();
		var distance = 0;
		if (positions) {
			//ctrack.draw(overlay);
			var dx = positions[27][0] - positions[32][0];
			var dy = positions[27][1] - positions[32][1];
			var dd = Math.sqrt(dx * dx + dy * dy);
			var angle = dd / Psychlops.DistanceWatcher.factor;
			distance = 6.0 / Math.tan(angle);
		}
		//document.getElementById("result").value = distance + " cm";
		Psychlops.DistanceWatcher.distance = distance;
		this.distance = distance;
	}

	////// Code for stats //////

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	document.getElementById('wathcer_container').appendChild(stats.domElement);

	// update stats on every iteration
	document.addEventListener('clmtrackrIteration', function (event) {
		stats.update();
	}, false);
}
Psychlops.DistanceWatcher.factor = 800 / 8 * 2 * Math.PI;
Psychlops.DistanceWatcher.distance = 0;
Psychlops.DistanceWatcher._default = null;
Psychlops.DistanceWatcher.set = function () {
	Psychlops.DistanceWatcher._default = new Psychlops.DistanceWatcher();
}
Psychlops.DistanceWatcher.enable = function () {
	if (Psychlops.DistanceWatcher._default != null) {
		Psychlops.DistanceWatcher._default.start();
	}
}
Psychlops.DistanceWatcher.disable = function () {
	if (Psychlops.DistanceWatcher._default != null) {
		Psychlops.DistanceWatcher._default.stop();
	}
}
Psychlops.DistanceWatcher.getDistance = function () {
	return Psychlops.DistanceWatcher.distance;
}
Psychlops.DistanceWatcher.fallWithin = function (arg1, arg2) {
	if (Psychlops.DistanceWatcher.distance < arg1) {
		return -1;
	} else if ( Psychlops.DistanceWatcher.distance > arg2) {
		return 1;
	} else {
		return 0;
	}
}




Psychlops.ExperimentalMethods = function () {
}
Psychlops.ExperimentalMethods.prototype = {
	before: new Psychlops.Clock()
	, after: new Psychlops.Clock()
	, exam_start: new Psychlops.Clock()
	, exam_end: new Psychlops.Clock()

	, nextTrial: function () {
		after.update();
		if (before.at_msec() != 0) { this.writeIntervalBetweenTrials(after.at_msec() - before.at_msec()); }
		this.setNextConditions();
		before.update();
	}
	, setNextConditions: function () { return false; }
	, writeIntervalBetweenTrials: function (num) { }

	, getTotalTime: function () { return (this.exam_end.at_msec() - this.exam_start.at_msec()) / 1000; }
	, getRT: function () { return (after.at_msec() - before.at_msec()) / 1000; }
}

Psychlops.ExperimentalMethods.Constant = function () {
	var TRIAL_NUM;
	this.progress = -1;
	this.iteration = 1;
	this.independent_vars = [];
	this.dependent_vars = [];
	this.conditions = [];
	this.intervalBetweenTrials = [];

	this.appendIndependent = function (closure_getter, closure_setter, name_, levels_) {
		this.independent_vars.push({ get: closure_getter, set: closure_setter, name: name_, levels: levels_, results:null });
	}
	this.appendDependent = function (closure_getter, closure_setter, name_) {
		this.dependent_vars.push({ get: closure_getter, set: closure_setter, name: name_, results: null});
	}
	this.initialize = function () {
		var nlevel = [];
		TRIAL_NUM = this.iteration;
		for (var i = 0; i < this.independent_vars.length; i++) {
			TRIAL_NUM *= this.independent_vars[i].levels.length;
		}

		this.conditions = new Array(TRIAL_NUM);
		for (var i = 0; i < this.conditions.length; i++) { this.conditions[i] = i; }
		Psychlops.Math.shuffle(this.conditions, TRIAL_NUM);

		for (var i = 0; i < this.dependent_vars.length; i++) { this.dependent_vars[i].results = new Array(TRIAL_NUM); }
		for (var i = 0; i < this.independent_vars.length; i++) { this.independent_vars[i].results = new Array(TRIAL_NUM); }

		this.exam_start.update();
	}
	this.setNextConditions = function () {
		if (this.progress >= 0) {
			for (var i = 0; i < this.dependent_vars.length; i++) {
				this.dependent_vars[i].results[this.progress] = this.dependent_vars[i].get();
			}
		}
		
		this.progress++;
		if (this.progress >= TRIAL_NUM) return false;

		var cond = this.conditions[this.progress];
		var last = cond;
		for (var i = 0; i < this.independent_vars.length; i++) {
			var ind_c = last % this.independent_vars[i].levels.length;
			var val = this.independent_vars[i].levels[ind_c];
			this.independent_vars[i].set(val);
			this.independent_vars[i].results[this.progress] = val;
			last = Math.floor(last / this.independent_vars[i].levels.length);
		}

		return true;
	}
	this.writeIntervalBetweenTrials = function (num) {
		intervalBetweenTrials[this.progress] = num;
	}
	this.getTotalTrials = function () {
		return TRIAL_NUM;
	}
	this.saveResultsFile = function (filename, header_) {
		this.exam_end.update();
		var header = "";
		var arr = [];
		for (var i = 0; i < this.independent_vars.length; i++) {
			header += this.independent_vars[i].name + Psychlops.Data.delimiter;
			arr.push(this.independent_vars[i].results);
		}
		for (var i = 0; i < this.dependent_vars.length; i++) {
			header += this.dependent_vars[i].name + Psychlops.Data.delimiter;
			arr.push(this.dependent_vars[i].results);
		}
		var text = "exp," + Psychlops.AppInfo.expname + "\r\nparticipant," + Psychlops.AppInfo.participant_name + "\r\nElapsed," + this.getTotalTime() + "\r\n" + header_ + "\r\n----\r\n" + header + "\r\n";
		for (var i = 0; i < TRIAL_NUM; i += 1) {
			for (var j = 0; j < this.independent_vars.length; j++) {
				text += this.independent_vars[j].results[i] + Psychlops.Data.delimiter;
			}
			for (var j = 0; j < this.dependent_vars.length; j++) {
				text += this.dependent_vars[j].results[i] + Psychlops.Data.delimiter;
			}
			text += "\r\n";
		}
		Psychlops.Data.savearrayText = text;

		Psychlops.File.saveText(text, filename);

		if (Psychlops.Data.savearrayCallback) {
			Psychlops.Data.savearrayCallback(text, filename);
		}
	}
}
Psychlops.ExperimentalMethods.Constant.prototype = new Psychlops.ExperimentalMethods();