---
layout: post
title:  "Archived: AJAX Scraper"
date:   2013-02-01
tags: ajax phantomjs archived
---
<script>
function getWallpaper(frm)
{
	var str=frm.inputBox.value;
	if (str.length==0)
	{
		document.getElementById('outputBox').innerHTML = "Blank ain't no website I ever heard of! Do they speak hypertext in Blank!?";
		return;
	}
	if (window.XMLHttpRequest){ // code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else{ // code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	document.getElementById('outputBox').innerHTML = "AJAX send!";
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			document.getElementById('outputBox').innerHTML = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", "wallpaper.pl?url="+str,true);
	xmlhttp.send();
}
</script>

To be honest, I suck at web stuff. It makes no sense and its all loosey goosey. So
I decided to do this to prove to myself that I can, in fact, do the AJAX.

So here we go, I'm going to have an AJAX frontend send a website link to a Perl script
which will scrape that link for images, ignore thumbnails and then send the link blob
back to here where it will totally not mess up all of my puny CSS rules.

Originally this was for finding me a new wallpaper automatically but then life happened. Now
I'm tying up loose ends by writing the rest of this blurb. Full code <a href="wallpaper.txt">here</a>.
And of course you can just look at the source code of this page to take a look at the AJAX portion.

This is what I have so far:

<form name="demo">
	<p id="demo_title">Please enter a valid URL</p><br/>
	<p>
		<input name="inputBox"></input>
		<button type="button" name="submit_button" onclick="getWallpaper(this.form)">Submit</Button><br/>
		<span id="outputBox"></span>
	</p>
</form>

<b>Feb 2014, Update</b>: I'm way beyond this shit now. In fact I transcend code itself. goodbye dear mortals, I'm off to eat my [virtual steak](https://www.youtube.com/watch?v=TO-LFVHpA4s) in the Matrix.

<b>March 2016, Update</b>: I've archived this post, after gagging at my old coding "style". I am now akin to the ways of the loose goose that is web, and strongly discourage support of other candidates for the <b>Coding Duck</b> such as the [Loon](https://www.youtube.com/watch?v=O6Ahd91Pv7E).
