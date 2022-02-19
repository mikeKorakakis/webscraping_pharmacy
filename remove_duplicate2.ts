const fs = require("fs");
const en = false;
let en_name = en ? "-en" : "";


fs.readFile(`./productDetails${en_name}.csv`, "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	let urls = data.split("\r\n");
	console.log(urls.length);
	let unique_urls = [...new Set(urls)];
	console.log(unique_urls.length);
	// fs2.writeFile(
	// 	`./productDetails_nodup${en_name2}.csv`,
	// 	unique_urls.join("\r\n"),
	// 	function (err) {
	// 		if (err) return console.log(err);
	// 	}
	// );
});
