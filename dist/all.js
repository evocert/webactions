//parsing.js
function parseActivePassive(prsng,unparsedcontent){
    if (typeof prsng.startParsing === "function") {
        prsng.startParsing();
    }

    var passive="";
    var canprintout=typeof prsng.print === "function";
    
    var print=function(prntthis) {
        if (canprintout && typeof prntthis === "string" && prntthis!=="") {
            passive+=prntthis;
        }       
    }

    function iterateString(prsgn,stringtoiterate,functoprsr) {
        if (typeof stringtoiterate==="string" && typeof functoprsr === "function") {
            for(let cdr of stringtoiterate) {
                functoprsr(prsgn,cdr)
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
            tmppassive="";
        }
    }

    function parsePsvChar(prsng,chr) {
        flushCode();
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

    function flushCode(){
        if(tmpcode!="") {
            code+=tmpcode;
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
    flushCode();
    if (foundCode && code!="") {
        eval(code);
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
//webactions.js
var lasturlref="";

function postElem() {
	var elem=[].slice.call(arguments);
	if(elem==undefined) return;
	if (Array.isArray(elem)){
		if (elem.length==0) return;
		if (elem.length==1) {
			elem=elem[0];
		} else {
			for (var elm in elem) {
				postElem(elem[elm]);
			}
			return;
		}
	}
	var options={}
	$(elem).each(function() {
		$.each(this.attributes, function() {
			if(this.specified) {
				if (this.name=="url_ref" || this.name=="form_ref" || this.name=="enable_progress_elem" || this.name=="progress_elem" || this.name=="target" || this.name=="command" || this.name=="scriptlabel" || this.name=="replacelabel" || this.name==="parseoptions"){
					options[this.name] = this.value;
				} else if (this.name=="json_ref"){
					if (this.value!=undefined && this.value!="") {
						options[this.name] = JSON.parse(this.value);
					}
				}
			}
		});
	});
	postNode(options);
}

function postNode(){
	var options=[].slice.call(arguments);
	if(options==undefined) return;
	if (Array.isArray(options)){
		if (options.length==0) return;
		if (options.length==1) {
			if (Array.isArray(options[0])){
				for (var opt in options[0]) {
					postNode(options[0][opt]);
				}
				return;
			} if (typeof options[0] === 'function'){
				var optreturn=options[0]();
				if (optreturn===undefined){
					return;
				} else {
					postNode(optreturn);
				}
				return;
			}
			else {
				options=options[0]
			}
		} else {
			for (var opt in options) {
				postNode(options[opt]);
			}
			return;
		}
	} 
	if(options.url_ref==undefined||options.url_ref==""){
		return;
	}
	
	var hasForm=false;
	var enableProgressElem=false;

    if(options.enable_progress_elem!=undefined&&options.enable_progress_elem!=""){
		enableProgressElem=options.enable_progress_elem=="true"?true:false;
	}

	var progressElem="";
	var hasJson=false;
	var errorElem="";
	var urlref="";
	var formid="";
	var command="";
	
	if(options.command!=undefined&&options.command!=""){
		command=options.command;
	}
	
	if(options.form_ref!=undefined&&options.form_ref!=""){
		hasForm=true;
		formid=options.form_ref;
	}

	var jsondata=null;

	if(options.json_ref!=undefined){
		hasJson=true
		jsondata=options.json_ref;
	}
	
	var target="";
    if(enableProgressElem) {
	    if(options.progress_elem!=undefined){
		    progressElem=options.progress_elem+"";
	    } else{
		    $.blockUI({ 
			    message : '<span style="font-size:1.2em" id="showprogress">Please wait ...</span>',
			    css: { 
			    border: 'none', 
	            padding: '15px', 
	            backgroundColor: '#000', 
	            '-webkit-border-radius': '10px', 
	            '-moz-border-radius': '10px', 
	            opacity: .7, 
	            color: '#fff'
			    }
		    });
		    progressElem="#showprogress";
	    }
    
        if(progressElem!=undefined){
		    if (progressElem!="#showprogress") {
			    $(progressElem).show();
		    }
	    }
    }
	
	if(options.error_elem!=undefined){
		errorElem=(options.error_elem+"").trim();
	} else {
		errorElem="";
	}
	if(options.url_ref!=undefined){
		urlref=(options.url_ref+"").trim();
    } else {
    	urlref=(lasturlref+"").trim();
    }
    if (hasForm) {
        if(options.form_ref!=undefined){
            formid=(options.form_ref+"").trim();
        }
    }
	if(options.target!=undefined){
		target=(options.target+"").trim();
	}
    var formData = hasJson?jsondata:new FormData();
	if (urlref!=="") {
		var urlparams=getAllUrlParams(urlref);
		if (urlref.indexOf("?")>-1){
			urlref=urlref.slice(0,urlref.indexOf("?"));
			lasturlref=urlref+"";
		} else {
			lasturlref=urlref+"";
		}
		if (urlparams!=undefined){
			Object.keys(urlparams).forEach(function(key) {
				
				if(Array.isArray(urlparams[key])){
					urlparams[key].forEach(function(val){
						if(hasJson) {
							if (formData["reqst-params"][fname]==undefined){
								formData["reqst-params"][fname]=[];
							} 
							formData["reqst-params"][key].push(val);
						} else {
							formData.append(key,val);
						}
					});
				} else {
					
					if(hasJson) {
						if (formData["reqst-params"][fname]==undefined){
							formData["reqst-params"][fname]=[];
						}
						formData["reqst-params"][key].push(urlparams[key]);
					} else {
						formData.append(key,urlparams[key]);
					}
				}
			});
		}
	}
    var formIds=formid.trim()==""?[]:formid.split("|")
    if (hasForm) {
        formIds.forEach(function(fid,i,arr){
			if($(fid).length){
				if(!$(fid).is("form")){
					if ($(fid).find("select[name],input[name],textarea[name]")!=undefined){
						$(fid).find("select[name],input[name],textarea[name]").each(function(){
							var input = $(this);
							if (input.attr("name")!=""){
								var canAddVal=true;
								var inputtype=input.attr("type")!==undefined?input.attr("type"):"text";
								if (inputtype==="checkbox" || inputtype==="radio") {
									canAddVal=input.prop("checked")?true:false; 
								}
								if(canAddVal) {
									var fname=input.attr("name")
									var fval=input.val();
									if (hasJson) {
										if (formData["reqst-params"]==undefined){
											formData["reqst-params"]={}
										}
									}
									if(inputtype!==undefined && inputtype!=="button"&&inputtype!=="submit"&&inputtype!=="image"){
										if(inputtype==="file"){
											if (!hasJson) {	formData.append(input.attr("name"),input[0].files[0]); }
										} else {
											if (hasJson) {
												if (formData["reqst-params"][fname]==undefined){
													formData["reqst-params"][fname]=[];
												} 
												formData["reqst-params"][fname].push(fval);
											} else {
												formData.append(fname,fval);
											}
										}
									} else {
										if (hasJson) {
											if (formData["reqst-params"][fname]==undefined){
												formData["reqst-params"][fname]=[];
											} 
											formData["reqst-params"][fname].push(fval);
										} else {
											formData.append(fname,fval);
										}
									}
								}
							}
						});
					}
				}
			}
        });
    }
	
	if (command!=""){
		if (hasJSon) {
		} else {
			formData.append("command",command);
		}
	}
	var responseFunc=defaultResponseCall;
	var responseErrorFunc=defaultResponseErrorCall;

	var ajaxpromise=new Promise(function(resolve, reject) {
		$.ajax({
			xhr: function () {
				var xhr = $.ajaxSettings.xhr();
				xhr.upload.onprogress = function (e) {
					if(enableProgressElem) {
						if(progressElem!=undefined&&progressElem!=""){
							$(progressElem).html(Math.floor(e.loaded / e.total * 100) + '%');
						}
					}
				};
				xhr.withCredentials = false;
				return xhr;
			},
			contentType:hasJson?"application/json":false,
			processData: false,
			type: 'POST',
			data:hasJson?JSON.stringify(formData):formData,
			url: urlref,
			success: function (response,textStatus,xhr) {
				if(xhr.getResponseHeader("Content-Disposition")==null){
					if(enableProgressElem){
						if(progressElem!=undefined){
							if (progressElem=="#showprogress") {
										$.unblockUI();
							} else {
								$(progressElem).hide();
							}
						}
					}
					
					var replacelabel="replace-content";
					if(options.replacelabel!=undefined&&(options.replacelabel!="").trim()!==""){
						replacelabel=(options.replacelabel!="").trim();
					}
					var scriptlabel="script";
					if(options.scriptlabel!=undefined&&(options.scriptlabel!="")!==""){
						scriptlabel=(options.scriptlabel!="");
					}
	
					if (responseFunc!=null) {
						if(options.replacelabel==undefined){
							options.replacelabel=replacelabel;
						}
						if(options.scriptlabel==undefined){
							options.scriptlabel=scriptlabel;
						}
						try {
							responseFunc("ajax",options,response,textStatus,xhr)
							resolve();
						} catch(e) {
							reject(e);
						}
					}					
				} else {
					var contentdisposition=(""+xhr.getResponseHeader("Content-Disposition")).trim();
					if (contentdisposition.indexOf("attachment;")>-1) {
						contentdisposition=contentdisposition.substr(contentdisposition.indexOf("attachment;")+"attachment;".length).trim();
					}
					var contenttype=(""+xhr.getResponseHeader("Content-Type")).trim();
					if (contenttype.indexOf(";")>-1) {
						contenttype=contenttype.substr(0,contenttype.indexOf(";")).trim();
					}
					if (contentdisposition.indexOf("filename=")>-1) {
						contentdisposition=contentdisposition.substr(contentdisposition.indexOf("filename=")+"filename=".length).trim();
						contentdisposition=contentdisposition.replace(/"/i,"")
						contentdisposition=contentdisposition.replace(/"/i,"")
					}
					safeData(responseText,contentdisposition,contenttype);
				}
			},
			error: function(jqXHR, textStatus, textThrow) {
				if(enableProgressElem) {
					if(progressElem!=undefined){
						if (progressElem=="#showprogress") {
									$.unblockUI();
						} else {
							$(progressElem).hide();
						}
					}
				}
				if(responseErrorFunc!==undefined) {
					responseErrorFunc("ajax",options,textStatus,jqXHR)
				} else {
					if(errorElem!=undefined&&errorElem!=""){
						$(errorElem).html("Error loading request: "+textStatus);
					}
				}
				reject(Error("Error loading request: "+textStatus));
			}
		});
	});

	ajaxpromise.then(function(){
		if (options.resolved!=undefined) {
			if (typeof options.resolved ==='function'){
				options.resolved(options);
			}
		}
		if (options.options!=undefined) {
			postNode(options.options);
		}
	},function(err){
		if (options.rejected!=undefined) {
			if (typeof options.rejected ==='function'){
				options.rejected(options,err);
			}
		}
	});
}

function defaultResponseCall(){
	var args=[].slice.call(arguments);
	if (args.length>=4) {
		
		var options=args[1];
		var target="";
		if (options.target!==undefined) {
			target=options.target+"";			
		}
		var prsng = {"beglbl":"[@","endlbl":"@]"};
		var enableActivePassive=false;
		if (typeof options.parseoptions === "object") {
			enableActivePassive=true;
			for(let prsk of Object.keys(options.parseoptions)){
				prsng[prsk]=options.parseoptions[prsk]
			}
		}
		var scriptlabel=options.scriptlabel+"";
		var replacelabel=options.replacelabel+"";
		var response=args[2];
		var parsed=parseActiveString(`${scriptlabel}||`,`||${scriptlabel}`,response);
		var parsedScript=parsed[1].join("");
		response=parsed[0].trim();
		
		var targets=[];
		var targetSections=[];
		
		if(response!=""){
			if(response.indexOf(`${replacelabel}||`)>-1){
				parsed=parseActiveString(`${replacelabel}||`,`||${replacelabel}`,response);
				response=parsed[0].trim();
				for(let possibleTargetContent of parsed[1]){
					if(possibleTargetContent.indexOf("||")>-1){
						targets[targets.length]=[possibleTargetContent.substring(0,possibleTargetContent.indexOf("||")),possibleTargetContent.substring(possibleTargetContent.indexOf("||")+"||".length,possibleTargetContent.length)];
					}        				
				}
			}
		}
		if  (target!=="" && response!==""){
			if (target.startsWith("#")) {
				if (enableActivePassive && typeof parseActivePassive === "function") {
					parseActivePassive({print:function(prntthis){
						$(target).html(prntthis);
					}},response);
				} else {
					$(target).html(response);
				}
			} else {
				$(target).each(function(i){
					var tthis=this;
					if (enableActivePassive && typeof parseActivePassive === "function") {
						parseActivePassive({print:function(prntthis){
							$(tthis).html(prntthis);
						}},targetSec[1]);
					} else {
						$(this).html(response);
					}
				});
			}
		}
		if(targets.length>0){
			for(let targetSec of targets) {
				if ($(targetSec[0]).length>0) {
					if (targetSec[0].startsWith("#")) {
						if (enableActivePassive && typeof parseActivePassive === "function") {
							parseActivePassive({print:function(prntthis){
								$(targetSec[0]).html(prntthis);
							}},targetSec[1]);
						} else {
							$(targetSec[0]).html(targetSec[1]);
						}
					} else {
						$(targetSec[0]).each(function(){
							var tthis=this;
							if (enableActivePassive && typeof parseActivePassive === "function") {
								parseActivePassive({print:function(prntthis){
									$(tthis).html(prntthis);
								}},targetSec[1]);
							} else {
								$(tthis).html(targetSec[1]);
							}
						});
					}
				}
			};
		}
		
		if(parsedScript!=""){
			try {
				eval(parsedScript)
			} catch(e) {
				throw e;
			}
		}
	}
}

function defaultResponseErrorCall(){
	var options=[].slice.call(arguments);
}
function safeData(data, fileName,contentType) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
		blob = new Blob([data], {type: contentType}),
		url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);    
}

function parseActiveString(lblStart,lblEnd,passiveString){
	this.parsedPassiveString="";
	this.parsedActiveString="";
	this.parsedActiveArr=[];
	this.passiveStringIndex=0;
	this.passiveStringArr=[...passiveString];	
	this.lblsi=0;
	this.lblei=0;
	this.pc='';
	for(let c of passiveStringArr){
		if(this.lblei==0&&this.lblsi<lblStart.length){
			if(this.lblsi>0&&lblStart[this.lbls-1]==pc&&lblStart[this.lblsi]!=c){
				this.parsedPassiveString+=lblStart.substring(0,this.lblsi);
				this.lblsi=0;
			}
			if(lblStart[this.lblsi]==c){	
				this.lblsi++;
				if(this.lblsi==lblStart.length){
					
				}
			}
			else{
				if(this.lblsi>0){
					this.parsedPassiveString+=lblStart.substring(0,this.lblsi);
					this.lblsi=0;
				}
				this.parsedPassiveString+=c;
			}
		}
		else if(this.lblsi==lblStart.length&&this.lblei<lblEnd.length){
			if(lblEnd[this.lblei]==c){
				this.lblei++;
				if(this.lblei==lblEnd.length){
					this.parsedActiveArr[this.parsedActiveArr.length]=this.parsedActiveString+"";
					this.parsedActiveString="";
					this.lblei=0;
					this.lblsi=0;
				}
			}
			else{
				if(this.lblei>0){
					this.parsedActiveString+=lblEnd.substring(0,this.lblei);
					this.lblei=0;
				}
				this.parsedActiveString+=(c+"");
			}
		}	
		this.pc=c;		
	}
	return [this.parsedPassiveString,this.parsedActiveArr]
}

function getAllUrlParams(url) {
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : "";
    // we'll store the parameters here
    var obj = {};
    // if query string exists
    if (queryString) {
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
      // split our query string into its component parts
      var arr = queryString.split('&');
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
        // set parameter name and value (use 'true' if empty)
        var paramName = decodeURIComponent(a[0]);
        var paramValue = typeof (a[1]) === 'undefined' ? "" : decodeURIComponent(a[1]);

        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string'){
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
    return obj;
  }