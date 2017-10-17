function displayElement(elementId) {
    document.getElementById(elementId).style.display = "block";
}

function hideElement(elementId) {
    document.getElementById(elementId).style.display = "none";
}

function validateMailChimpWidget() {
    
    var widget = document.getElementById("widget-mailchimp");
    var elements = widget.childNodes;
    
    var success = true;
    var oneListChecked = false;
    
    for (var i = 0; i < elements.length; i++) {
        
        if (elements[i].nodeName.toLowerCase() == "input" || 
            elements[i].nodeName.toLowerCase() == "textarea" ||
            elements[i].nodeName.toLowerCase() == "option" ||
            elements[i].nodeName.toLowerCase() == "select" ||
            elements[i].nodeName.toLowerCase() == "optgroup" ||
            elements[i].id == "mailChimpContainerList") {
        
                if (hasClassName(elements[i], "required")) {
                    if (trim(elements[i].value) == "") {
                        addClassName(elements[i], "error");
                        success = false;
                        break;
                    } else {
                        removeClassName(elements[i], "error");
                    }
                }
                
                if (success && hasClassName(elements[i], "email")) {
                    if (!validateMailFormat(elements[i])) {
                        success = false;
                        break;
                    }
                }
                
                if (elements[i].id == "mailChimpContainerList") {
                    var list = elements[i].childNodes;
                    for (var j = 0; j < list.length; j++) {
                        if (list[j].nodeName.toLowerCase() == "input" && list[j].type.toLowerCase() == "checkbox") {
                            if (list[j].checked) {
                                oneListChecked = true;
                                break;
                            }
                        }
                    }
                }
        }
    }
    
    if (!success) {
        alert("Fields in red are required.")
    }
    if (success && !oneListChecked) {
        alert("You need to select at least one list.")
    }
    
    return success && oneListChecked;
}

function getParameterValue (parameterName) {
    
    var queryString = document.URL;
    parameterName = parameterName + "=";
    
    if (queryString.length > 0 ) {
    
        var begin = queryString.indexOf ( '?'+parameterName );
        
        if (begin == -1) {
            begin = queryString.indexOf ( '&'+parameterName );
        }
        
        if ( begin != -1 ) {
        
            begin += parameterName.length + 1;
            
            var end = queryString.indexOf ( "&" , begin );
            
            if ( end == -1 ) {
                end = queryString.length;
            }
            
            return unescape ( queryString.substring ( begin, end ) ).replace(/\+/g, ' ');
        }
      
        return null;
    }
}

function trim (myString) {
    return myString.replace(/^\s+/g,'').replace(/\s+$/g,'')
}

function validateMailFormat(field) {  
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  
    if(field.value.match(mailformat)) {   
        removeClassName(field, "error");
        return true;
    } else {  
        addClassName(field, "error");
        alert('You have entered an invalid email address!');  
        return false;  
    }  
}

function hasClassName(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClassName(ele,cls) {
    if (!this.hasClassName(ele,cls))
        ele.className += " "+cls;
}
function removeClassName(ele,cls) {
    if (hasClassName(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className = ele.className.replace(reg,' ');
    }
        
} 

function setPayPalChromeDirty() {

  // called by on click in chrome
  
  
  // TODO: need to put in check for chrome
       /*
        *  toggle to dirty now
        */

      setPaypalClickState("dirty");
        


}

function doReload() {

   // called by mouse over in chrome
   
   
   // TODO: get in the check for chrome here
   var state = getPaypalClickState();
   //alert("state is: "+state);
   if (state == "dirty")
   {   
       /*
        *  toggle to ready then reload
        */
       setPaypalClickState("ready");
       window.location.reload();
   }
}

function getPaypalClickState() {

      var paypalClickStateVal = "ready"; //document.getElementsByName("paypalClickState");
      
      var stateArray = document.getElementsByName("paypalClickState");
      
      for (i=0;i < stateArray.length;i++)
      {
        //alert(i+" "+stateArray[i].value);
        //document.getElementsByName("myInput")[i].value=''
        if (stateArray[i].value == "dirty")
        {
            paypalClickStateVal = "dirty";
        }
      }
      
      return paypalClickStateVal;
}


function setPaypalClickState(state) {

 
      //alert("setting click state to: "+state);   
      for (i=0;i < stateArray.length;i++)
      {
          document.getElementsByName("paypalClickState")[i].value=state;
      }
}

function payPalChromeCheck() {
    //alert("in the global file...");
    
    var browser=navigator.appName;
    var b_version=navigator.appVersion;
    var version=parseFloat(b_version);

   //alert("Browser name: "+ browser+" Browser version: "+ version);
   
    // alert(" getting user agent ");
  var userAgent =  navigator.userAgent.toLowerCase();
  //alert(" "+userAgent);
  
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  
  //alert("is chrome is set to: "+is_chrome);
  if (is_chrome)
  {
      //alert("you are using chrome.");
      /*
       *  paypalClickState
       *    should only have 2 states
       *    
       *    ready and dirty
       * 
       *    if the users browser is chrome, this hidden input variable will be checked.
       *    if the variable is found to be 'dirty' this function will reset it to 'ready'
       *    and then reload the page.
       */
      
      var paypalClickStateVal = "ready"; //document.getElementsByName("paypalClickState");
      
      var stateArray = document.getElementsByName("paypalClickState");
      
      for (i=0;i < stateArray.length;i++)
      {
        //alert(i+" "+stateArray[i].value);
        //document.getElementsByName("myInput")[i].value=''
        if (stateArray[i].value == "dirty")
        {
            paypalClickStateVal = "dirty";
        }
      }
      
      //alert("paypalClickStateVal is: "+paypalClickStateVal);
      if (paypalClickStateVal == "dirty")
      {
          for (i=0;i < stateArray.length;i++)
          {  
              document.getElementsByName("paypalClickState")[i].value='ready';
          }
          window.location.reload();
          //document.forms[3].submit();
          
      }
      else 
      { 
          //alert("not going to reload page.  setting paypalClickState to dirty and then going straight to paypal...");
          for (i=0;i < stateArray.length;i++)
          {  
              document.getElementsByName("paypalClickState")[i].value='dirty';
          }
      }
  }
}

function replaceMarketFromPhpThumb() {
    var images = document.getElementsByTagName('img'); 
    
    for(var i = 0; i < images.length; i++) {
        if (images[i].src.indexOf("https://www.therapysites.com") != -1 ) {
      images[i].src = images[i].src.replace("https://www.therapysites.com", "");
  }
        if (images[i].src.indexOf("http://www.therapysites.com") != -1 ) {
            images[i].src = images[i].src.replace("http://www.therapysites.com", "");
        }
    }
}

//document.ondomcontentready = function () {
document.addEventListener("DOMContentLoaded", function(event) {
      replaceMarketFromPhpThumb();
});