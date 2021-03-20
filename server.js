const PORT = process.env.DEVOPS_TEST_PORT || 3000;

const express = require('express')
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const execSync = require('child_process').execSync;
const execFile = require('child_process').execFile;
const os = require('os');

const app = express();

function clearProcesses() {
	try {
		const dir = path.normalize(path.join(__dirname, 'pids'));
		const files = fs.readdirSync(dir);

		for (const pidFile of files) {

			fs.unlinkSync(path.join(dir, pidFile));
			try {
				process.kill(pidFile, "SIGKILL");
			} catch (error) { }
		}
	} catch (error) { }
}

function randomString(length, chars) {
	chars = chars || "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var result = "";
	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

app.use(logger("combined"));
app.use("/", express.static(path.join(__dirname, './public')));

app.get("/api/check", (req, res) => {
	res.send({
		status: "Working"
	});
});

app.get("/api/fill-disk", (req, res) => {
	const dir = path.normalize(path.join(__dirname, 'files'));
	const fileName = randomString(5) + '.bin';

	console.log(`Generating 1GB file: ${fileName}`);

	execSync(`mkdir -p ${dir}`);
	execSync(`dd if=/dev/zero of=${dir}/${fileName} bs=64M count=16`);
	console.log(`Generated 1GB file: ${fileName}`);

	res.send({
		status: `File created: ${dir}/${fileName}`
	});
});

app.get("/api/unfill-disk", (req, res) => {
	const dir = path.normalize(path.join(__dirname, 'files'));
	const files = fs.readdirSync(dir);

	for (const file of files) {
		console.log(`Removing file ${file}`);
		fs.unlinkSync(path.join(dir, file));
	}

	res.send({
		status: `Files removed: \n${files.join('\n')}`
	});
});

app.get("/api/fill-cpu", (req, res) => {
	const startProcesses = 2;
	const file = path.normalize(path.join(__dirname, './process.js'));
	const pidDir = path.join(__dirname, 'pids');
	execSync(`mkdir -p ${pidDir}`);

	for (let i = 0; i < startProcesses; i++) {
		const process = execFile(file);
		fs.writeFileSync(path.join(pidDir, process.pid+''), Buffer.from(process.pid+''));
	}

	res.send({
		status: `Started ${startProcesses} processes`
	});
});

app.get("/api/unfill-cpu", (req, res) => {
	clearProcesses();
	res.send({
		status: `Terminated all processes`
	});
});

app.listen(PORT, () => {
	console.log(`API available on :${PORT}`);
	console.log(`WebPage available on http://localhost:${PORT}`);
})