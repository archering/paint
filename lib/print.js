/***
** 具体的绘图程序
**/

function Paint(){
    var fs = require("fs"),
		os = require("os"),
        path = require("path");
    var index = 0;
	var MAX = 60;
	var STRMAX = 10;
	if(process.env.MSYSTEM || os.platform().indexOf("win")==-1){
		var vet = "│";
		var hor = "──";
	}else{
		vet = "┊";
		hor = "┈┈";
	}
	function space(n,s){
        if(n<-1) n=-1;
		s = s || " ";
        return new Array(n+1).join(s);		
	}
	
	function ellipsis(str,max){
		var max = max || MAX;
		if(str.length>max){
			return str.substring(0,max-3) + "..";
		}
		return str;
	}
	//专门处理 路径超长的问题
	function ellipsis2(path,max){
		var max = max || MAX;
		if(path.length>MAX){
			var arr = path.split(/\\|\//i);
		  	var pa = arr.map(function(item){
				return ellipsis(item,Math.ceil(MAX/arr.length)+1);//
			}).join('\\');
			return pa;
		  }
		return path;
	}	
	
	
    /***
    **path {String} 目录名  hello/fol1/sub1
    **depth {Integer} 底基层的目录名
    **index {Integer} 这一层的第几个 
    **arr {} 这一层的所有目录数组  【"lib","src"】
    **/
    function stroke(pat,tag){
        pat = path.normalize(pat);	
		var pat2 = pat.replace(path.normalize(global.base),"").replace(/^\\|^\//,"");
        var arr = pat2.split(/\\|\//);
        var len = arr.length;//第几层的菜单
        var name = arr[len-1];//目录名  
        var depth = len-1;
        if(depth>0){
            var str = "  ";
            for(var i=0;i<depth-1;i++){
                str += space(i==0?0:4) + vet;
            }
			var sym = tag?"└":"├";
			if(depth>1){
				str += space(4) + sym;
			}else{
				str += space(0) + sym;
			}
			str +=hor + ellipsis(arr[depth],25);
        }else{
            str = space(2)+ ellipsis(name,25);
        }
		pat = ellipsis(pat,50);
        console.log((++index<10?"  "+index:(index<100?" "+index:index)) + "│" +  space(1) + pat + space(MAX-pat.length) + str);
    };
	
    function stroke2(pat){
        pat = path.normalize(pat);	
		pat = pat.replace(path.normalize(global.base),"").replace(/^\\|^\//,"");
        var arr = pat.split("\\");
        var len = arr.length;//第几层的菜单
        var name = arr[len-1];//目录名  
        var depth = len-1;
		pat = ellipsis(pat,80);
        console.log((++index<10?"  "+index:(index<100?" "+index:index)) + "│" +  space(2) + pat);
    };
	
    function stroke3(pat,tag){
        pat = path.normalize(pat);	
		pat = pat.replace(path.normalize(global.base),"").replace(/^\\|^\//,"");	
        var arr = pat.split("\\");
        var len = arr.length;//第几层的菜单
        var name = path.basename(pat);//目录名或者文件名
        var depth = len-1;
        if(depth>0){
            var str = "  ";
            for(var i=0;i<depth-1;i++){
                str += space(i==0?0:4) + vet;
            }
			var sym = tag?"└":"├";
			if(depth>1){
				str += space(4) + sym;
			}else{
				str += space(0) + sym;
			}
			str +=hor + arr[depth];
        }else{
            str = space(2)+ ellipsis(name);
        }
		console.log(str);
    };	

    /***
    **name {String} 项目名
    **pa {String}  父目录名
    **/
    this.draw = factory(stroke);
	
	
	function factory(stroke){
		return function(name,pa){
				var tag = arguments[2]||0;    
				if(pa){
					var pat = pa + "/" +  name;
				}else{
					pat = name;
				}
				try{
					var sta = fs.lstatSync(String(pat));
				}catch(err){
					console.log(err.message);
					process.exit(1);
				}		
				stroke(path.normalize(pat),tag);
				if(pat.match(/^.+\/+lib|node_modules\/|.git\//) && pat.split("/").length>=3) return;
				 if(sta.isDirectory()){
					var nextLayer = fs.readdirSync(pat);
					 for(var j=0;j<nextLayer.length;j++){
						arguments.callee(nextLayer[j],pat,(nextLayer.length==j+1)?1:null);
					 }
				 }
			}
	}
	
	this.doit = function(name,opt){
		if(opt == "-t"){
			var fun = stroke3;
		}else if(opt == "-p"){
			fun = stroke2;
		}else{
			fun = stroke;
		}
		factory(fun)(name);
	}
    
}

module.exports = new Paint();
