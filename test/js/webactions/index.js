$(document).ready(function(){
	//----------------------------------
	//setup scripting handler
	//----------------------------------
	$("#mock #static_response").val(
`console.log("mock/res/0.txt:start");
var resobj={};
resobj.entries=[];
var it=settings.data.entries();
var result=it.next();
while (!result.done){
 console.log(result.value);
 resobj.entries.push(result);
 result=it.next();
}
this.responseText=JSON.stringify(resobj,0,2);
console.log("mock/res/0.txt:end");`);

	function hdlMock(settingsP){
		console.log('hdlMock');
		//console.log(this);
		//console.log(settings);
		var src=$("#mock #static_response").val();
		try{
			var settings=settingsP
			eval(src);
		}catch(e){
			console.error(e.toString());
			this.responseText=e.toString();
		}
	}
	//----------------------------------
	//setup mock
	//----------------------------------
	$.mockjax({
		url:"./mock/res/0.txt",
		contentType:"text/plain",
		responseTime:0,
		//responseText:`/mock/res/0.txt:lorem`//static
		response:function(settings) {
			//console.log(settings);
			hdlMock.call(this,settings);
			//this.responseText=`./mock/res/0.txt:${new Date().getTime()}`;
			return true;
		}
	});
	$.mockjax({
		url:"./mock/res/1.txt",
		contentType:"text/plain",
		responseTime:0,
		//responseText:`/mock/res/1.txt:ipsum`//static
		response:function(settings) {
			console.log(settings);
			this.responseText=`./mock/res/1.txt:${new Date().getTime()}`;
			return true;
		}
	});
	$.mockjax({
		url:"./mock/res/0.js",
		responseTime:0,
		contentType:"application/javascript",
		//responseText:`alert("./mock/res/0.js");`
		response:function(settings) {
			console.log(settings);
			this.responseText=`alert("HELLO_"+new Date().getTime());`;
			return true;
		}

	});
	$.mockjax({
		url:"./mock/res/1.js",
		contentType:"application/javascript",
		responseTime:0,
		response:function(settings) {
			console.log(settings);
			this.responseText=`alert("HELLO_"+new Date().getTime());`;
			return true;
		}
	});
	//----------------------------------

}.bind(this));
