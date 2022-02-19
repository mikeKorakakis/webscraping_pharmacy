const fs = require("fs");
const en = true;
let en_name = en ? "-en" : "";

fs.readFile(`./productDetails${en_name}.csv`, "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}
	// const data2 = data.split(",")

	const regex2 = /(https:\/\/www\.dizi-living\.gr\/.*jpg)/g;
	const regex1 = /(https:\/\/www\.dizi-living\.gr\/.*jpeg)/g;
	const regex3 = /(https:\/\/www\.dizi-living\.gr\/.*png)/g;
	// const match1 = data.match(regex1)
	// console.log(match1)
	const newData = data.replace(regex1, '"' + `${encodeURI(`$1`)}` + '"');
	const newData2 = newData.replace(regex2, '"' + `${encodeURI(`$1`)}` + '"');
	const newData3 = newData2.replace(regex3, '"' + `${encodeURI(`$1`)}` + '"');

	fs.writeFile(
		`./productDetailsFixed${en_name}.csv`,
		newData3,
		function (err) {
			if (err) return console.log(err);
		}
	);
});
