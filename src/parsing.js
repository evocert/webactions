!(function(name,context,definition){if(typeof exports==='object'){module.exports=definition(require);}else if(typeof define==='function'&&define.amd){define(definition); }else{context[name]=definition();}
}).call(this,'parseActivePassive',this,function(require){
	var $=(typeof require==='function')?require('./jquery'):window.$;//dep
	
    function parseActivePassive(prsng,unparsedcontent){
	    if (typeof prsng.startParsing === "function") {
		    prsng.startParsing();
	    }

	    var passive="";
        var unsprsdln=0;
	    var canprintout=typeof prsng.print === "function";
	    var owner=typeof prsng.owner === "object" ? prsng.owner:null;
	    var print=function(prntthis) {
            if (canprintout && typeof prntthis === "string" && prntthis!=="") {
                passive+=prntthis;
            }       
	    }
        var altFlushPassive=typeof prsng.flushpassive === "function"?prsng.flushpassive:null
        var altFlushPassiveResult=null;
        var altFlushActive=typeof prsng.flushactive === "function"?prsng.flushactive:null
        var altFlushActiveResult=null;
        var altEvalActive=typeof prsng.evalactive === "function"?prsng.evalactive:null
        var stillvalid=true;

	    function iterateString(prsgn,stringtoiterate,functoprsr) {
            if (stillvalid && stringtoiterate!=null) {
                if (typeof stringtoiterate === "function") {
                    var tmpstringtoiterate=null;
                    while(stillvalid){
                        if((tmpstringtoiterate=stringtoiterate())!=null && typeof tmpstringtoiterate === "string") {
                            for(var i=0;i<tmpstringtoiterate.length;i++) {
                                functoprsr(prsgn,tmpstringtoiterate[i]);
                                unsprsdln++
                                if (!stillvalid) break;
                            }
                        } else {
                            break;
                        }
                    }
                } else if (typeof stringtoiterate==="string" && typeof functoprsr === "function") {
                    for(var i=0;i<stringtoiterate.length;i++) {
                        functoprsr(prsgn,stringtoiterate[i]);
                        unsprsdln++
                        if (!stillvalid) break;
                    }
                }
            }
	    }

	    var foundCode=false;
	    var hasCode=false;
	    var tmppassive="";
	    var tmpcode="";
	    var code="";
	    var prvc="";
	    var begi=0;
	    var endi=0;
	    var content=[];

	    if (typeof prsng.beglbl!=="string") {
		    prsng["beglbl"]="[@";
	    }

	    if (typeof prsng.endlbl!=="string") {
		    prsng["endlbl"]="@]";
	    }

	    function flushPassive(prsng){
            if (tmppassive!="") {
                if (altFlushPassive!=null && typeof altFlushPassive === "function") {
                    if((altFlushPassiveResult=altFlushPassive(tmppassive,unsprsdln))!=null && typeof altFlushPassiveResult ==="boolean" && altFlushPassiveResult===false){
                        stillvalid=false;
                    }
                } else { 
                    if(foundCode) {
                        if (tmppassive.length>1 && tmppassive.startsWith("`") && tmppassive.endsWith("`")) {
                            tmpcode+="print("+tmppassive+");";                    
                        } else {
                            var cntntl=content.push(tmppassive+"");
                            tmpcode+="print(content["+(cntntl-1)+"]);";
                        }                
                    } else {
                        print(tmppassive)
                    }
                }
                tmppassive="";
            }
	    }

	    function parsePsvChar(prsng,chr) {
            flushCode(prsng);
            tmppassive+=chr;
	    }

	    function parseCodeChar(prsng,chr) {
            if(!hasCode) {
                if ((chr+"").trim()!=="") {
                hasCode=true;
                }
            }
            if (hasCode) {
                flushPassive(prsng)
                if (!foundCode) {
                foundCode=true;
                }
                tmpcode+=chr;
            }
	    }

	    function flushCode(prsgn){
            if(tmpcode!="") {
                if (altFlushActive!=null && typeof altFlushActive === "function") {
                    if((altFlushActiveResult=altFlushActive(tmppassive,unsprsdln))!=null && typeof altFlushActiveResult ==="boolean" && altFlushActiveResult===false){
                        stillvalid=false;
                    }                    
                } else {
                    code+=tmpcode;
                }
                tmpcode="";
            }
	    }
	    
	    function parsechr(prsng,chr) {
            if (endi==0 && begi<prsng.beglbl.length) {
                if (begi>0 && prsng.beglbl[begi-1]==prvc && prsng.beglbl[begi]!==chr) {
                var bi=begi;
                begi=0;
                iterateString(prsng,prsng.beglbl.substring(0,bi),parsePsvChar);
                }
                if (prsng.beglbl[begi]===chr) {
                begi++;
                if (begi===prsng.beglbl.length){
                    prvc="";
                    prvc="";
                } else {
                    prvc=chr;
                }
                } else {
                if (begi>0) {
                    var bi=begi;
                    begi=0;
                    iterateString(prsng,prsng.beglbl.substring(0,bi),parsePsvChar);
                }
                parsePsvChar(prsng, prvc=chr);
                }
            } else if (begi==prsng.beglbl.length && endi<prsng.endlbl.length) {
                if (prsng.endlbl[endi]===chr) {
                    endi++;
                        if (endi===prsng.endlbl.length){
                            begi=0;
                            endi=0;
                            prvc="";
                        }
                } else {
                    if (endi>0) {
                        var bi=endi;
                        endi=0;
                        iterateString(prsng,prsng.endlbl.substring(0,bi),parseCodeChar);
                    }
                    parseCodeChar(prsng, chr);
                }
            }
        }

	    iterateString(prsng,unparsedcontent,parsechr);
	    
	    flushPassive(prsng); 
	    flushCode(prsng);
	    if (foundCode && code!="") {
            if (altEvalActive!=null && typeof altEvalActive === "function") {
                altEvalActive(code);
            } else {
		        eval(code);
            }
	    }         

	    if (passive!=="") {
            if (canprintout){
                prsng.print(passive);
            }
	    }

	    if (typeof prsng.endParsing === "function") {
		    prsng.endParsing();
	    }
	}
	return parseActivePassive;
});