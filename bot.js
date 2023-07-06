
// Setup code

const MESSAGE_DELAY = 1000;
const observer = new MutationObserver(onNewMessage);
let HTMLPolicy;

if (window.trustedTypes) {
	HTMLPolicy = trustedTypes.createPolicy("HTMLPolicy", {
		createHTML: (string) => string,
	});
}

var currentSender = null;

function findButtonAndTextBox() {
	window.bot_sendbutton = document.getElementById("bot_sendbutton");
	window.bot_textbox = document.getElementById("bot_textbox");
	window.bot_messages = document.getElementById("bot_messages");

	if (!window.bot_sendbutton || !window.bot_textbox  || !window.bot_messages) return true;

	return false;
}

function addMessageListener() {
	observer.observe(window.bot_messages, { childList: true });
}

function simulateClick(element) {
	element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
	element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }))
}

function sendMessage(messagebody) {
	if (window.trustedTypes) {
		window.bot_textbox.innerHTML = HTMLPolicy.createHTML(messagebody);
	} else {
		window.bot_textbox.innerHTML = messagebody;
	}

	setTimeout(function() {
		window.bot_textbox.focus();
		simulateClick(window.bot_sendbutton);
	}, MESSAGE_DELAY);
}

function readMessage() {
	var result;
	result = window.bot_messages.children[window.bot_messages.children.length - 1].innerText.replaceAll("New", "").replaceAll("Now", "").replaceAll("\nEdited\n", "").split(",\n")[2];
	if (result) {
		currentSender = window.bot_messages.children[window.bot_messages.children.length - 1].innerText.replaceAll("New", "").replaceAll("Now", "").replaceAll("\nEdited\n", "").split(",\n")[0].replaceAll("\n", "");
		return result.replaceAll("\n", "");
	}
	
	result = window.bot_messages.children[window.bot_messages.children.length - 1].innerText.replaceAll("New", "").replaceAll("Now", "").replaceAll("\nEdited\n", "").split(",\n")[0];
	if (result) return result.replaceAll("\n", "");
	
	return false;
}

// Main code

function isPositiveInteger(value) {
    return /^\d+$/.test(value);
}

function onNewMessage() {
	// Run on new message
	// Check for slash, indicating command to bot
	const message = readMessage();
	if (Array.from(message)[0] == "/") {
		const command = message.substring(1).split(" ");

		// command[0] is the command name, command [1 to infinity] is for parameters to that command

		switch (command[0]) {
			case "help":
				sendMessage("Commands: /help, /dice (max), /hello");
				break;
			case "hello":
				// Say hello
				sendMessage("Hello!");
				break;
			case "dice":
				// Roll a dice with specified max, otherwise max is 6.
				var max;
				if (command[1] && isPositiveInteger(command[1])) {
					max = command[1];
				} else {
					max = 6;
				}

				const result = Math.round(Math.random() * max);
				sendMessage("You rolled a " + result + "!");
				break;
			default:
				sendMessage("I didn't understand that!");
				break;
	 }
	}
}

function main() {
	// Run on start
	console.log("Bot Started.");
	sendMessage("I am OkBot! Type /help for a list of commands.");
}

function startBot() {
	if (findButtonAndTextBox()) throw Error("Required elements not found.");
	addMessageListener();
	main();
}

function stopBot() {
	observer.disconnect();
}