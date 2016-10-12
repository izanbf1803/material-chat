var INVALID_WORDS = [	// Locked words... Example: "f*ck"
	"invalid"
];

var ESCAPE = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#x27;",
	"/": "&#x2F;"
}

function checkBadWords(text) {
	var rawText = text;
	text = text.toLowerCase().replace(/[^a-z]/g, "");
	var cleanText = "", last;
	for (i in text) {
		if (text[i] != last)
			cleanText += text[i];
		last = text[i];
	}
	for (i in INVALID_WORDS) {
		if (cleanText.indexOf(INVALID_WORDS[i]) != -1)
			return "Cannot use bad words like \"" + INVALID_WORDS[i] + "\"";
	}

	return true;
}

function checkValidNick(nick) {
	if (nick.length < 4)
		return "Nick too short"
	if (nick.length > 15)
		return "Nick too long"
	
	return checkBadWords(nick);
}

function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function randID() {
	return randomString(32);
}

module.exports = {
	checkBadWords: checkBadWords,
	checkValidNick: checkValidNick,
	randID: randID
};