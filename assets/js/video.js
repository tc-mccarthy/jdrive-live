var ustream = function(ele){
	this.ele = ele;
	$(this.forceAspect);
	$(window).resize(this.forceAspect);
};

ustream.prototype.forceAspect = function(){
	var width = this.ele.width(),
		height = (width * 9) / 16;

	this.ele.height(height);
};