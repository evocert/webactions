!(function(name,context,definition){if(typeof exports==='object'){module.exports=definition(require);}else if(typeof define==='function'&&define.amd){define(definition); }else{context[name]=definition();}
}).call(this,'parseActivePassive',this,function(require){
    function parseActivePassive(prsng,unparsedcontent){

        function callprsng(){
            if (typeof prsng==="function") {
                return prsng();
            } 
            return prsng;
        }

	    if (typeof callprsng().startParsing === "function") {
		    callprsng().startParsing();
	    }

        var trimcode=(typeof callprsng().trimactive === "boolean")?callprsng().trimactive:true;

	    var passive="";
        var unsprsdln=-1;
        var psvprsdi=-1;
        var atvprsdi=-1;
	    var canprintout=typeof callprsng().print === "function";
	    var owner=typeof callprsng().owner === "object" ? callprsng().owner:null;
	    var print=function(prntthis) {
            if (canprintout && typeof prntthis === "string" && prntthis!=="") {
                passive+=prntthis;
            }       
	    }
        var altFlushPassive=typeof callprsng().flushpassive === "function"?callprsng().flushpassive:null;
        var altFlushPassiveResult=null;
        var altFlushActive=typeof callprsng().flushactive === "function"?callprsng().flushactive:null;
        var altFlushActiveResult=null;
        var altEvalActive=typeof callprsng().evalactive === "function"?callprsng().evalactive:null;
        var stillvalid=true;

	    function iterateString(prsgn,stringtoiterate,functoprsr) {
            if (stillvalid && stringtoiterate!=null) {
                if (typeof stringtoiterate==="string" && typeof functoprsr === "function") {
                    for(var i=0;i<stringtoiterate.length;i++) {
                        unsprsdln++
                        functoprsr(prsgn,stringtoiterate[i]);
                        if (!stillvalid) break;
                    }
                } else if (typeof stringtoiterate === "function") {
                    var tmpstringtoiterate=null;
                    while(stillvalid){
                        if((tmpstringtoiterate=stringtoiterate())!=null && typeof tmpstringtoiterate === "string") {
                            for(var i=0;i<tmpstringtoiterate.length;i++) {
                                unsprsdln++
                                functoprsr(prsgn,tmpstringtoiterate[i]);
                                if (!stillvalid) break;
                            }
                        } else {
                            break;
                        }
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

	    if (typeof callprsng().beglbl!=="string" && typeof callprsng().beglbl!=="function") {
		    callprsng()["beglbl"]="[@";
	    }

	    if (typeof callprsng().endlbl!=="string" && typeof callprsng().endlbl!=="function") {
		    callprsng()["endlbl"]="@]";
	    }

	    function flushPassive(prsng){
            if (tmppassive!="") {
                if (altFlushPassive!=null && typeof altFlushPassive === "function") {
                    if((altFlushPassiveResult=altFlushPassive(tmppassive,psvprsdi))!=null && typeof altFlushPassiveResult ==="boolean" && altFlushPassiveResult===false){
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
                if (psvprsdi>-1) {
                    psvprsdi=-1;
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
                if (trimcode && (chr+"").trim()!=="") {
                    hasCode=true;
                } else {
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
                    if((altFlushActiveResult=altFlushActive(tmpcode,atvprsdi))!=null && typeof altFlushActiveResult ==="boolean" && altFlushActiveResult===false){
                        stillvalid=false;
                    }                    
                } else {
                    code+=tmpcode;
                }
                if(atvprsdi>-1) {
                    atvprsdi=-1;
                }
                tmpcode="";
            }
	    }

        function beglbl(prsng) {
            if (typeof prsng.beglbl=== "function") {
                return prsng.beglbl()
            }
            return prsng.beglbl;
        }

        function endlbl(prsng) {
            if (typeof prsng.endlbl=== "function") {
                return prsng.endlbl()
            }
            return prsng.endlbl;
        }
	    
	    function parsechr(prsng,chr) {
            if (endi==0 && begi<beglbl(prsng).length) {
                if (psvprsdi==-1) {
                    psvprsdi=unsprsdln;
                }
                if (begi>0 && beglbl(prsng)[begi-1]==prvc && beglbl(prsng)[begi]!==chr) {
                var bi=begi;
                begi=0;
                iterateString(prsng,beglbl(prsng).substring(0,bi),parsePsvChar);
                }
                if (beglbl(prsng)[begi]===chr) {
                begi++;
                if (begi===beglbl(prsng).length){
                    prvc="";
                    prvc="";
                } else {
                    prvc=chr;
                }
                } else {
                if (begi>0) {
                    var bi=begi;
                    begi=0;
                    iterateString(prsng,beglbl(prsng).substring(0,bi),parsePsvChar);
                }
                parsePsvChar(prsng, prvc=chr);
                }
            } else if (begi==beglbl(prsng).length && endi<endlbl(prsng).length) {
                if (atvprsdi==-1) {
                    atvprsdi=unsprsdln;
                }
                if (endlbl(prsng)[endi]===chr) {
                    endi++;
                        if (endi===endlbl(prsng).length){
                            begi=0;
                            endi=0;
                            prvc="";
                        }
                } else {
                    if (endi>0) {
                        var bi=endi;
                        endi=0;
                        iterateString(prsng,endlbl(prsng).substring(0,bi),parseCodeChar);
                    }
                    parseCodeChar(prsng, chr);
                }
            }
        }

	    iterateString(callprsng(),unparsedcontent,parsechr);
	    
	    flushPassive(callprsng()); 
	    flushCode(callprsng());
	    if (foundCode && code!="") {
            if (altEvalActive!=null && typeof altEvalActive === "function") {
                altEvalActive(code);
            } else {
		        eval(code);
            }
	    }         

	    if (passive!=="") {
            if (canprintout){
                callprsng().print(passive);
            }
	    }

	    if (typeof callprsng().endParsing === "function") {
		    callprsng().endParsing();
	    }
	}
	return parseActivePassive;
});