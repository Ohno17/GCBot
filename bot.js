
// Setup code

const MESSAGE_DELAY = 1000;
const observer = new MutationObserver(onNewMessage);
const advice = [
	"Advice"
];
let HTMLPolicy;

if (window.trustedTypes) {
	HTMLPolicy = trustedTypes.createPolicy("HTMLPolicy", {
		createHTML: (string) => string,
		createScriptURL: (string) => string,
    createScript: (string) => string,
	});
}

var anonymousPoll = true;
var currentSender = null;
var pollHistory = [];
var currentPoll = null;
var eggCounter = 0;

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

function selectCommand(command) {
	// command[0] is the command name, command [1 and beyond] is for parameters to that command

	switch (command[0]) {
		case "help":
			sendMessage("Commands:\n/help\n/dice (max)\n/hello\n/timer (seconds)\n/advice\n/source\n/egg\n/myname\n/createpoll (name) (option1) (option 2) ...\n/pollhelp\n/pollvote (option number)");
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

			const result = Math.round(Math.random() * (max - 1)) + 1;
			sendMessage("You rolled a " + result + "!");
			break;
		case "timer":
			// Set a timer in seconds.
			if (command[1] && isPositiveInteger(command[1])) {
				setTimeout(function () {
					sendMessage("Time's up!");
				}, command[1] * 1000);
			} else {
				sendMessage("I didn't understand that!");
			}
			
			break;
		case "advice":
			const selected = advice[Math.round(Math.random() * (advice.length - 1))];
			sendMessage(selected);
			break;
		case "source":
			sendMessage("https://github.com/Ohno17/GCBot");
			break;
		case "egg":
			eggCounter++;
			sendMessage("Egg counter: " + eggCounter);
			break;
		case "myname":
			sendMessage("Your name is: '" + currentSender + "'");
			break;
		case "anonpoll":
			if (currentPoll != null) {
				sendMessage("Cannot do this while a poll is active!");
				return;
			}

			if (command[1]) {
				anonymousPoll = (command[1] == "on" ? true : false)
			} else {
				sendMessage("Please enter the command properly!");
			}
			break;
		case "createpoll":
			if (currentPoll != null) {
				sendMessage("There is already an active poll!");
				return;
			}

			if (!command[1] || !command[2] || !command[3]) {
				sendMessage("The first three arguments must be: (polltitle) (option1) (option2). Arguments after that are optional.\nRemember that you can use '+' to signify a space.");
				return;
			}

			var polloptions = command.slice(2);
			var preparedoptions = [];

			for (var i = 0; i < polloptions.length; i++) {
				preparedoptions.push([polloptions[i].replaceAll("+", " "), 0, []]);
			}

			currentPoll = {title: command[1].replaceAll("+", " "), options: preparedoptions, voters: []}
			pollHistory.push(JSON.stringify(currentPoll));
			sendMessage("Made a poll: '" + currentPoll.title + "'\nUse '/pollhelp' for information about this poll!");

			break;
		case "pollhelp":
			if (currentPoll == null) {
				sendMessage("There is no active poll!");
				return;
			}

			var pollinfostring = "'" + currentPoll.title + "'\n\n";

			for (var i = 0; i < currentPoll.options.length; i++) {
				if (!anonymousPoll) {
					pollinfostring += "Option " + (i + 1) + ": '" + currentPoll.options[i][0] + "' " + currentPoll.options[i][1] + " Votes (Vote for this using '/pollvote " + (i + 1) + "')\n";
				} else {
					pollinfostring += "Option " + (i + 1) + ": '" + currentPoll.options[i][0] + "' (Vote for this using '/pollvote " + (i + 1) + "')\n";
				}
			}

			sendMessage(pollinfostring);
			break;
		case "pollvote":
			if (currentPoll == null) {
				sendMessage("There is no active poll!");
				return;
			}

			if (!command[1] || !isPositiveInteger(command[1])) {
				sendMessage("Please vote properly!");
				return;
			}

			const realOption = parseInt(command[1]) - 1;

			if (realOption > (currentPoll.options.length - 1) || !(parseInt(command[1]) > 0)) {
				sendMessage("This option doesn't exist!");
				return;
			}

			var voted = false;
			for (var i = 0; i < currentPoll.options.length; i++) {
				const voterindex = currentPoll.options[i][2].indexOf(currentSender);
				if (voterindex != -1) {
					voted = true;

					currentPoll.options[i][1]--;
					currentPoll.options[i][2].splice(voterindex, 1);

					currentPoll.options[realOption][1]++;
					currentPoll.options[realOption][2].push(currentSender);
				}
			}

			if (!voted) {
				currentPoll.voters.push(currentSender);
				currentPoll.options[realOption][2].push(currentSender);
				currentPoll.options[realOption][1]++;
			}
			
			pollHistory.push(JSON.stringify(currentPoll));
			if (anonymousPoll) { 
				sendMessage("Voted.");
			} else {
				sendMessage("Voted for: '" + currentPoll.options[realOption][0] + "'");
			}
			break;
		case "deletepoll":
			if (currentPoll == null) {
				sendMessage("There is no active poll!");
			} else {
				pollHistory.push(JSON.stringify(currentPoll));
				currentPoll = null;
				sendMessage("Poll deleted!");
			}
			break;
		default:
			sendMessage("I didn't understand that!");
			break;
	}
}

function onNewMessage() {
	// Run on new message
	// Check for slash, indicating command to bot
	const message = readMessage();
	console.log("MESSAGE RECIVED", "SENDER = " + currentSender);
	if (Array.from(message)[0] == "/") {
		const command = message.substring(1).split(" ");

		try {
			selectCommand(command);
		} catch(error) {
			console.error(error);
			stopBot();
		}

	}
}

function main() {
	// Run on start
	console.log("Bot Started.");
	sendMessage("I am OkBot! Type /help for a list of commands.");
}

function startBot(silence) {
	if (findButtonAndTextBox()) throw Error("Required elements not found.");

	addMessageListener();
	if (!silence) {
		main();
	}
}

function stopBot() {
	observer.disconnect();
}
