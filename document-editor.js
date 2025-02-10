const statusDisplay = document.getElementById('status');
const titleElement = document.getElementById('document-title');
const BACKEND_URL = 'http://localhost:8080';

const quill = new Quill('#editor', {
	theme: 'snow'
});

const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('docId');

if (!documentId) {
	console.error('No document ID found in URL');
}

let websocket;

// Fetch document from backend
async function fetchDocument(documentId) {
	try {
		const response = await fetch(`${BACKEND_URL}/api/v1/documents/${documentId}`);
		if (!response.ok) {
			throw new Error('Failed to fetch document');
		}

		const documentData = await response.json();

		// Update the page with the fetched document
		titleElement.textContent = documentData.title;
		quill.root.innerHTML = documentData.content; // Set Quill editor content
		connectWebSocket();
	} catch (error) {
		console.error('Error fetching document:', error);
	}
}

function connectWebSocket() {
	websocket = new WebSocket(`ws://localhost:8080/documents/${documentId}/edit`);

	websocket.onopen = function (event) {
		updateWebSocketConnectionStatus('Connected to WebSocket Server!');
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
		updateWebSocketConnectionStatus('WebSocket Error: ' + event.type);
	};

	websocket.onclose = function (event) {
		updateWebSocketConnectionStatus('Disconnected from WebSocket Server');
		setTimeout(connectWebSocket, 2000);
	};
}

function updateWebSocketConnectionStatus(message) {
	statusDisplay.textContent = message;
}

quill.on('text-change', (delta, oldDelta, source) => {
	if (source !== 'user') return;

	if (websocket.readyState !== WebSocket.OPEN) {
		return;
	}

	try {
		const message = JSON.stringify(delta);
		websocket.send(message);
	} catch (error) {
		console.error('Error sending delta:', error);
	}
});

fetchDocument(documentId);
