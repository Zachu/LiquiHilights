// ==UserScript==
// @name         LiquiHilights
// @namespace    http://zachu.fi/
// @downloadURL  https://github.com/Zachu/LiquiHilights/raw/master/liquihilights.user.js
// @version      0.4.0
// @description  Adds upcoming matches of selected teams to the header of Liquipedia main page
// @author       Jani Korhonen <zachu@thegroup.fi>
// @match        http://wiki.teamliquid.net/*/Main_Page
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Initialize
    var supportedWikis = ['dota2', 'overwatch', 'rocketleague'],
        wiki = window.location.href.split('/')[3],
        teams_key = 'teams.' + wiki,
        starredTeams = false,
        logLevels = [];


    if (supportedWikis.indexOf(wiki) === -1) {
        log(wiki + " not supported. Supported wikis are " + supportedWikis.join(', '), 'INFO');
        return;
    }

    // Define functions
    function log(message, level) {
        if (logLevels.indexOf(level) !== -1) {
            console.log('[' + level+ '] Liquihilights: ' + message);
        }
    }

    function get_matches() {
        return document.querySelectorAll('.main-page-banner ~ .row .infobox_matches_content');
    }

    function get_match_teams(match) {
        if (!(match instanceof Element)) {
            log("Parameter passed as match doesn't look like a dom element",'ERROR');
            return;
        }

        return match.querySelectorAll('.team-left, .team-right');
    }

    function get_team_url(team) {
        if (!(team instanceof Element)) {
            log("Parameter passed as team doesn't look like a dom element",'ERROR');
            console.log(team);
            return;
        }

        var a = team.querySelector('a:not([href="#"])');
        if (!(a instanceof Element)) {
            return false;
        }

        return a.getAttribute('href');
    }

    function is_starred_team(team) {
        var teamUrl = get_team_url(team),
            starredTeams = get_starred_teams();

        return starredTeams.indexOf(teamUrl) !== -1;
    }

    function is_starred_match(match) {
        var starred = false,
            starredTeams = get_starred_teams(),
            teams = get_match_teams(match);

        for (var i=0;i<teams.length;i++) {
            var team = teams[i];
            if (is_starred_team(team, starredTeams)) {
                starred = true;
            }
        }

        return starred;
    }

    function get_starred_matches() {
        var starredMatches = [],
            starredTeams = get_starred_teams(),
            matches = get_matches();

        for (var i=0;i<matches.length;i++) {
            var match = matches[i];
            if (is_starred_match(match, starredTeams)) {
                starredMatches.push(match);
            }
        }

        return starredMatches;
    }

    function add_star(team) {
        var position = '',
            starredTeams = get_starred_teams(),
            template = document.createElement('template'),
            starEl;

        var oldStar = team.querySelector('.liquiStar');
        if (oldStar instanceof Element) {
            oldStar.remove();
        }

        if (is_starred_team(team, starredTeams)) {
            // delStar
            if (team.classList.contains('team-left')) {
                position = 'afterbegin';
            } else {
                position = 'beforeend';
            }

            // Add star element
            template.innerHTML = '<a href="#" class="delStar liquiStar" style="margin:1em" title="Remove team from highlights"><span class="fa fa-fw fa-star"></span></a>';
            starEl = template.content.firstChild;
            team.insertAdjacentElement(position,starEl);

            // Add listener
            starEl.addEventListener('click', function(e) {
                var team = this.closest('td');
                del_starred_team(team);
                refresh_stars();
                refresh_banner();
                e.preventDefault();
            });
        } else if (get_team_url(team, starredTeams) !== false) {
            // addStar
            if (team.classList.contains('team-left')) {
                position = 'afterbegin';
            } else {
                position = 'beforeend';
            }

            // Add star element
            template.innerHTML = '<a href="#" class="addStar liquiStar" style="margin:1em" title="Add team to highlights"><span class="fa fa-fw fa-star-o"></span></a>';
            starEl = template.content.firstChild;
            team.insertAdjacentElement(position,starEl);

            // Add listener
            starEl.addEventListener('click', function(e) {
                var team = this.closest('td');
                add_starred_team(team);
                refresh_stars();
                refresh_banner();
                e.preventDefault();
            });
        } else {
            log("Team "+team.querySelector('.team-template-text').innerText+" doesn't seem to have a link. Skipping the team",'DEBUG');
            return;
        }
    }

    function add_starred_team(team) {
        var starredTeams = get_starred_teams();

        if (!is_starred_team(team)) {
            starredTeams.push(get_team_url(team));
            save_starred_teams(starredTeams);
            return true;
        }

        return false;
    }

    function del_starred_team(team) {
        var starredTeams = get_starred_teams();

        if (is_starred_team(team)) {
            starredTeams.splice(starredTeams.indexOf(get_team_url(team)), 1);
            save_starred_teams(starredTeams);
            return true;
        }

        return false;
    }

    function get_starred_teams() {
        if (starredTeams === false) {
            starredTeams = GM_getValue(teams_key);
        }
        if (!(starredTeams instanceof Array)) {
            starredTeams = [];
        }

        return starredTeams;
    }

    function save_starred_teams(teams) {
        starredTeams = teams;
        GM_setValue(teams_key, teams);
    }

    function refresh_stars() {
        var matches = get_matches();

        for(var i=0;i<matches.length;i++) {
            var match = matches[i],
                teams = get_match_teams(match);

            for (var j=0;j<teams.length;j++) {
                var team = teams[j];
                add_star(team);
            }
        }
    }

    function get_banner_matches() {
        return document.querySelectorAll('.liquiBanner .infobox_matches_content');
    }

    function prepare_banner() {
        var banner = document.querySelector('.main-page-banner');
        banner.classList.add('row');
        banner.innerHTML = '<div class="col-md-6 col-md-pull-6">' + banner.innerHTML + '</div>';
        banner.insertAdjacentHTML('afterbegin','<div class="col-md-6 col-md-push-6 liquiBanner"></div>');
    }

    function refresh_banner() {
        var banner = document.querySelector('.liquiBanner'),
            starredMatches = get_starred_matches();

        // Clear the banner of old matches
        while (banner.firstChild) {
            banner.removeChild(banner.firstChild);
        }

        // Add all matches to the banner
        for (var i=0;i<starredMatches.length;i++) {
            var starredMatch = starredMatches[i];
            banner.insertAdjacentElement('beforeend', starredMatch.cloneNode(true));
        }

        banner.insertAdjacentHTML('afterbegin','<h2 style="margin-top:0;padding-top:0;">Upcoming highlights</h2>');

        // Refresh banner star listeners
        var bannerMatches = get_banner_matches();
        for (var j=0;j<bannerMatches.length;j++) {
            var bannerMatch = bannerMatches[j],
                teams = get_match_teams(bannerMatch);

            for (var k=0;k<teams.length;k++) {
                var team = teams[k];
                add_star(team);
            }
        }
    }

    // Main
    prepare_banner();
    refresh_stars();
    refresh_banner();
})();
