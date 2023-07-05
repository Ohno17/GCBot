
// Setup code

const MESSAGE_DELAY = 1000;
const observer = new MutationObserver(onNewMessage);

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
	window.bot_textbox.innerHTML = messagebody;
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

function onNewMessage() {
	// Run on new message

  // Check for slash, indicating command to bot
  if (Array.from(readMessage())[0] == "/") {
	 sendMessage("Above message is a message!");
  }
}

function main() {
	// Run on start
}

function startBot() {
	if (findButtonAndTextBox()) throw Error("Required elements not found.");
	addMessageListener();
	main();
}

function stopBot() {
	observer.disconnect();
}