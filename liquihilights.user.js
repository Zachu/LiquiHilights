// ==UserScript==
// @name         LiquiHilights
// @namespace    http://zachu.fi/
// @updateURL    https://git.zachu.fi/Zachu/LiquiHilights/raw/master/liquihilights.user.js
// @version      0.2.1
// @description  Adds upcoming matches of selected teams to the header of Liquipedia main page
// @author       Jani Korhonen <zachu@thegroup.fi>
// @match        http://wiki.teamliquid.net/*/Main_Page
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

var supportedWikis = ['dota2', 'overwatch', 'rocketleague'],
    wiki = window.location.href.split('/')[3],
    teams_key = 'teams.' + wiki,
    teams = GM_getValue(teams_key);

if (!(teams instanceof Array)) {
    teams = [];
}

(function() {
    'use strict';

    if ($.inArray(wiki, supportedWikis) === -1) {
        console.log("Liquilights: " + wiki + " not supported. Supported wikis are " + supportedWikis.join(', '));
        return;
    }

    // Find teams in page
    var hilight_matches = [];
    $(".main-page-banner ~ .row .team-left, .main-page-banner ~ .row .team-right").each(function(i, e) {
        var table = $(e).closest("table"),
            href = $(e).find('a:not([href="#"])').attr('href'),
            delFavLink = $('<a href="#" class="delFav" title="Remove team from hilights"><span class="fa fa-fw fa-star"></span></a>'),
            addFavLink = $('<a href="#" class="addFav" title="Add team to hilights"><span class="fa fa-fw fa-star-o"></span></a>');

        // Team is in hilight list
        if ($.inArray(href, teams) !== -1) {
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
        } else {
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
            $("<h2>Upcoming hilights</h2>").css("margin-top", 0).css("padding-top", 0)
        ).append(hilight_matches)
    );

    $('.addFav').on('click', function(e) {
        e.preventDefault();
        var href = $(this).closest('td').find('a:not([href="#"])').attr('href');

        if ($.inArray(href, teams) === -1) {
            teams.push(href);
            GM_setValue(teams_key, teams);
            $(this).find('span.fa-star-o').removeClass('fa-star-o').addClass('fa-star');
        }
        return false;
    });

    $('.delFav').on('click', function(e) {
        e.preventDefault();
        var href = $(this).closest('td').find('a:not([href="#"])').attr('href');
        if ($.inArray(href, teams) !== -1) {
            teams.splice($.inArray(href, teams), 1);
            GM_setValue(teams_key, teams);
            $(this).find('span.fa-star').removeClass('fa-star').addClass('fa-star-o');
        }
        return false;
    });
})();

function add_fav_link(e) {
    var link = '<a href="#" class="addFav" title="Add team to hilights"><span class="fa fa-fw fa-star-o"></span></a>';
    if ($(e).find('a').length === 0) {
        return;
    } else if ($(e).hasClass('team-left')) {
        $(e).prepend($(link).css('margin-right', '1em'));
    } else {
        $(e).append($(link).css('margin-left', '1em'));
    }
}

function del_fav_link(e) {
    var link = '<a href="#" class="delFav" title="Remove team from hilights"><span class="fa fa-fw fa-star"></span></a>';
    if ($(e).find('a').length === 0) {
        return;
    } else if ($(e).hasClass('team-left')) {
        $(e).prepend($(link).css('margin-right', '1em'));
    } else {
        $(e).append($(link).css('margin-left', '1em'));
    }
}