const PORT = process.env.DEVOPS_TEST_PORT || 3000;

const express = require('express')
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const execSync = require('child_process').execSync;
const execFile = require('child_process').execFile;
const os = require('os')

const app = express();
let processes = [];

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
	if (processes.length == 0) {
		const cpus = os.cpus().length;
		const file = path.normalize(path.join(__dirname, './process.js'));

		for (let i = 0; i < cpus; i++) {
			const process = execFile(file);
			processes.push(process);
		}

		res.send({
			status: `Started ${cpus} processes`
		});
	} else {
		res.send({
			status: `There are processes already running. Restart the server or issue an /api/unfill-cpu call`
		});
	}
});

app.get("/api/unfill-cpu", (req, res) => {
	if (processes.length != 0) {
		for (const proc of processes) {
			console.log(`Killing process ${proc.pid}`);
			process.kill(proc.pid, "SIGKILL");
		}

		processes = [];

		res.send({
			status: `Terminated all processes`
		});
	} else {
		res.send({
			status: `There are no processes running. Issue an /api/fill-cpu call first`
		});
	}
});

app.listen(PORT, () => {
	console.log(`API available on :${PORT}`);
	console.log(`WebPage available on http://localhost:${PORT}`);
})