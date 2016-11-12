var token = gitToken.token; // Set up your token!
var commit_count = 9;
var cur_commits = [];
var new_commits = [];
//newest date is 3 days ago
var newest_date = new Date();
newest_date.setDate(newest_date.getDate() - 3);

$(window).load(function(){
	//github links go in here
	var urls = [
		"https://github.com/AkashPatelUAlberta/SafeToday",
		"https://github.com/fdrury/RiseAndShine",
		"https://github.com/HarryPahwa/WakeUpCall",
		"https://github.com/reboss/HackEd2016",
		"https://github.com/happy96026/HeatMap",
		"https://github.com/Spensaur-K/Allen-Spencer",
		"https://github.com/xrendan/ualbertaPrerequisiteExplorer",
		"https://github.com/red-karpiak/10000Hours",
		"https://github.com/janukan/hackED-2016-game",
	];
	//remove github link and just leave /:author/:repo:
	for (var i = 0; i < urls.length; i++) {
		urls[i] = urls[i].substring(urls[i].indexOf("github.com/")+11);
	};
	update_commits(urls);
	setInterval(function(){
		update_commits(urls);
	}, 60000);
});

//get newest commits
function update_commits(urls){
	//get commit info from repos
	var d = new Dep({ bundleArgs: true });
	for (var k = 0; k < urls.length; k++) {
		var url = "https://api.github.com/repos/"+urls[k]+"/commits?access_token="+token;
		$.get(url, function(commits){
			for (var i = 0; i < commits.length; i++) {
				var commit_date = new Date(commits[i]['commit']['author']['date']);
				if(commit_date > newest_date){
					commits[i]['date'] = commit_date;
					$.get(commits[i]['url']+"?access_token="+token, d.addDep());
					new_commits.push(commits[i]);
				}
			};
		});
	};
	d.calc(function(data){
		//add stats & diffs
		for (var i = 0; i < data.length / 3; i++) {
			new_commits[i]['stats'] = data[i*3]['stats'];
			new_commits[i]['files'] = data[i*3]['files'];
		};
		//sort cur_commits by date
		new_commits.sort(function(a, b){
			if(a['date'] > b['date'])
				return -1;
			if(a['date'] < b['date'])
				return 1;
			return 0;
		});
		//slice
		new_commits = new_commits.slice(0, Math.min(commit_count, data.length / 3));
		//get newest date and add elements
		var now = new Date();
		for (var i = new_commits.length -1; i >= 0; i--) {
			//fuck off negative commits
			if(new_commits[i]['date'] < now && new_commits[i]['date'] > newest_date){
				newest_date = new_commits[i]['date'];
			}
			if(typeof new_commits[i] != "undefined"){
				$('#commits').prepend('<div class="commit-wrapper"></div>');
				var sel = $('#commits > div:first-child');
				print_commit(sel, new_commits[i]);
			}
		};
		//cleanup
		$('#commits > div:gt('+(commit_count-1)+')').remove();
		//update array
		cur_commits = new_commits.concat(cur_commits);
		cur_commits.slice(0, commit_count);
		new_commits = [];
		//click to select commit
		$(".commit-wrapper").off();
		$(".commit-wrapper").click(function(){
			show_diff($(this).index());
		});
		//show first commit in list
		commit_slideshow_i = 0;
		show_diff(0);
	});
}

//show a diff patch in the detail window
function show_diff(i){
	if(cur_commits.length == 0)
		return;
	var total_length = 0;
	var diffs = $('#diff-view');
	var diff_i = 0;
	diffs.html('');
	for (var j = 0; j < cur_commits[i]['files'].length; j++) {
		if(cur_commits[i]['files'][j]['additions'] == 0 && cur_commits[i]['files'][j]['deletions'] == 0){
			continue;
		}
		if(total_length > 100){
			break;
		}
		//get patch
		var html = cur_commits[i]['files'][j]['patch'];
		if(typeof html == "undefined"){
			html = cur_commits[i]['files'][j]['status'];
		}
		var newlines = html.split("\n").length;
		total_length += newlines;
		//add the patch block
		diffs.append('<div class="diff"><p class="title"></p><pre><code class="diff"></code></pre></div>');
		//select it
		var sel = $('#diff-view .diff:nth-child('+(diff_i+1)+') pre code');
		$('#diff-view .diff:nth-child('+(diff_i+1)+') .title').html(cur_commits[i]['files'][j]['filename']);
		//replace < and > with &lt; and &gt;
		html = html.replace(/</g, '&lt;');
		html = html.replace(/>/g, '&gt;');
		sel.html(html);
		sel.each(function(i, block){
			hljs.highlightBlock(block);
			//_highlight_diff(block);
		});
		diff_i++;
	};
	//add selected class
	$("#commits > div").removeClass('selected');
	$("#commits > div:nth-child("+(i+1)+")").addClass('selected');
}

function _highlight_diff(block){
	var html = $(block).html();
	//highlight deletions / additions
	html = html.replace(/\n(-.*)/g, '\n<span class="hljs-deletion">$1</span>');
	html = html.replace(/\n(\+.*)/g, '\n<span class="hljs-addition">$1</span>');
	$(block).html(html);
}

//update commit times
function update_times(){
	var now = new Date();
	$('#commits > div').each(function(i){
		if(typeof cur_commits[i] != "undefined"){
			var sel = $("#commits > div:nth-child("+(i+1)+") .time");
			var date = new Date(cur_commits[i]['commit']['author']['date']);
			sel.html(print_time(now, date));
		}
	});
}
setInterval(update_times, 1000);

//slideshow of commits
var commit_slideshow;
var commit_slideshow_i = 0;
setInterval(function(){
	show_diff(commit_slideshow_i++);
	if(commit_slideshow_i >= commit_count || commit_slideshow_i >= cur_commits.length){
		commit_slideshow_i = 0;
	}
}, 5000);

//create commit in commit-wrapper element
function print_commit(sel, commit){
	var html = "";
	var insert_o = Math.min(0.4 + Math.sqrt(commit['stats']['additions'])/20, 1.0);
	var delete_o = Math.min(0.4 + Math.sqrt(commit['stats']['deletions'])/20, 1.0);
	if(commit['author'] == null){
		commit['author'] = {
			avatar_url: 'blacktocat.png',
			login: commit['commit']['author']['name']
		};
	}
	var message = commit['commit']['message'];
	message = message.replace(/</g, "&lt;");
	message = message.replace(/>/g, "&gt;");
	html += '<div class="commit"> \
					<img src="'+commit['author']['avatar_url']+'"> \
					<div class="username">'+commit['author']['login']+'</div> \
					<div class="stats"> \
						<div class="insert-count" style="opacity:'+insert_o+'">'+commit['stats']['additions']+'+</div> \
						<div class="delete-count" style="opacity:'+delete_o+'">'+commit['stats']['deletions']+'-</div> \
					</div> \
					<div class="message">'+message+'</div> \
					<div class="time"></div> \
				</div>';
	sel.html(html);
}

//format a time difference
function print_time(now, date){
	var sec = parseInt((now.getTime() - date.getTime()) / 1000);
	if(sec < 0)
		return 'The Future';
	if(sec < 60)		//show seconds
		return sec + "s";
	var min = parseInt(sec/60);
	if(min < 60)	//show minutes
		return parseInt(min)+"m "+parseInt(sec%60)+"s";
	var hr = parseInt(min/60);
	if(hr < 24) //show hours
		return parseInt(hr)+"h "+parseInt(min%60)+"m";
	//show days
	return parseInt(hr/24)+"d "+parseInt(hr%24)+"h";
}
// Based off of: 
// https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/

function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
	var isActive = false;
	var isLastHour = false;

  function updateClock() {

    var t = getTimeRemaining(endtime);
	$('.days').text(t.days);
	$('.hours').text(('0' + t.hours).slice(-2));
	$('.minutes').text(('0' + t.minutes).slice(-2));
	$('.seconds').text(('0' + t.seconds).slice(-2));

	if(t.days == 0 && !isActive){
		isActive = true;
		//Set timer to white
		$('#countdown').css({
			'color': '#fff',
		});
	}
	else if(t.total <= 3600000 && !isLastHour){
		isLastHour = true;
		//Change to yellow
		$('#countdown').css({
			'color': '#FFA500',
		});
	}
    else if (t.total <= 0) {
		// Change to red
      clearInterval(timeinterval);
	  $('#countdown').css({
			'color': '#FF0000',
		});
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

var deadline = 'November 13 2016 12:00:00 GMT-0700';
//var deadline = new Date(Date.parse(new Date()) + 24 * 60 * 60 * 1000);
initializeClock("countdown", deadline);

