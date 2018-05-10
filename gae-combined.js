if (typeof DEBUG_MODE === "undefined"){
    var DEBUG_MODE = true;
}

if (typeof contact_page_link === "undefined"){
    var contact_page_link="";
}

//TODO if not defined have to read body class?
// fallback to body class
if (typeof lang === "undefined"){
    var lang="en";
}

var tracked_form_values = [];

//gravity forms class for tracking value and sending it to when form is succesfull
var value_tracking_selector = '.ga-track-value select, .ga-track-value input, select.ga-track-value, input.ga-track-value';

var click_tracking_elements = '.kad-btn, .ga-track-click, .yop_poll_vote_button, .btn-cta, .cta-btn';

var HOST = document.location.hostname;


var IS_GA = false;

/*
 that could be possible to determine
 if top or bottom element clicked
 getting the position of the element
 */
function get_element_position(jq_object){

    var position = "";
    position = jq_object.data("gaPosition");
    if (position.length>0){
        return position;
    }

    // fallback function if data-ga-position not defined
    jq_object.parentsUntil('body').each(function(){
        var self = this;
        switch(self.nodeName){
            case "HEADER":
            case "header":
                position="Header";
                break;

            case "FOOTER":
            case "footer":
                position="Footer";
                break;

            case "ASIDE":
            case "aside":
                position="Sidebar";
                break;
        }
    });


    return position;

}


//helper function to check if link is outgoing link
function is_outgoing_url(url){

    if (url.indexOf(HOST)>0){
        return false;
    } else {
        if (url.indexOf("/")==1){
            return false;
        } else {
            return true;
        }

    }
}


//helper function (php in_array)
function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}


//helper function that check if the link is downlodable file
function is_file(url){
    var file_extension = url.split('.').pop();
    if (file_extension.length<4){
        return contains(file_extension,get_valid_file_extensions());
    }
    return false;
}


//the list of downloadable files
function get_valid_file_extensions(){
    return ['.pdf','.doc','.docx','.zip','.xls','.xslx'];
}


//function that gets title of the sectiom/page
function get_title($){

    $ = jQuery;
    var title = "";
    if ($("h1").length>0){
        title  = $("h1").first().text();
    }
    if (title.length==0){
        title = document.title;
        title = title.split("-");
        title = title.shift();
    }

    if (title.length==0){
        if ($("h2").length>0){
            title  = $("h2").first().text();
        }
    }

    if (title.length==0){
        title = document.location.href;
    }

    title = title.trim();
    return title;
}

//
function remove_params_from_url(oldURL) {
    var index = 0;
    var newURL = oldURL;
    index = oldURL.indexOf('?');
    if(index == -1){
        index = oldURL.indexOf('#');
    }
    if(index != -1){
        newURL = oldURL.substring(0, index);
    }
    return newURL;
}


//social profile links defined
function get_social_profile_links()
{
    var social_links = [];
    social_links.push({"url":"facebook.com","title":"Facebook"});
    social_links.push({"url":"twitter.com","title":"Twitter"});
    social_links.push({"url":"linkedin.com","title":"LinkedIn"});
    social_links.push({"url":"youtube.com","title":"Youtube"});
    return social_links;

}


//geting the link text / label for the ga event
function get_link_text(jquery_obj){

    var text=jquery_obj.text();

    //fallback / overwrite
    if(jquery_obj.data("gaLabel")){
        text=jquery_obj.data("gaLabel");
        return text.trim();
    }

    if (jquery_obj.attr("title")){
        text = jquery_obj.attr("title");
        return text.trim();
    }

    if(jquery_obj.attr("alt")){
        text = jquery_obj.attr("alt");
        return text.trim();
    }

    if(text){
        return text;
    }

    if(jquery_obj.attr("value")){
        text = jquery_obj.attr("value");
        return text.trim();
    }



    return "unknow";
}


//cookie function to track event history
// for example, we want to se trough wich page
//was converted (filled form)
function setCookie(cname, cvalue, exdays) {
    exdays = exdays || 1;
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function json2array(json){
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        result.push(json[key]);
    });
    return result;
}


//TODO UPDATE HIOSTORY PUSH
//NOW ITS MORE as  TITLE PUSH
function push_history(url){

    // storring last 5 urls
    var allowed_lenght =3;
    url = url || document.location.href;
    var history_urls =getCookie("history");
    if (history_urls.length>0){
        try {
            var tmp = JSON.parse(history_urls);
            history_urls = json2array(tmp);
            if (url==history_urls[history_urls.length-1]){
                //the last url in history is the same url
                // probabbly user refreshed page
                return;
            }
        } catch(e) {
            return;
        }
    } else {
        history_urls = [];
    }

    //removing if more history than expo
    if (history_urls.length>allowed_lenght){
        history_urls.shift();
    }

    history_urls.push(url);
    setCookie("history",JSON.stringify(history_urls));

}


function pop_history(){

    var history_urls = json2array(JSON.parse(getCookie("history")));
    var url="";
    if (history_urls.length>0){
        url = history_urls.pop();
    }
    setCookie("history",JSON.stringify(history_urls));
    return url;
}


function send_event(category, action, label, value){

    if(IS_GA){
        ga('send', 'event',category, action, label, value );
    }

    if (!IS_GA){
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    }

    if (DEBUG_MODE){
        console.log('send', 'event', category, action, label, value);
    }

};


jQuery(function($) {

  //pushing in history the current url
  //TODO local storage
  push_history(get_title());

  //Links tracking
  $('a').each(function(){
      var self = $(this);
      var url=self.attr("href");
      if(!self.hasClass("gae-events")){
        //[gae-custom-links]

        //[gae-social-links]

        //[gae-file-downloads]

        //[gae-outgoing-links]

      }
  });


  //[gae-form-tracking-gravity]

  //[gae-form-tracking]

  //[gae-custom_element_tracking]


});
