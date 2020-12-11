#! /usr/bin/env node

const start = Date.now();
const maxRun = 60000 * 6;
const end = start + maxRun;

console.log("Start...");

while (true) {
	if (Date.now() > end) {
		break;
	}
}

console.log("End...");