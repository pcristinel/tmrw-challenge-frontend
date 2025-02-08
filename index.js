const statusDisplay = document.getElementById('status');

const quill = new Quill('#editor', {
	theme: 'snow'
});

let websocket;

function connectWebSocket() {
	websocket = new WebSocket('ws://localhost:8080/document-edit');

	websocket.onopen = function (event) {
		// TODO: Retrieve document content from server
		updateStatus('Connected to WebSocket Server!');
	};

	websocket.onmessage = function (event) {
		try {
			const delta = JSON.parse(event.data);
			if (delta) {
				quill.updateContents(delta);
			}
		} catch (error) {
			console.error('Error parsing delta:', error);
		}
	};

	websocket.onerror = function (event) {
		updateStatus('WebSocket Error: ' + event.type);
	};

	websocket.onclose = function (event) {
		updateStatus('Disconnected from WebSocket Server');
		setTimeout(connectWebSocket, 2000);
	};
}

function sendMessage() {
	if (!websocket && websocket.readyState !== WebSocket.OPEN) {
		console.error('Cannot send message. WebSocket is not open.');
		return;
	}

	const messageText = textarea.value;
	websocket.send(messageText);
	console.log('Sent: ' + messageText);
}

function updateStatus(message) {
	statusDisplay.textContent = message;
}

quill.on('text-change', (delta, oldDelta, source) => {
	if (source !== 'user') return;

	try {
		const message = JSON.stringify(delta);
		websocket.send(message);
	} catch (error) {
		console.error('Error sending delta:', error);
	}
});

connectWebSocket();
