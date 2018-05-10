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
