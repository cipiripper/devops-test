#! /usr/bin/env node

const start = Date.now();
const maxRun = 10000;
const end = start + maxRun;

console.log("Start...");

while (true) {
	if (Date.now() > end) {
		break;
	}
}

console.log("End...");