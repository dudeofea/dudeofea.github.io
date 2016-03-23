var page = new WebPage(), url, testindex = 0, loadInProgress = false, name, isDone;
phantom.injectJs('jquery.js');
if(phantom.args.length == 2){
	sw = phantom.args[0].substring(1);
	url = phantom.args[1];
}else{
	sw = "";
	url = phantom.args[0];
}
var pageindex = 1;
var loop = false;
function simulateMouseClick(selector) {
    var targets = document.querySelectorAll(selector),
        evt = document.createEvent('MouseEvents'),
        i, len;
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        
    for ( i = 0, len = targets.length; i < len; ++i ) {
        targets[i].dispatchEvent(evt);    
    }
}
page.onConsoleMessage = function(msg) {
        console.log(msg.replace("&amp;", "&"));
};
page.onLoadStarted = function() {
    loadInProgress = true;
    //console.log("load started");
};
page.onLoadFinished = function() {
    loadInProgress = false;
    //console.log("load finished");
};
page.onError = function (msg, trace) {
    /*console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    })*/
		//block all errors
}
var steps;
//normal link
if(sw == ""){
	steps = [
			function(){
					page.open(url);
			}, function(){
					page.evaluate(function(){
						var script_content = $("a.pl-button.favorite").parents("div.actionbar:first").nextAll("script:first").text();
						var temp = script_content.match(/"streamUrl":"[^"]+"/);
						var link = temp.toString().split('"')[3];
						var temp = $.trim($('h1.with-artwork em').html());
						if(temp == "" || temp == null){
							temp = $.trim($('div.info-header.large h1 em').html());
						}
						console.log(temp);																						//title
						console.log($.trim($('span.user.tiny a.user-name').html()));  //artist
						console.log($.trim($('div.actionbar a span.genre').html()));  //genre
						console.log($.trim($('div#zoomed-artwork img').attr("src"))); //image
						console.log(link);																						//song link
						return link;
					});
			}
	];
//artist link
}else if(sw == "a"){
	steps = [
			function(){
					page.open(url + "/tracks?page=" + pageindex);
			}, function(){
					var result = page.evaluate(function(){
						var name = $.trim($('div#user-info h1 span.nickname').html());
						var main_image = $.trim($('div.user-image a.user-image-large').attr("href"));
						var tracks = $("ul.tracks-list").children();
						for (i=0; i<10; i++){
							var script_content = $(tracks[i]).find("a.pl-button.favorite").parents("div.actionbar:first").nextAll("script:first").text();
							var temp = script_content.match(/"streamUrl":"[^"]+"/);
							var link = temp.toString().split('"')[3];
							var track_name = $.trim($(tracks[i]).find('div.info-header h3 a').html()).toString();
							//remove "teasers" and previews
							if(!(track_name.match(/[Tt]easer/) || track_name.match(/[Pp]review/))){
								console.log(track_name);
								console.log($.trim(name));
								console.log($.trim($(tracks[i]).find('div.actionbar a span.genre').html()));
								var temp_image = $.trim($(tracks[i]).find('div.info-header a.artwork').attr("href"));
								if(temp_image == "" || temp_image == null){
									console.log(main_image);
								}else{
									console.log(temp_image);
								}
								console.log(link);
								console.log("###");
							}
						}
						//next page button
						return $("div.pagination a.next_page").html();
					});
					if(result == "Next"){
						loop = true;
					}
			}
	];
}

interval = setInterval(function() {
    if (!loadInProgress && typeof steps[testindex] == "function")
    {
        //console.log("step " + (testindex + 1));
        steps[testindex]();
        //page.render("images/step" + (testindex + 1) + ".png");
        testindex++;
    }
    if (!loop && typeof steps[testindex] != "function")
    {
        //console.log("test complete!");
        phantom.exit();
    }
		if(loop){
				pageindex++;
				testindex = 0;
				loop = false;
		}
}, 50);