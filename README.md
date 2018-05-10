# google analytics base events for websites
The js code, that ads the basic events needed for tracking some actions on the page. Like clikcing on phone links, emails, cta buttons and other. Mostly used in wordpress site development, and there is wordpress specific code, but could be used also in non wordrpess sites.


#Change log
== v 0.5 ==
 - removed legacy code, now this is exported version of splited files. The generated varsion comes from wp plugin. https://github.com/lauzis/google-analytics-events-wordpres-plugin


== v 0.4 ==
 - added data-attributes data-ga-cateogry data-ga-action data-ga-label
 - added tracking class for field ga-track-value and ga-label used for tracking values of fields for sending


== v 0.3 ==
 - added function that checks outgoing links
 - added default value chekcs
 - removed legacy amadical events
 - file download events
 - button position in html (top/bottom/middle/footer/header)
 - data-ga-possiton attirbute for location of the button or link to identify the position

== v 0.2 ==
 //added history cookie that stores 5 last visited pages


