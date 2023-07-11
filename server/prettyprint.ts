
export function prettyPrint(obj: any): string {
	try {
		return `<pre id="json">${JSON.stringify(obj, null, 2)}<code></code></pre>`;	
	}
	catch (err) {
		console.log(err);
		return "Error in JSON stringify.";
	}
}