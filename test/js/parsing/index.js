function test(){
	var src=`
		[@for(var i=0;i<8;i++){@]
			<div>[@print(""+42);@]</div>
		[@}@]
	`;
	var t0;
	var t1;
	//window.out="";
	var target=$("#output");
	target.empty();
	prsng={
		target:target,
		src:src,
		beglbl:"[@",
		endlbl:"@]",
		t0:null,
		t1:null,
		out:"",
		startParsing:function(){
			t0=new Date();
		},
		print:function(val){
			if(arguments!=="undefined"&&arguments.length>0){
				target.html(target.html()+arguments[0]);
			}
		},
		endParsing:function(){
			t1=new Date();
		}
	};
	var out=parseActivePassive(prsng,src);
	var td=(t1-t0);
	console.log(out);
	$("#console").text("Execution Time:"+td);
}
