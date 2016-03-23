---
layout: post
title:  "Archived: Soundcloud Scraper"
date:   2012-06-01
tags: phantomjs scrape web archived
---
I like music. When I find a song I like, I want to listen to it until it becomes dead to me.
During the summer, I would listen to random songs here and there (courtesy of <a href="http://www.reddit.com/r/electrohouse">r/electrohouse</a>)
while working and often find good songs. I emailed myself a list of links to download when I got home.
The list had 3 types of links:

<ul>
	<li>Youtube links, downloadable with <a href="http://www.flv2mp3.com/">flv2mp3</a></li>
	<li>Soundcloud song links, downloadable with <a href="http://soundcloud-download.com/">Soundcloud Downloader</a></li>
	<li>Soundcloud artist links</li>
</ul>

If I wanted to download these links, I would need to do it one by one. There must be an easier way!

Link Extraction
---------------
The first problem I encountered even before coding was that not all SC links were downloadable. I of course could care less
why SC limits their downloads, but it bothers me that they do. One notion I see myself mention a lot (and that should be the
<a href="http://technet.microsoft.com/library/cc722487.aspx">11th law of security</a>) is: <b1>"If it displays on my screen or plays
through my headphones, I can download it"</b1>. However this coding project was simply a test to familiarize myself in the ways of web
scraping. Actually running this program would breach the <a href="http://soundcloud.com/terms-of-use">Terms of Use</a> of SC:

<p class="emphasis">
	(i) You must not copy, rip or capture, or attempt to copy, rip or capture, any audio Content from the Platform or any part of the Platform
	, other than by means of download in circumstances where the relevant Uploader has enabled the download functionality with respect to the
	relevant item of Content.
</p>

Of course, I find it kind of odd that by accessing their website, you automatically agree to their <r1>Terms of Use</r1> which I find impossible
since you can't agree to something you haven't read yet. On a similar note, you just lost <a href="http://www.losethegame.com/">The Game</a>.
Also, by explaining how to do this, I'm violating yet another clause:

<p class="emphasis">
	(vii) You must not, and must not permit any third party to, copy or adapt the object code of the Website or any of the Services, or
	reverse engineer, reverse assemble, decompile, modify or attempt to discover any source or object code of any part of the Platform, or
	circumvent or attempt to circumvent or copy any copy protection mechanism or access any rights management information pertaining to
	Content other than Your Content.
</p>

I've never heard of something so ballsy as to say that I can't view your html code <r2>that you gave to me!</r2>

If any party disagrees with me posting this, please notify me via email (dlachanc@ualberta.ca) and I will swiftly remove this page
from my website. Although, it might take awhile for me to get the email since I'm behind <a href="https://www.youtube.com/watch?feature=player_detailpage&v=ejGGwq4qTmE#t=101s">
seven proxies.</a>

Alright, here we go. First I found <a href="http://userscripts.org/scripts/review/96022">this</a> awesome JS script by Captain Frech,
and <a href="../images/what-you-did-there-i-see-it.jpg">aye, I</a> must say it sure helped. What his/her code is based on is the fact that
SC hides the download link unencrypted, in plain sight:

<img src="/images/soundcloud_2.png" height="198px"/>

Those sly devils! Note: this is for the older version of SC, the newer version is completely locked down....
<a href="https://chrome.google.com/webstore/detail/soundcloud-downloader-tec/cdbkpkilkooakdpmknhgjlepdnjgnadc?hl=en">oh wait what's this</a>.
I took the code and tranfered it to a <a href="http://phantomjs.org/">PhantomJS</a> script so that I didn't need to do it myself. PhantomJS
is built on NodeJS which is a server-side javascript engine, which I seem to be the only one to find that hilarious seeing as javascript is
looser than a....oh nvm.

Here's my code snippet (full code <a href="/files/soundcloud.js">here</a>):

{% highlight js %}
var script_content = $("a.pl-button.favorite").parents("div.actionbar:first").nextAll("script:first").text();
var temp = script_content.match(/"streamUrl":"[^"]+"/);
var link = temp.toString().split('"')[3];
var temp = $.trim($('h1.with-artwork em').html());
if(temp == "" || temp == null){									//alternate title
	temp = $.trim($('div.info-header.large h1 em').html());
}
console.log(temp);											 	//title
console.log($.trim($('span.user.tiny a.user-name').html())); 	//artist
console.log($.trim($('div.actionbar a span.genre').html())); 	//genre
console.log($.trim($('div#zoomed-artwork img').attr("src")));	//image link
console.log(link);
{% endhighlight %}

The script uses <p1>console.log()</p1> to print out various strings. Since this is run by command line, I implemented a perl script to
run PhantomJS with the correct arguments for each link in my playlist text file. If you look at the full code, I first initialize an
array of <b1>steps</b1> then run through each one, waiting with a polling loop for each step to finish. I originally got the idea from
<a href="http://stackoverflow.com/a/9256079">this</a>.

Downloading
-----------
My <a href="../scrip.txt">perl script</a> reads the playlist text file, determines the type of link, and downloads it. Youtube links were not implemented. For downloading
a single SC song link, it does the following:

{% highlight perl %}
if($track_info[4] ne ""){
	#download mp3
	system("curl -s -L -o \"$track_info[0].mp3\" $track_info[4]");
	if($track_info[3] ne ""){
		#download image
		system("curl -s -L -o \"$track_info[0] - Temp Image.jpg\" $track_info[3]");
		while(wait() != -1){
		}
		#add image to mp3 file
		system("perl mp3art.pl \"$track_info[0] - Temp Image.jpg\" \"$track_info[0].mp3\"");
		wait();
		system("rm -f \"$track_info[0] - Temp Image.jpg\"");
		#add metadata
		$mp3 = MP3::Tag->new("$track_info[0].mp3");
		if($mp3){
			$id3v1 = $mp3->new_tag("ID3v1");
			$id3v1->all("$track_info[0]","$track_info[1]","","",
						"Generated by scrip",1,"$track_info[2]");
			$id3v1->write_tag();
		}
	}else{
		print "# could not find image URL\n";
	}
}else{
	print "# could not find mp3 URL\n";
}
{% endhighlight %}

Downloading an entire artist's worth of songs is just as simple since my PhantomJS script does all the heavy lifting.
The perl script basically downloads whatever comes it way, while the PhantomJS script navigates from page to page extracting
all the songs it finds.

I make use of <a href="http://perl.thiesen.org/scripts/id3image">this</a> in line 10 to add an image to the downloaded
mp3 file. Beware, this requires <a href="http://search.cpan.org/~ilyaz/MP3-Tag-0.92/Tag/ID3v1.pm">MP3::Tag</a> and
<a href="http://www.imagemagick.org/script/index.php">ImageMagick</a>. This whole setup was such a pain on Windows, I just
ran it on my mac.

Photo Evidence
--------------

Ha! you almost got me. Of <b1>course</b1> I wouldn't <b1>actually</b1> run this after having paradoxically read and agreed to the <r1>Terms of
Use</r1> the instant I opened soundcloud.

**END OF POST**

Archived from my old website. And yes, I do realize that all that soundcloud needs to do is correlate webserver access times to this post but idgaf
