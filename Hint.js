/*
Hint
Sends a location ping and hint for Roll20 games

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var Hint = Hint || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.1',
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: #591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        character: 'font-variant: small-caps; color: #591209; font-size: 1.25em;',
        code: 'font-family: "Courier New", Courier, monospace; padding-bottom: 6px;'
    },

    checkInstall = function () {
        log('--> Hint v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'Hint v' + version + ' loaded at ' + d.toLocaleTimeString(), 'GM');
		}
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!hint')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1]) {
                commandHint(msg);
			} else {
				commandHelp();
			}
		}
    },

    commandHint = function (msg) {
		// Send hint with ping to designated players
		if (!msg.selected || msg.selected.length > 1) {
			showDialog('Hint Error', 'You must select one token. No more, no less.', 'GM');
			return;
		}

		var location_token = getObj(msg.selected[0]._type, msg.selected[0]._id), args = msg.content.split(/\s*\-\-/i);
        var hint = '', char_ids = [], re_ping = false;

        if (location_token) {
            _.each(args, function (arg) {
                if (arg.startsWith('msg|')) {
                    hint = arg.replace('msg|', '');
                }
                if (arg.startsWith('to|')) {
                    var char_list = arg.replace('to|', '').split(/\s*\,\s*/);
                    char_ids = getIDsFromNames(char_list, location_token.get('pageid'));
                }
                if (arg.startsWith('re-ping')) {
                    re_ping = true;
                }
            });

            if (_.size(char_ids) > 0 && hint != '') {
                var players = [];
                _.each(char_ids, function (char_id) {
                    var char = getObj('character', char_id);
                    var tmp_players = char.get('controlledby');
                    if (tmp_players != 'all') players.push(tmp_players.split(','));
                });
                players = _.without(_.unique(_.flatten(players)), 'all');

                if (!re_ping) {
                    var names = [];
                    _.each(char_ids, function (char_id) {
                        var name = getNameFromID(char_id);
                        var subtitle = '<div style=\'' + styles.character + '\'>' + name + '</div>';
                        names.push(name);
                        showDialog('', subtitle + hint, name);
                    });
                    var message = '"' + hint + '" was whispered to ' + grammaticallyCorrect(names) + '.<br><a style=\'' + styles.button + '\' href="' + msg.content + ' --re-ping">Re-Ping</a>';
                    showDialog('Hint Delivered', message, 'GM');
                }
                sendPing(location_token.get('left'), location_token.get('top'), location_token.get('pageid'), null, true, players);
            } else {
                showDialog('Hint Error', 'You must provide a hint message and at least one valid recipient.', 'GM');
            }
        } else  {
            showDialog('Hint Error', 'You must select a valid token.', 'GM');
        }
	},

    commandHelp = function () {
        // Show help dialog
        var message = 'Command format:<br>';
        message += '<div style=\'' + styles.code + '\'>!hint --msg|&lt;message_text&gt; --to|&lt;character_names&gt;</div>';
        message += '<b style=\'' + styles.code + '\'>&lt;message_text&gt;:</b><br>The text of your message. No double dashes allowed.<br><br>';
        message += '<b style=\'' + styles.code + '\'>&lt;character_names&gt;:</b><br>Comma-delimited list of character names. May be partial names. Capitalization ignored.<br><br>';
        message += 'You <b>must</b> have a token selected for the ping location reference.<br><br>';
        message += 'See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/Hint">documentation</a> for complete instructions.';
        showDialog('Help Menu', message, 'GM');
    },

    getIDsFromNames = function (names, page_id) {
        var chars = [];
        var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
        _.each(names, function (name) {
            var char = _.find(allChars, function (x) { return x.get('name').toLowerCase().search(name.toLowerCase()) > -1; });
            if (char) chars.push(char.get('id'));
        });
        return chars;
    },

    getNameFromID = function (char_id) {
        var name = 'Unknown Character', char = getObj('character', char_id);
        if (char) name = char.get('name');
        return name;
    },

	grammaticallyCorrect = function (names) {
		// Return a pretty (grammatically speaking) string of names for dialog
		var result = '', joiner = ' ';
		if (names.length > 1) names[names.length-1] = 'and ' + names[names.length-1];
		if (names.length > 2) joiner = ', '
		result = names.join(joiner);
		return result;
	},

    showDialog = function (title, content, whisperTo = '') {
        // Outputs a pretty box in chat with a title and content
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('Hint', whisperTo + body, null, {noarchive:(whisperTo == 'GM')});
        } else  {
            sendChat('Hint', body);
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    Hint.checkInstall();
    Hint.registerEventHandlers();
});
