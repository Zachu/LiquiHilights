// ==UserScript==
// @name         Liquipedia upcoming hilights
// @namespace    http://zachu.fi/
// @updateURL    https://git.zachu.fi/Zachu/LiquiHilights/raw/master/liquihilights.js
// @version      0.2
// @description  Adds upcoming matches of selected teams to the header of Liquipedia DotA2 front page
// @author       Jani Korhonen <zachu@thegroup.fi>
// @match        http://wiki.teamliquid.net/dota2/Main_Page
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==


(function() {
    'use strict';

    // Initialize data
    var teams=GM_getValue('teams'),
        hilight_matches=[];

    // Find teams in page
    $(".hide-in-not-liquiflow td.team-left, .hide-in-not-liquiflow td.team-right").each(function(i,e) {
        var table=$(e).closest("table"),
            href=$(e).find('a:not([href="#"])').attr('href'),
            delFavLink=$('<a href="#" class="delFav" title="Remove team from hilights"><span class="fa fa-fw fa-star"></span></a>'),
            addFavLink=$('<a href="#" class="addFav" title="Add team to hilights"><span class="fa fa-fw fa-star-o"></span></a>');

        // Team is in hilight list
        if ($.inArray(href,teams) !== -1) {
            if ($.inArray(table, hilight_matches) === -1) {
                hilight_matches.push(table);
            }

            if ($(e).find('a').length === 0) {
                return;
            } else if ($(e).hasClass('team-left')) {
                $(e).prepend(delFavLink.css('margin-right', '1em'));
            } else {
                $(e).append(delFavLink.css('margin-left', '1em'));
            }
        }
        else {
            if ($(e).find('a').length === 0) {
                return;
            } else if ($(e).hasClass('team-left')) {
                $(e).prepend(addFavLink.css('margin-right', '1em'));
            } else {
                $(e).append(addFavLink.css('margin-left', '1em'));
            }

        }
    });


    // Add matches to header
    $(".main-page-banner").children().wrapAll('<div class="col-md-6 col-md-pull-6">');
    $(".main-page-banner").addClass('row').prepend(
        $("<div>").addClass("col-md-6 col-md-push-6").append(
            $("<h2>Upcoming hilights</h2>").css("margin-top",0).css("padding-top",0)
        ).append(hilight_matches)
    );

    $('.addFav').on('click', function(e){
        e.preventDefault();
        var href=$(this).closest('td').find('a:not([href="#"])').attr('href'),
            teams=GM_getValue('teams');

        if ($.inArray(href,teams) === -1) {
            teams.push(href);
            GM_setValue('teams', teams);
            $(this).find('span.fa-star-o').removeClass('fa-star-o').addClass('fa-star');
        }
        return false;
    });

    $('.delFav').on('click', function(e){
        e.preventDefault();
        var href=$(this).closest('td').find('a:not([href="#"])').attr('href'),
            teams=GM_getValue('teams');

        if ($.inArray(href,teams) !== -1) {
            teams.splice($.inArray(href,teams),1);
            GM_setValue('teams', teams);
            $(this).find('span.fa-star').removeClass('fa-star').addClass('fa-star-o');
        }
        return false;
    });
})();
function add_fav_link(e) {
    var link='<a href="#" class="addFav" title="Add team to hilights"><span class="fa fa-fw fa-star-o"></span></a>';
    if ($(e).find('a').length === 0) {
        return;
    } else if ($(e).hasClass('team-left')) {
        $(e).prepend($(link).css('margin-right', '1em'));
    } else {
        $(e).append($(link).css('margin-left', '1em'));
    }
}
function del_fav_link(e) {
    var link='<a href="#" class="delFav" title="Remove team from hilights"><span class="fa fa-fw fa-star"></span></a>';
    if ($(e).find('a').length === 0) {
        return;
    } else if ($(e).hasClass('team-left')) {
        $(e).prepend($(link).css('margin-right', '1em'));
    } else {
        $(e).append($(link).css('margin-left', '1em'));
    }
}