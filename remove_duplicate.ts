const fs = require("fs");
const en = true;
let en_name = en ? "-en" : "";


fs.readFile(`./productLinks${en_name}.csv`, "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	let urls = data.split("\r\n");
	console.log(urls.length);
	let unique_urls = [...new Set(urls)];
	console.log(unique_urls.length);
	fs.writeFile(
		`./productLinks_nodup${en_name}.csv`,
		unique_urls.join("\r\n"),
		function (err) {
			if (err) return console.log(err);
		}
	);
});
