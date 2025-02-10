const BACKEND_URL = 'http://localhost:8080';

const documentsList = document.getElementById('documents');

const getDocuments = async () => {
	const response = await fetch(`${BACKEND_URL}/api/v1/documents`);

	const data = await response.json();

	console.log(data);

	data.forEach((doc) => {
		const documentItem = document.createElement('li');
		const documentLink = document.createElement('a');
		documentLink.href = `document-editor.html?docId=${doc.id}`;
		documentLink.innerHTML = doc.title;
		documentItem.appendChild(documentLink);
		documentsList.appendChild(documentItem);
	});
};

getDocuments();
