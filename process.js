#! /usr/bin/env node
const fs = require('fs');

const start = Date.now();
const maxRun = 60000 * 6;
const end = start + maxRun;

console.log("Start...");

while (true) {
	if (Date.now() > end) {
		break;
	}
}

console.log("Removing pid file...");
try {
	fs.unlinkSync('./pids/' + process.pid);
} catch (error) { }

console.log("End.");