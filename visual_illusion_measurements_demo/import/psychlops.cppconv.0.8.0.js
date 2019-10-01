
Psychlops.CodeConverter = new Object();
Psychlops.CodeConverter.Cpp = new Object();
Psychlops.CodeConverter.DECLARE_REPLACE = "var ";

Psychlops.CodeConverter.checkWatchMode = function () {
	"use strict";
	if(typeof Psychlops === "object"
		&& typeof Psychlops.Variables === "object"
		&& Psychlops.Variables.debugMode == true)
	{
		return true;
	} else {
		return false;
	}
}

Psychlops.CodeConverter.Cpp.convertToJS = function (cppcode, version) {
	"use strict";
	var isYieldable = (version != Psychlops.Util.EnvironmentVersion.Env2013);
	var watchMode = Psychlops.CodeConverter.checkWatchMode();

	var watcher_str = "";
	var makeWatcher = function (name) {
		"use strict";
		//return 'Psychlops.Variable.watch("'+name+'", new Psychlops.Variable(eval("function(){ return '+name+'; }"),eval("function(val) {'+name+' = val; }"),"'+name+'",null,1,1));\r\n';
		return 'Psychlops.Variables.watchList["'+name+'"] = new Psychlops.Variable(function(){ return '+name+'; },function(val) {'+name+' = val; },"'+name+'",null,1,1);\r\nPsychlops.Variables.watchListName.push("'+name+'");\r\n';
	}
	
	var statement_delimiter = "([;\\{\\}]\\s*)";
	var rangedSplit = function (oldcode) {
		"use strict";
		var stack = [0], result = [], current = "";
		var char, mode = 0;
		for(var i=0; i<oldcode.length; i++) {
			char = oldcode.charAt(i);
			switch(mode) {
			case 0:
				if(char==",") { result.push(current); i+=1; current=""; }
				else if(char=="(") { mode=1; stack.push(mode); current += char; }
				else if(char=="{") { mode=2; stack.push(mode); current += char; }
				else { current += char; }
				break;
			case 1:
				if(char==")") { current += char; stack.pop(); mode = stack[stack.length-1]; }
				else if(char=="(") { mode=1; stack.push(mode); current += char; }
				else if(char=="{") { mode=2; stack.push(mode); current += char; }
				else { current += char; }
				break;
			case 2:
				if(char=="}") { current += char; stack.pop(); mode = stack[stack.length-1]; }
				else if(char=="(") { mode=1; stack.push(mode); current += char; }
				else if(char=="{") { mode=2; stack.push(mode); current += char; }
				else { current += char; }
				break;
			}
		}
		result.push(current);
		return result;
	}
	
	var convertClasses = function (oldcode, ClassName) {
		"use strict";
		var newClassName = ClassName.replace("::", ".");
		var code = oldcode;
		// replace namespace
		code = code.replace(new RegExp("Psychlops::" + ClassName, "g"), ClassName);
		// replace static constructor
		code = code.replace(new RegExp("\\(\\s*" + ClassName + "\\s*(\\(.*\\))", "g"), "((new Psychlops." + newClassName + "$1)");
		code = code.replace(new RegExp("=\\s*" + ClassName + "\\s*(\\(.*\\))", "g"), "=(new Psychlops." + newClassName + "$1)");
		// add namespace
		code = code.replace(new RegExp(ClassName + "::(\\w+)", "g"), "Psychlops." + newClassName + ".$1");
		// remove static cast
		var reg_cast = new RegExp("\\(\\s*" + ClassName + "\\s*\\)", "g");
		code = code.replace(reg_cast, "");
		
		// replace declaration
		var reg_declaration = new RegExp(statement_delimiter + ClassName + "\\s+([^;]+)(?=;)", "g");
		var reg_constructor = new RegExp("\\s*(\\w+)\\s*(\\(.*\\))?\\s*");
		var reg_substitute = new RegExp("\\s*(\\w+)(\\s*=.+)\\s*");
		var reg_array = new RegExp("\\s*(\\w+)\\s*\\[\\s*(.+)\\s*\\]\\s*");
		var reg_array2 = new RegExp("\\s*(\\w+)\\s*\\[(.+)\\]\\[(.+)\\]\\s*");
		var reg_array3 = new RegExp("\\s*(\\w+)\\s*\\[(.+)\\]\\[(.+)\\]\\[(.+)\\]\\s*");
		var reg_array_ini = new RegExp("\\s*(\\w+)\\s*\\[\\s*(.+)\\s*\\]\\s*=\\s*\\{\\s*(.+)\\s*\\}\\s*");


		code = code.replace(reg_declaration, function (match, p1, p2, offset, string) {
			var result = null;
			var ret = p1 + "var ";
			//result = reg_array_ini.exec(p2);  //provisional
			//if(result!=null) { ret += result[1] + "=[" + result[3] + "]"; return ret; } //provisional
			//var vars = p2.split(",");  //provisional
			var vars = rangedSplit(p2);
			for(var i=0; i<vars.length; i++) {
				if(i>0) { ret += ","; }
				result = reg_constructor.exec(vars[i]);
				if(result.input.length == result[0].length ) {
					ret += result[1] + " = new Psychlops." + newClassName;
					if(result[2]) { ret += result[2]; }
					else { ret += "()"; }
					continue;
				}
				else {
					result = reg_substitute.exec(vars[i]);
					if(result != null) { ret += result.input; continue; }
					else {
						result = reg_array_ini.exec(vars[i]);
						if(result != null) {
							ret += result[1] + "=[" + result[3] + "]";
							continue;
						}
						result = reg_array3.exec(vars[i]);
						if (result != null) {
							ret += result[1] + "= (function(){var _TMP_=[];for(var i=0;i<" + result[2] + ";i+=1){_TMP_.push([]); for(var j=0;j<" + result[3] + ";j+=1){_TMP_[i].push([]); for(var _k=0;_k<" + result[4] + ";_k+=1){_TMP_[i][j].push(new Psychlops." + newClassName + "());}}}return _TMP_;})()";
							continue;
						}
						result = reg_array2.exec(vars[i]);
						if (result != null) {
							ret += result[1] + "= (function(){var _TMP_=[];for(var i=0;i<" + result[2] + ";i+=1){_TMP_.push([]); for(var j=0;j<" + result[3] + ";j+=1){_TMP_[i].push(new Psychlops." + newClassName + "());}}return _TMP_;})()";
							continue;
						}
						result = reg_array.exec(vars[i]);
						if(result != null) {
							ret += result[1] + "= (function(){var _TMP_=[];for(var i=0;i<" + result[2] + ";i+=1){_TMP_.push(new Psychlops." + newClassName + "());}return _TMP_;})()";
							continue;
						}
					}
					alert("コンバータエラー（クラス宣言）：制作者にご連絡願います。");
				}
			}
			return ret;
		});
		return code;
	}
	
	var convertNumerics = function (oldcode, typename) {
		"use strict";
		var code = oldcode;
		// remove static cast
		var reg_cast = new RegExp("\\(\\s*" + typename + "\\s*\\)", "g");
		code = code.replace(reg_cast, "");
		// replace declaration in for statement
		var reg_for = new RegExp(statement_delimiter + "for\\s*\\(\\s*" + typename + "\\s*([^;]+)\\s*=\\s*([^;]+)\\s*;", "g");
		code = code.replace(reg_for, "$1for(var $2=$3;");
		
		// replace declaration
		var reg_declaration = new RegExp(statement_delimiter + typename + "\\s+([^;]+)(?=;)", "g");
		var reg_normal = new RegExp("\\s*(\\w+)(\\s*=.+)?\\s*");
		var reg_array = new RegExp("\\s*(\\w+)\\s*\\[\\s*(.+)\\s*\\]\\s*");
		var reg_array2 = new RegExp("\\s*(\\w+)\\s*\\[(.+?)\\]\\[(.+?)\\]\\s*");
		var reg_array3 = new RegExp("\\s*(\\w+)\\s*\\[(.+?)\\]\\[(.+?)\\]\\[(.+?)\\]\\s*");
		var reg_array_ini = new RegExp("\\s*(\\w+)\\s*\\[\\s*(.+)\\s*\\]\\s*=\\s*\\{\\s*(.+)\\s*\\}\\s*");
		code = code.replace(reg_declaration, function (match, p1, p2, offset, string) {

			var result = null;
			var ret = p1 + "var ";
			//result = reg_array_ini.exec(p2);  //provisional
			//if(result!=null) { ret += result[1] + "=[" + result[3] + "]"; return ret; } //provisional
			//var vars = p2.split(",");  //provisional
			var vars = rangedSplit(p2);
			for(var i=0; i<vars.length; i++) {
				if(i>0) { ret += ","; }
				result = reg_normal.exec(vars[i]);
				if(result.input.length == result[0].length ) {
					ret += result.input;
					if(watchMode == true) { watcher_str += makeWatcher(result[1]); }
					continue;
				}
				else {
					result = reg_array_ini.exec(vars[i]);
					if(result != null) {
						ret += result[1] + "=[" + result[3] + "]";
						continue;
					}
					result = reg_array3.exec(vars[i]);
					if (result != null) {
						ret += result[1] + "= (function(){var _TMP_=[];for(var i=0;i<" + result[2] + ";i+=1){_TMP_.push([]); for(var j=0;j<" + result[3] + ";j+=1){_TMP_[i].push([]); for(var _k=0;_k<" + result[4] + ";_k+=1){_TMP_[i][j].push(0);}}}return _TMP_;})()";
						continue;
					}
					result = reg_array2.exec(vars[i]);
					if (result != null) {
						ret += result[1] + "= (function(){var _TMP_=[];for(var i=0;i<" + result[2] + ";i+=1){_TMP_.push([]); for(var j=0;j<" + result[3] + ";j+=1){_TMP_[i].push(0);}}return _TMP_;})()";
						continue;
					}
					result = reg_array.exec(vars[i]);
					if(result != null) {
						ret += result[1] + "=new Array(" + result[2] + ")";
						continue;
					}
				}
				alert("コンバータエラー（数値型宣言） " + typename + " ：制作者にご連絡願います。");
			}
			return ret;
		});
		return code;
	}
	var jscode = ";" + cppcode;



	var regfullscreen = new RegExp('Canvas::fullscreen');
	if (regfullscreen.test(jscode)) {
		Psychlops.Util.requireFullscreen = true;
	} else {
		Psychlops.Util.requireFullscreen = false;
	}

jscode = jscode.replace(
	"Psychlops::Ellipse stimA1[independent_var1_step_number][peri_circle_number];",
	"var stimA1 = new Array(independent_var1_step_number); for(var i=0; i<independent_var1_step_number; i++) { stimA1[i]=new Array(peri_circle_number); for(var j=0; j<peri_circle_number; j++) {stimA1[i][j]=Psychlops::Ellipse();} }"
);
jscode = jscode.replace(
	"int stimA1_Xposition[independent_var1_step_number][peri_circle_number], stimA1_Yposition[independent_var1_step_number][peri_circle_number];",
	"var stimA1_Xposition = new Array(independent_var1_step_number); for(var i=0; i<independent_var1_step_number; i++) { stimA1_Xposition[i]=new Array(peri_circle_number); for(var j=0; j<peri_circle_number; j++) {stimA1_Xposition[i][j]=0;} }"
	+ ";\r\nvar stimA1_Yposition = new Array(independent_var1_step_number); for(var i=0; i<independent_var1_step_number; i++) { stimA1_Yposition[i]=new Array(peri_circle_number); for(var j=0; j<peri_circle_number; j++) {stimA1_Yposition[i][j]=0;} }"
);
	
    //// replace math

	jscode = jscode.replace(/([^\w\.])exit\(/g, "$1Psychlops.Util.exit(");

	jscode = jscode.replace(/([^\w\.])abs\(/g, "$1Math.abs(");
	jscode = jscode.replace(/([^\w\.])sin\(/g, "$1Math.sin(");
	jscode = jscode.replace(/([^\w\.])cos\(/g, "$1Math.cos(");
	jscode = jscode.replace(/([^\w\.])sqrt\(/g, "$1Math.sqrt(");
	jscode = jscode.replace(/([^\w\.])floor\(/g, "$1Math.floor(");
	jscode = jscode.replace(/([^\w\.])ceil\(/g, "$1Math.ceil(");
	jscode = jscode.replace(/([^\w\.])fmod\(/g, "$1Psychlops.Math.fmod(");
	jscode = jscode.replace(/([^\w\.])PI/g, "$1Math.PI");
	jscode = jscode.replace(/([^\w\.])atan\(/g, "$1Math.atan(");
	jscode = jscode.replace(/([^\w\.])atan2\(/g, "$1Math.atan2(");
    jscode = jscode.replace(/([^\w\.])pow\(/g, "$1Math.pow(");
    jscode = jscode.replace(/Psychlops::random/g, "Psychlops.random");
    jscode = jscode.replace(/([^\w\.])atoi\(/g, "$1Psychlops.Util.atoi(");
    jscode = jscode.replace(/([^\w\.])atof\(/g, "$1Psychlops.Util.atof(");

jscode = jscode.replace(/\*\*\*\*\//g, "****/;");
jscode = jscode.replace(/\/\/.*/g, "");


	//// replace flip
	var yield_str = ";"
	if (isYieldable) {
		//yield_str = "yield * $&;"
		yield_str = "yield $&;"
		if (watchMode == true) { yield_str += "Psychlops.Variables.debugCallback();" }
	}

	jscode = jscode.replace(/Display::flip\s*\(.*\)/g, yield_str);
	jscode = jscode.replace(/\w+\.flip\s*\(.*\)/g, yield_str);

	//jscode = jscode.replace(/cnvs.flip\s*\(.*\)/g, "yield* " + "$&");
	//jscode = jscode.replace(/display.flip\s*\(.*\)/g, yield_str);
	
	//// replace declaration
jscode = jscode.replace(/Figures::Cross/g, "Rectangle");
//jscode = jscode.replace(/Widgets::Slider/g, "Slider");
//jscode = jscode.replace(/\s*Display::.*;/g, " ");

jscode = jscode.replace(/^#\w+/g, ";");

jscode = convertClasses(jscode, "Point");

var numerics_arr = ["auto", "unsigned char", "const char", "char", "const unsigned int", "const int", "unsigned int", "int", "size_t", "float", "double", "bool"];
	for (var i = 0; i < numerics_arr.length; i++) { jscode = convertNumerics(jscode, numerics_arr[i]); }
	
jscode = jscode.replace(/\s+double\s+/g, "var ");
jscode = jscode.replace(/\s+const int\s+/g, "var ");
jscode = jscode.replace(/\s+int\s+/g, "var ");

	
	var classes_arr = [
		"Math", "Interval", 
		"Color", "Stroke",
		"Canvas::Geometry", "Canvas", "Display", "Clock", "Data", 
		"Line", "Rectangle", "Ellipse", "Polygon",
		"Image", "Movie", "Font", "Letters",
        "Input", "Keyboard", "Mouse",
        "Audio",
		"Widgets::Button", "Widgets::Slider", "Widgets::Dial", "Widgets::ProgressBar", "Widgets::Theme",
		"Shader", "Figures::ShaderField", "Figures::ShaderImage", "Figures::Grating", "Figures::ShaderGaussianDot", "Figures::ShaderDoG", "Figures::ShaderGabor", "Figures::ShaderGaborAlpha", "Figures::ShaderPlaid",
		"AppState", "AppInfo", "Util", "DistanceWatcher",
		"ExperimentalMethods::Constant", "ExperimentalMethods"
	];
	for (var i = 0; i < classes_arr.length; i++) { jscode = convertClasses(jscode, classes_arr[i]); }
			
	// init
	jscode = jscode.replace(/#include <psychlops\.h>/g, ";");
	jscode = jscode.replace(/using namespace Psychlops;/g, ";");
	jscode = jscode.replace(/void\s+psychlops_main\s*\(\s*\)\s*{/g, 'function * psychlops_main(){\r\n"use strict";\r\n' + watcher_str);

	var reg = new RegExp("Slider (\\w+)\\((\\w+)\\x2C([^;]*)\\)", "g");
	var rep = "var $1 = new Psychlops.Slider(function(){return $2;},function(v) {$2=v;},$3);";
	jscode = jscode.replace(reg, rep);


	var reg_quote = new RegExp('([\\,\\(]\\s*)L\\"', "g");
	jscode = jscode.replace(reg_quote, "$1\"");

	var reg_interval = /\(\s*(.+)\s*,(.+),([^<=,]+)([<= ]+)rng([<= ]+)([^<=,]+)(,?.*\))/g;
	jscode = jscode.replace(reg_interval, function (match, p1, p2, p3, p4, p5, p6, p7) { return "(function(){return " + p1 + ";}, function(s){" + p1 + "=s;}, " + p2 + ", new Psychlops.Interval(" + p3 + ", \"" + p4 + "\", " + p6 + ", \"" + p5 + "\") " + p7; });

	var reg_appendIndependent = new RegExp('appendIndependent\\s*\\((\\w+),([^.]+)\\)', "g");
	var rep = "appendIndependent(function(){return $1;},function(v) {$1=v;},$2);";
	jscode = jscode.replace(reg_appendIndependent, rep);

	var reg_appendIndependent = new RegExp('appendDependent\\s*\\((\\w+),([^.]+)\\)', "g");
	var rep = "appendDependent(function(){return $1;},function(v) {$1=v;},$2);";
	jscode = jscode.replace(reg_appendIndependent, rep);

	reg = new RegExp("([\\w\\.]+)(\\x3C\\x3D?)(rng)(\\x3C\\x3D?)([\\w\\.]+)", "g");
	rep = "new Psychlops.Interval($1, '$2', $5, '$4')";
	jscode = jscode.replace(reg, rep);

	var regstaticimgload = /Psychlops\.Image\.load\((.+),(.+),(.+),(.+)\);/g;
	jscode = jscode.replace(regstaticimgload, function (match, p1, p2, p3, p4, offset, string) {
		var regstaticimgloadreplace = "";
		var range_begin = Number(p3);
		var range_end = Number(p4);
		for (var i = 0; i <= range_end - range_begin; i++) {
			regstaticimgloadreplace += sprintf("%s[" + i + "].load(" + p2 + ");\r\n", p1, i + range_begin);
		}
		return regstaticimgloadreplace;
	});

	var regimgload = /([\w\[\]\(\)\.]+\.load\(.+\));/g;
	if (isYieldable) {
		jscode = jscode.replace(regimgload, "while($1){yield;}");
	}
	
	var imgload = [];
	regimgload = new RegExp('\\(\\s*\\"(.+\\.jpg)\\"\\s*\\)', "g");
	while ((imgload = regimgload.exec(jscode)) != null) {
		if (imgload != null && imgload.length > 0) {
			for (var i = 0; i < imgload.length; i += 1) {
				if (imgload[i].indexOf("\"") < 0) {
					if (typeof Psychlops.Image._STORE_[imgload[i]] == "undefined") {
						Psychlops.Image._LOADED_ARRAY_.push(imgload[i]);
					}
				}
			}
		}
	}
	regimgload = new RegExp('\\(\\s*\\"(.+\\.png)\\"\\s*\\)', "g");
	while ((imgload = regimgload.exec(jscode)) != null) {
		if (imgload != null && imgload.length > 0) {
			for (var i = 0; i < imgload.length; i += 1) {
				if (imgload[i].indexOf("\"") < 0) {
					if (typeof Psychlops.Image._STORE_[imgload[i]] == "undefined") {
						Psychlops.Image._LOADED_ARRAY_.push(imgload[i]);
					}
				}
			}
		}
	}


	var reg_sprintf = new RegExp('\\s+sprintf\\s*\\(\\s*([^,]+)\\s*,(.+)\\)\\s*;', "g");
	jscode = jscode.replace(reg_sprintf, "$1 = sprintf($2);");

	//jscode = jscode.replace(/\s*std::cout.*;/g, " ");
	var reg_stdcout = new RegExp('std::cout\\s*<<(.*);', "g");
	jscode = jscode.replace(reg_stdcout, function (match, p1, offset, string) {
		var astr = p1;
		astr = astr.replace("<<", '+')
		astr = astr.replace("std::endl", '"\\r\\n"')
		var ret = "Psychlops.Util.log(" + astr + ");";
		return ret;
	});
	
	return jscode;
};


Psychlops.CodeConverter.compileInFlowCallbacks = function (cpp_source, debug_switch) {
	"use strict";
	var str = {};
	var segments = [];

	var REG_SEG_LABEL = ["BEGIN", "END", "BEGIN", "SOLO"];
	var REG_SEG = [/\s*\/\/\s*\[\s*begin\s+(\w+)\s*\]/g, /\}\s*\/\/\s*\[\s*end\s+(\w+)\s*\]/g, /\svoid\s+(psychlops_main)\s*\(.*\)\s*\{/g];
	var REG_WHILE = /^\s+while\s*\((.*)\)\s*\{/;
	var REG_FOR = /^\s+for\s*\(\s*int\s+(.*);(.*);(.*)\)\s*\{/;

	var outer_dec = "";
	var reg = null;
	var segment = {};
	var next = 0;
	var next_label = "";
	var break_label = "";
	for (var i = 0; i < 3; i++) {
		while ((reg = REG_SEG[i].exec(cpp_source)) !== null) {
			segment = {
				"type": i,
				"label": reg[1],
				"label2": reg[1] + "_" + REG_SEG_LABEL[i],
				"init": "",
				"firstIndex": reg.index,
				"lastIndex": REG_SEG[i].lastIndex
			}
			segments.push(segment);
		}
	}
	segments = segments.sort(function (a, b) { if (a.firstIndex < b.firstIndex) return -1; else if (a.firstIndex > b.firstIndex) return 1; else return 0; });
	var last_bracket = cpp_source.lastIndexOf("}");
	var cpp_source_ = cpp_source.substring(0, last_bracket);
	segments.push({ "type": 3, "label": "psychlops_main", "label2": "psychlops_main_END", "firstIndex": last_bracket + 1, "lastIndex": last_bracket + 2 });
	segments.unshift({ "type": -1, "label": "__PRE__", "label2": "__PRE__", "firstIndex": 0, "lastIndex": 0 });

	var break_stack = [];
	var for_stack = [];
	for (var i = 0; i < segments.length - 1; i++) {
		if (segments[i].type == 0) {
			break_stack.push(segments[i].label);
			if (segments[i].label == segments[i + 1].label) {
				next_label = segments[i].label2;
				break_label = break_stack[break_stack.length - 1] + "_END";
			} else {
				next_label = segments[i + 1].label2;
				break_label = break_stack[break_stack.length - 1] + "_END";
			}
		} else if (segments[i].type == 1) {
			break_stack.pop();
			if (segments[i + 1].type == 0) {
				next_label = segments[i + 1].label2;
				break_label = break_stack[break_stack.length - 1] + "_END";
			} else {
				if (break_stack.length==0) {
					break_label = "";
					next_label = "psychlops_main_END";
				} else {
					next_label = break_stack[break_stack.length - 1] + "_BEGIN";
					break_label = break_stack[break_stack.length - 1] + "_END";
				}
			}
		} else {
			next_label = segments[i+1].label2;
			break_label = "";
		}
		segments[i].source = cpp_source_.substring(segments[i].lastIndex, segments[i + 1].firstIndex).replace(/break;\/\/endloop/g, "return '" + break_label + "';");
		if (segments[i].type == 0) {
			if (reg = REG_WHILE.exec(segments[i].source)) {
				segments[i].source = segments[i].source.replace(REG_WHILE, "if($1){}else{ return '" + break_label + "'; }");
			} else if (reg = REG_FOR.exec(segments[i].source)) {
				next_label += "_INITIALIZED"
				outer_dec += ("var " + reg[1] + ";\r\n");
				segments[i].init = "\r\n" + reg[1] + ";\r\ncase '" + next_label + "':\r\n";
				var tmp = reg[3];
				segments[i].source = segments[i].source.replace(REG_FOR, "\r\nif($2){}else{ return '" + break_label + "'; }");
				if (segments[i].label == segments[i + 1].label) {
					segments[i].source += "\r\n" + tmp + ";\r\n";
				} else {
					for (var j = i + 1; j < segments.length; j++) {
						if (segments[j].label == segments[i].label) { for_stack[segments[j - 1].label2] = ("\r\n" + tmp + ";\r\n"); break; }
					}
				}
			}
		}
		if (i > 1) {
			if (segments[i].label2 in for_stack) {
				segments[i].source += for_stack[segments[i].label2];
			}
			segments[i].source += "\r\nreturn '" + next_label + "';\r\n";
		}
	}
	//return segments;
	var source = "";
	source += segments[0].source;
	source += outer_dec;
	source += segments[1].source;
	if (segments.length >= 2) {
		source += "\r\nPsychlops.Util.currentFlow = '" + segments[2].label2 + "';\r\n\r\nfunction psychlops_internal_main(_FLOW_CODE_) {\r\nswitch(_FLOW_CODE_) {\r\n";
		for (var i = 2; i < segments.length - 1; i++) {
			source += "\r\ncase '" + segments[i].label2 + "':\r\n\r\n";
			if (segments[i].init != "") { source += segments[i].init; }
			source += segments[i].source;
		}
		source += "\r\ncase 'psychlops_main_END':\r\nreturn 'psychlops_main_END';\r\n}";
	}
	if ( segments.length<= 3) { Psychlops.Util._warning = "This program may not be configured for Internet Explorer / Safari."; }
	else { Psychlops.Util._warning = ""; }
	return source;
};

Psychlops.CodeConverter.compile = function (cpp_source, debug_switch) {
	"use strict";
	var version = Psychlops.Util.getEnvironmentVersion();
	var func = null;

	Psychlops.Image._LOADEING_ = 0;
	Psychlops.Image._LOADED_ = 0;
	Psychlops.Image._LOADED_ARRAY_ = [];
	if (arguments.length == 2) {
		var flag = null;
		if ((flag = document.getElementById(debug_switch)) != null) {
			flag = document.getElementById(debug_switch).checked;
			if (flag != null && (flag == true || flag == false)) {
				Psychlops.Variables.debugMode = flag;
			} else {
				Psychlops.Variables.debugMode = false;
			}
		}
	}

	if (version == Psychlops.Util.EnvironmentVersion.Latest) {
		func = Psychlops.CodeConverter.Cpp.convertToJS(cpp_source, version);
		func += "\r\n;\r\nPsychlops.draw_loop = psychlops_main();"
		Psychlops.Image._LOAD_();
		return func;
	} else if (version == Psychlops.Util.EnvironmentVersion.Env2013) {
		Psychlops.Util.currentFlow = "__PRE__";
		func = Psychlops.CodeConverter.compileInFlowCallbacks(cpp_source);
		func += "\r\n;}\r\nPsychlops.draw_loop = psychlops_internal_main;"
		func = Psychlops.CodeConverter.Cpp.convertToJS(func, version);
		Psychlops.Image._LOAD_();
		return func;
	} else {
	}
};

convertCppToJS = Psychlops.CodeConverter.Cpp.convertToJS;