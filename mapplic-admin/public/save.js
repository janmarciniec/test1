import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('Mapplic save script is running.');

const server = http.createServer((req, res) => {
	if (req.method === 'POST' && req.url === '/mapplic-save') {
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString(); // convert Buffer to string
		});
		req.on('end', () => {
			let parsed = JSON.parse(body);
			const fileName = parsed.target;
			delete parsed.target;

			// Sanitize and validate the file name
			const sanitizedFileName = fileName.replace(/[^a-z0-9_.-]/gi, '');
			if (sanitizedFileName !== fileName) {
				res.statusCode = 400;
				res.end('Invalid file name');
				return;
			}

			// Check if the file name is a valid file name
			if (path.isAbsolute(sanitizedFileName) || sanitizedFileName.includes('..') || sanitizedFileName.includes('/')) {
				console.log('Error: Invalid file name, it should not be a path to a different directory');
				res.statusCode = 400;
				res.end('Invalid file name, it should not be a path to a different directory');
				return;
			}

			fs.writeFile(`${sanitizedFileName}`, JSON.stringify(parsed), (err) => { //, null, '\t'
				if (err) throw err;
				console.log(`${sanitizedFileName} has been saved!`);
				res.end(`${sanitizedFileName} has been saved!`);
			});
		});
	} else {
		res.statusCode = 404;
		res.end();
	}
});

server.listen(3000);