/*

 v 0.4
 - added data-attributes data-ga-cateogry data-ga-action data-ga-label
 - added tracking class for field ga-track-value and ga-label used for tracking values of fields for sending


 v 0.3
 - added function that checks outgoing links
 - added default value chekcs
 - removed legacy amadical events
 - file download events
 - button position in html (top/bottom/middle/footer/header)
 - data-ga-possiton attirbute for location of the button or link to identify the position

 v 0.2
 //added history cookie that stores 5 last visited pages



 */
//some vars setup, could be possed from outside
//but if they are not, then we define default values
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

}


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


jQuery(function($) {

        //pushing in history the current url

        //TODO local storage
        push_history(get_title());




        //tracking form values, that needs to be tracked
        //TODO local storage
        $(value_tracking_selector).change(function(){
            var self = $(this);
            var id = self.attr("id");
            if(id){
                tracked_form_values[id] = self.val();
            }
        });

        $(click_tracking_elements).on("click",function(){

            var self = $(this);
            var category = self.data("gaCategory");
            var action = self.data("gaAction");
            var label = self.data("gaLabel");
            var value = self.data("gaValue");
            if (!category){
                category = self.prop("tagName");
            }
            if (!action){
                action = "Clicked";
            }
            if (!label){
                label = get_link_text(self);
            }
            if (!value){
                value = null;
            }

            send_event(category, action, label, value)
        });


        //GRAVITY FORMS SUCCESS EVENTS
        //TODO gravity forms reload
        $(document).on("gform_confirmation_loaded", function (e, form_id) {
            // code to run upon successful form submission

            //getting from history last two pages
            var this_url =pop_history();
            var prev_url =pop_history();

            // from where user arrived?
            var source = prev_url;
            if (source.length==0){
                source = "Source : Direct ";
            } else {
                source =" Source : "+source;
            }

            //sending event some special cases can be here defined
            switch(form_id){

                default:
                    var label ="";
                    label = lang;

                    //starting of the input field id/name
                    //gravity forms has all input fields starting wint input_{id of form}
                    var input_id = "input_"+form_id;
                    var tracked_value ="";

                    for(x in tracked_form_values){
                        if (x.indexOf(input_id)>-1){
                            tracked_value+=" "+tracked_form_values[x];
                        }
                    }

                    tracked_value = tracked_value.trim();

                    if (tracked_value.length>0){
                        label = tracked_value;
                    }

                    send_event(get_title()+' form sent', source, label);

                    break;
            }


            // puting back urls in history
            if (prev_url.length>0){
                push_history(prev_url);
            }
            if (this_url.length>0){
                push_history(prev_url);
            }

        });


        //EMAIL ADDRESS LINKS CLICKED
        $('a[href^="mailto:"]').click(function(){

            var self = $(this);
            var selected_email = $(this).text();

            var click_position=get_element_position(self);

            send_event('Contants', "Email address clicked"+ click_position, selected_email.trim());

        })


        //PHONE NUMBERS CLICKED
        $('a[href^="tel:"]').click(function(){
            //4.a 4.b
            var self = $(this);
            var selected_phone = self.attr("href");
            selected_phone = selected_phone.replace("tel:","");
            var click_position=get_element_position(self);

            send_event("Contacts", "Phone number clicked "+ click_position, selected_phone.trim());

        });


        //Newsletter - add event for successfully subscribing to the newsletter
        if($('.mc4wp-success').length>0){
            send_event("Contacts","Newsletter subscribed", lang);
        }




        //Links tracking
        $('a').each(function(){
            var self = $(this);
            var url=self.attr("href");


            //have to skip emails and the phone cause they already done by other click
            if (typeof url!=="undefined" &&
                url.length>0 &&
                url.indexOf("tel:")<0 &&
                url.indexOf("mailto:")<0){

                //checking social links
                var social_link_click = false;
                var social_links = get_social_profile_links();
                for (x in social_links){
                    if (url.indexOf(social_links[x].url)!=-1){
                        //1.. Social buttons - add events for clicking the social buttons
                        self.click(function(){
                            var self = $(this);
                            var url="";
                            url = self.attr("href");
                            var text = get_link_text(self);
                            if (text.length==0){
                                var social_links = get_social_profile_links();
                                for (x in social_links) {
                                    if (url.indexOf(social_links[x].url)!=-1) {
                                        text = social_links[x].title;
                                        break;
                                    }
                                }
                            }
                            send_event("Contacts",'Social button clicked',text);
                            social_link_click = true;

                        });
                    }
                }

                //Contact buttons checked
                var buttons_clicked = false;
                if (!social_link_click){
                    if(self.hasClass("button")){
                        if (remove_params_from_url(url) == contact_page_link){
                            self.click(function(){
                                var text = get_link_text(self);
                                send_event("Contacts",'Contact us button clicked', text.trim()+' button clicked');
                            });
                            buttons_clicked=true;
                        }
                    }
                }


                //checking file downloads
                if (!social_link_click && !buttons_clicked){
                    //checkig it is a file download
                    //checking by extension
                    if (is_file(url)){
                        self.click(function(){
                            var text = get_link_text(self);
                            send_event("File download",'File download clicked', text);
                        });
                    }
                }


                //checking special links that has ga parameters
                if(!social_link_click && !buttons_clicked){
                    //special tags
                    if(self.data("gaCategory") && self.data("gaAction") && self.data("gaLabel")){
                        buttons_clicked=true;
                        self.click(function(){
                            send_event(self.data("gaCategory"), self.data("gaAction"), self.data("gaLabel"));
                        });

                    }
                }


                //outgoing links
                if (!social_link_click && !buttons_clicked){
                    //if nto social link
                    //then we test if its outgoing link
                    if (is_outgoing_url(url)){
                        self.click(function(){
                            var text = get_link_text(self);
                            send_event("Outgoing links",'Outgoing link clicked', text.trim()+' button clicked');
                        });
                    }
                }


            }

        });




        //2.. Search bar - add event for using the search bar
        $('#mobile-search, #desktop-search, #tablet-search').submit(function( event ) {
            var self = $(this);
            var searchterm = self.find('input[name=search]').first().val();
            send_event("Search bar","Serch term sent",searchterm.trim());
        });


        $(".firefox-link").on("click",function(){
            send_event("Install link","Firefox clicked");
        });

    }
);
