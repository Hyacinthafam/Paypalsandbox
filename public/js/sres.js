
$( document ).ready(function() {
	$("form").each(function(){
		var el = document.createElement("input");
		el.type = "hidden";
		el.name = "screen_res";
		el.value = screen.width + 'x' + screen.height;
		this.appendChild(el);
	});
});
