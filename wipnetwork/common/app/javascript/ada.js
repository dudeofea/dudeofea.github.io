  var resizerCode = '<div id="ada-buttons">'+
    '<span>Text size: </span>'+
    '<button class="js-resize-font btn btn--theme_default" data-size="0.8em" type="button">A</button>'+
    '<button class="js-resize-font btn btn--theme_default" data-size="1em" type="button">A</button>'+
    '<button class="js-resize-font btn btn--theme_default" data-size="1.2em" type="button">A</button>'+
    '<button class="js-resize-font btn btn--theme_default" data-size="1.4em" type="button">A</button>'+
  '</div>';

  function hasClass(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
  }

  function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
      var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
      ele.className=ele.className.replace(reg,' ');
    }

  }

  function addSearchParam(url,keyEqualsValue) {
    var parts=url.split('#');
    parts[0]=parts[0]+(( parts[0].indexOf('?') !== -1) ? '&' : '?')+keyEqualsValue;
    return parts.join('#');
  }

  function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
  }

  var adaParameter = getParameterValue('ada');
  if (adaParameter == 'true') {
    document.body.className += ' ada';
    if (document.addEventListener){
      window.addEventListener('load',onLoadActivateADA,false);
    } else {
      window.attachEvent('onload',onLoadActivateADA);
    }
  }

  var adaButton = document.getElementById("ada-switch");
  var body = document.body;
  adaButton.onclick = function() {
    activateADA();    
  }

  function onLoadActivateADA() {
    //jq_3("#ada-buttons").show();
    convertAllToEM();
    jq_3('#ada-switch').html('Switch to Main Site');
    jq_3('input[name="ada"]').val("true");
    jq_3("#boxes").eq(1).hide();
    for (var x = document.links.length - 1; x >= 0; x--) {
      if (hasClass(document.links[x],"skip") == null) {
        document.links[x].setAttribute("href", addSearchParam(document.links[x].getAttribute("href"),'ada=true'));
      }
    }
  }

  function activateADA() {
    var text = jq_3('#ada-switch').text();
    if (hasClass(body,'ada')) {
      jq_3("body.ada").css("font-size","");
      jq_3('#ada-switch').html('<i class="fa fa-wheelchair" aria-hidden="true"></i>Switch to Accessible Site')
      removeClass(body,'ada');
      jq_3('input[name="ada"]').val("false");
      //jq_3("#ada-buttons").hide();
      for (var x = document.links.length - 1; x >= 0; x--) {
        document.links[x].setAttribute("href", removeParam('ada', document.links[x].getAttribute("href")));
      }
    } else {
      jq_3('#ada-switch').html('Switch to Main Site');
      body.className += ' ada';
      jq_3('input[name="ada"]').val("true");
      convertAllToEM();
      //jq_3("#ada-buttons").show();
      //window.location.href = window.location.href + "?ada=true";
      for (var x = document.links.length - 1; x >= 0; x--) {
        var result = hasClass(document.links[x],"skip");
        if (hasClass(document.links[x],"skip") == null) {
          document.links[x].setAttribute("href", addSearchParam(document.links[x].getAttribute("href"),'ada=true'));
        }
      }
    }
  }

  function convertAllToEM() {
    var all = document.body.getElementsByTagName("*");
    var cssContent = ''
    for (var i=0, max=all.length; i < max; i++) {
      cssContent += "body.ada .adaElement-" + i + "{" + "font-size:" + px2em(all[i]) + "!important;}";
      jq_3(all[i]).addClass("adaElement-" + i);
    }

    if (jq_3("#adaSheet").length) {
      jq_3("#adaSheet").remove();
    }

    var style = document.createElement("style");
    style.setAttribute("id","adaSheet");
    style.appendChild(document.createTextNode(cssContent));
    document.head.appendChild(style);
  }

  function px2em(elem) {
    var W = window,
        D = document;
    if (!elem || elem.parentNode.tagName.toLowerCase() == 'body') {
        return false;
    }
    else {
        var parentFontSize = parseInt(W.getComputedStyle(elem.parentNode, null).fontSize, 10),
            elemFontSize = parseInt(W.getComputedStyle(elem, null).fontSize, 10);

        var pxInEms = Math.floor((elemFontSize / parentFontSize) * 100) / 100;
        return pxInEms + 'em';
        //elem.style.fontSize = pxInEms + 'em';
    }
  }

  var jq_3 = jQuery.noConflict();
  jq_3(function() {
        var websiteTitle = jq_3(".website-title").first();
        var websiteSubTitle = jq_3(".website-subtitle").first();
        var pageTitle = jq_3(".page-title").first();
        var nav = jq_3("#nav");

        if (jq_3(websiteTitle).prop("tagName").toLowerCase() == "img") {
           jq_3('<h1 class="CMS-textLines adaNoImg website-title">' + jq_3(websiteTitle).prop("alt") + '</h1>').insertAfter(websiteTitle);
        }
        if (jq_3(websiteSubTitle).prop("tagName").toLowerCase() == "img") {
           jq_3('<h2 class="CMS-textLines adaNoImg website-subtitle">' + jq_3(websiteSubTitle).prop("alt") + '</h2>').insertAfter(websiteSubTitle);
        }
        if (jq_3(pageTitle).prop("tagName").toLowerCase() == "img") {
           jq_3('<h1 class="CMS-textLines adaNoImg page-title">' + jq_3(pageTitle).prop("alt") + '</h1>').insertAfter(pageTitle);
        }
        jq_3(".website-title").first().parent().parent().prepend('<div id="adaPracticeName" class="adaSection">Practice Name<a href="#adaNavigation" class="skip">Skip Practice Name</a></div>');
        jq_3("#adaPracticeName").prepend(jq_3("#language-selector").clone().addClass("adaLanguageSelector"));
        jq_3("ul#nav, table#nav, div#nav").parent().prepend('<div id="adaNavigation" class="adaSection">Navigation<a href="#adaLocation" class="skip">Skip Navigation</a></div>');
        jq_3("ul#nav, table#nav, div#nav").parent().append(resizerCode);
        jq_3("ul#nav, table#nav, div#nav").parent().append('<div id="adaLocation" class="adaSection">Primary Location <a href="#adaMainContent" class="skip">Skip Location</a>');
        jq_3("ul#nav, table#nav, div#nav").parent().append(jq_3("#sidebarInfo").clone().attr("id","adaSidebarInfo"));
        jq_3(".page-title").first().parent().prepend('<div id="adaMainContent" class="adaSection">Main Content<a href="#adaFooter" class="skip">Skip Main Content</a></div>');
        jq_3("#boxes a img").parent().append('<span class="adaBoxLink">Click Here</span>');
        var footer;
        if (jq_3("#innerFooter").length) {
          footer = jq_3("#innerFooter");
        } else if (jq_3("#footer").length) {
          footer = jq_3("#footer");
        } else { 
          footer = jq_3("#copyright").parent();
        }
        jq_3(footer).prepend('<div id="adaFooter" class="adaSection">Footer</div>');
        
        if (jq_3("#adaNavigation").index("*") < jq_3("#adaPracticeName").index("*")) {
           jq_3("ul#nav").addClass("adaNoShow");
           nav = jq_3("ul#nav").clone().addClass("adaMenu").removeClass("adaNoShow").insertBefore("#innerMain").attr("id","adaNav");
           jq_3("#adaNavigation").detach().insertBefore(nav);
        }
        if (jq_3("#adaFooter").index("*") < jq_3("#adaLocation").index("*")) {
           jq_3("#adaSidebarInfo").detach().insertAfter(nav);
           jq_3("#adaLocation").detach().insertAfter(nav);
           jq_3("#ada-buttons").detach().insertAfter(nav);
        }
        if (jq_3("#adaMainContent").index("*") < jq_3("#adaNavigation").index("*")) {
           jq_3("#menu").addClass("adaNoShow");
           jq_3("#menu").clone().addClass("adaMenu").removeClass("adaNoShow").insertBefore("#adaMainContent");
           jq_3(".adaMenu #nav").attr("id","adaNav");
        }
        if (jq_3(footer).index("*") < jq_3("#boxes").index("*")) {
          //jq_3("#boxes").first().hide();
          jq_3("#boxes").addClass("adaNoShow");
          jq_3("#boxes").clone().addClass("adaBoxes").removeClass("adaNoShow").insertAfter("#content");
        }
        if (jq_3("#menu").parent().attr("id") == "slideshowSection") {
           jq_3("#menu").addClass("adaNoShow");
           jq_3("#menu").parent().parent().prepend(jq_3("#menu").clone().addClass("adaMenu").removeClass("adaNoShow"));
        }

        jq_3('.js-resize-font').on('click', function() {
            jq_3('body.ada').css('font-size', jq_3(this).data('size'));
        });
  });
