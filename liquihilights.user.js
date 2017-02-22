// ==UserScript==
// @name         LiquiHilights
// @namespace    http://zachu.fi/
// @downloadURL  https://github.com/Zachu/LiquiHilights/raw/master/liquihilights.user.js
// @version      0.3.4
// @description  Adds upcoming matches of selected teams to the header of Liquipedia main page
// @author       Jani Korhonen <zachu@thegroup.fi>
// @match        http://wiki.teamliquid.net/*/Main_Page
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// @require      https://code.jquery.com/jquery-3.1.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Initialize
    var supportedWikis = ['dota2', 'overwatch', 'rocketleague'],
        wiki = window.location.href.split('/')[3],
        teams_key = 'teams.' + wiki,
        teams = GM_getValue(teams_key),
        hilight_matches = [];

    if (!(teams instanceof Array)) {
        teams = [];
    }

    if (supportedWikis.indexOf(wiki) === -1) {
        console.log("Liquilights: " + wiki + " not supported. Supported wikis are " + supportedWikis.join(', '));
        return;
    }

    // Define functions
    function is_favorited(teamHref) {
        return teams.indexOf(teamHref) !== -1;
    }

    function is_hilighted(matchTable) {
        return hilight_matches.indexOf(matchTable) !== -1;
    }

    function add_links(teamTd, teamHref) {
        var add = '<a href="#" class="addFav" title="Add team to highlights"><span class="fa fa-fw fa-star-o"></span></a>',
            del = '<a href="#" class="delFav" title="Remove team from highlights"><span class="fa fa-fw fa-star"></span></a>',
            link;

        if (is_favorited(teamHref)) {
            link = del;
        } else {
            link = add;
        }

        if ($(teamTd).hasClass('team-left')) {
            $(teamTd).prepend($(link).css('margin-right', '1em'));
        } else {
            $(teamTd).append($(link).css('margin-left', '1em'));
        }
    }

    // Find teams in page. This is the easiest way I could figure to get all match rowstables
    $(".main-page-banner ~ .row .team-left, .main-page-banner ~ .row .team-right").each(function(i, teamTd) {
        var matchTable = $(teamTd).closest("table"),
            teamHref = $(teamTd).find('a:not([href="#"])').attr('href');

        if (typeof teamHref === 'undefined') {
            // Team is some sort of TBA or something. Skip
            return;
        }

        // Add stars/unstars
        add_links(teamTd, teamHref);

        // Match should be highlighted
        if (is_favorited(teamHref) && !is_hilighted(matchTable)) {
            hilight_matches.push(matchTable);
        }
    });

    // Add matches to header
    var matchesEl = $('<div class="liquihilights">');
    hilight_matches.forEach(function(matchTable) {
        matchesEl.append(matchTable.clone());
    });

    $(".main-page-banner").children().wrapAll('<div class="col-md-6 col-md-pull-6">');
    $(".main-page-banner").addClass('row').prepend(
        $("<div>").addClass("col-md-6 col-md-push-6").append(
            $("<h2>Upcoming highlights</h2>").css("margin-top", 0).css("padding-top", 0)
        ).append(matchesEl)
    );

    $('.addFav').on('click', function(e) {
        e.preventDefault();
        var href = $(this).closest('td').find('a:not([href="#"])').attr('href');

        if (!is_favorited(href)) {
            teams.push(href);
            GM_setValue(teams_key, teams);
            $(this).find('span.fa-star-o').removeClass('fa-star-o').addClass('fa-star');
        }
        return false;
    });

    $('.delFav').on('click', function(e) {
        e.preventDefault();
        var href = $(this).closest('td').find('a:not([href="#"])').attr('href');
        if (is_favorited(href)) {
            teams.splice(teams.indexOf(href), 1);
            GM_setValue(teams_key, teams);
            $(this).find('span.fa-star').removeClass('fa-star').addClass('fa-star-o');
        }
        return false;
    });
})();
