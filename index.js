const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
var Queue = require("bull");
let scrapeProductLinksBool = false;
scrapeProductDetailsBool = true;
pages = 2;

var download = function (uri, filename, callback) {
	request.head(uri, function (err, res, body) {
		// console.log("content-type:", res.headers["content-type"]);
		// console.log("content-length:", res.headers["content-length"]);

		request(uri)
			.pipe(fs.createWriteStream("images/" + filename))
			.on("close", callback);
	});
};

const baseUrl = "https://zenone.car.gr";
const basePaginationUrl = "https://zenone.car.gr/parts/?pg=";
const paginationLinks = Array.from({ length: pages }, (_, i) => i).map(
	(num) => basePaginationUrl + (num + 1)
);

var productLinkQueue = new Queue("productLink queue", "redis://127.0.0.1:6379");
var productDetailsQueue = new Queue("models queue", "redis://127.0.0.1:6379");

const fetchHtml = async (url) => {
	try {
		const { data } = await axios.get(url);
		return data;
	} catch (error) {
		console.error("Error", error.message);
	}
	//   return cheerio.load(data)
};
const processProductLinks = async (url) => {
	const html = await fetchHtml(url);

	const selector = cheerio.load(html);
	var links = [];

	const searchResults = selector("a.row_clsfd");
	searchResults.each((idx, value) => {
		var link = selector(value).attr("href");
		links.push(baseUrl + link);
	});

	fs.appendFile("productLinks.csv", links.toString(), function (err) {
		if (err) return console.log(err);
	});
};

const scrapeProductLinks = () => {
	fs.writeFile("./productLinks.csv", "", function (err) {
		if (err) return console.log(err);
	});

	paginationLinks.forEach(async (url) => {
		console.log(url);
		productLinkQueue.add({ url });
	});
};

productLinkQueue.process(async (job) => {
	console.log("productLink job", job.data.url);
	await processProductLinks(job.data.url);
});

productLinkQueue.on("completed", function (job, result) {
	console.log("completed");
});

scrapeProductLinksBool && scrapeProductLinks();

const scrapeProductDetails = () => {
	// const url = "https://bikez.com/year/2021-motorcycle-models.php";
	fs.writeFile("./productDetails.csv", "", function (err) {
		if (err) return console.log(err);
	});

	fs.readFile("./productLinks.csv", "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		let urls = data.split(",");
		urls.forEach(async (url) => {
			console.log(url);
			productDetailsQueue.add({ url });
		});
	});
};

productDetailsQueue.process(async (job) => {
	console.log("productDetails job", job.data.url);
	await processProductDetails(job.data.url);
});

productDetailsQueue.on("completed", function (job, result) {
	console.log("completed");
});

const processProductDetails = async (url) => {
	// const siteUrl = "https://bikez.com";

	const html = await fetchHtml(url);

	const selector = cheerio.load(html);

	let product = {};

	const name =
		selector(".hidden-xs strong").first().text() &&
		selector(".hidden-xs strong")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const car_id =
		selector(
			".vpartial-page-container tr:contains('Νούμερο αγγελίας:') td:nth-of-type(2)"
		)
			.first()
			.text() &&
		selector(
			".vpartial-page-container tr:contains('Νούμερο αγγελίας:') td:nth-of-type(2)"
		)
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");

	const condition =
		selector(
			".vpartial-page-container tr:contains('Κατάσταση:') td:nth-of-type(2)"
		)
			.first()
			.text() &&
		selector(
			".vpartial-page-container tr:contains('Κατάσταση:') td:nth-of-type(2)"
		)
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const category =
		selector(
			".vpartial-page-container tr:contains('Κατηγορία:') td:nth-of-type(2)"
		)
			.first()
			.text() &&
		selector(
			".vpartial-page-container tr:contains('Κατηγορία:') td:nth-of-type(2)"
		)
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const manufacturer =
		selector(".vpartial-page-container span[itemprop='name']")
			.first()
			.text() &&
		selector(".vpartial-page-container span[itemprop='name']")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const model =
		selector(".vpartial-page-container span[itemprop='model']")
			.first()
			.text() &&
		selector(".vpartial-page-container span[itemprop='model']")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const fits = selector("li[itemprop='isAccessoryOrSparePartFor']");
	const fitsArr = [];
	fits.each(
		(index, item) =>
        selector(item)
        .text() &&
			fitsArr.push(
				selector(item)
					.text()
					.replace(/(\r\n|\n|\r)/gm, "")
					.replace(/\s+/g, " ")
			)
	);

	const aftermarket =
		selector(
			".vpartial-page-container tr:contains('Aftermarket ή εργοστασιακός κωδικός:') td:nth-of-type(2)"
		)
			.first()
			.text() &&
		selector(
			".vpartial-page-container tr:contains('Aftermarket ή εργοστασιακός κωδικός:') td:nth-of-type(2)"
		)
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const car_url =
		selector(
			".vpartial-page-container tr:contains('Σύνδεσμος:') td:nth-of-type(2)"
		)
			.first()
			.text() &&
		selector(
			".vpartial-page-container tr:contains('Σύνδεσμος:') td:nth-of-type(2)"
		)
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const description =
		selector("p#desc_message").first().text() &&
		selector("p#desc_message")
			.first()
			.text()
			.replace("Λιγότερα", "")
			.trim();

	const image = selector(".slick-img-hover img");
	const imageArr = [];
	image.each(
		(index, item) => selector(item) && imageArr.push(selector(item).attr("data-lazy"))
	);
	imageArr.forEach((item) => {
		download(
			"https:" + item,
			item.slice(item.lastIndexOf("/") + 1),
			function () {}
		);
	});

	product.car_id = car_id;
	product.name = name;
	product.condition = condition;
	product.category = category;
	product.manufacturer = manufacturer;
	product.model = model;
	product.fits = fitsArr;
	product.aftermarket = aftermarket;
	product.car_url = car_url;
	product.description = description;
	product.image = imageArr;

	// console.log(JSON.stringify(product))
	// console.log(product);

	fs.appendFile(
		"productDetails.csv",
		JSON.stringify(product),
		function (err) {
			if (err) return console.log(err);
		}
	);
};
scrapeProductDetailsBool && scrapeProductDetails();
