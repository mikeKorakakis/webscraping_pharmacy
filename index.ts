const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
var Queue = require("bull");
const en = true;
let en_name = en ? "-en" : "";
axios.defaults.withCredentials = true;
let createCategoryLinkFileBool = false,
	scrapeSubcategoryLinkFileBool = false,
	scrapeProductLinksBool = false,
	scrapeProductDetailsBool = true;

let count = 0;
if (createCategoryLinkFileBool) count++;
if (scrapeSubcategoryLinkFileBool) count++;
if (scrapeProductLinksBool) count++;
if (scrapeProductDetailsBool) count++;

if (count !== 1) throw new Error("only one selection can be true");
const pages = 2;

var productLinkQueue = new Queue("productLink queue", "redis://127.0.0.1:6379");
var subcategoryLinkQueue = new Queue(
	"subcategoryLink queue",
	"redis://127.0.0.1:6379"
);
var productDetailsQueue = new Queue(
	"productDetail queue",
	"redis://127.0.0.1:6379"
);

var download = function (uri, filename, callback) {
	request.head(uri, function (err, res, body) {
		// console.log("content-type:", res.headers["content-type"]);
		// console.log("content-length:", res.headers["content-length"]);

		request(uri)
			.pipe(fs.createWriteStream("images/" + filename))
			.on("close", callback);
	});
};

const fetchHtml = async (url) => {
	const cookie_for_data = en ? "language=en-gb" : "language=el-gr";
	try {
		const { data } = await axios.get(url, {
			headers: {
				Cookie: cookie_for_data,
			},
		});
		return data;
	} catch (error) {
		console.error("Error", error.message);
	}
	//   return cheerio.load(data)
};

const baseUrl = "https://www.dizi-living.gr";
const basePaginationUrl = "https://zenone.car.gr/parts/?pg=";
// const paginationLinks = Array.from({ length: pages }, (_, i) => i).map(
// 	(num) => basePaginationUrl + (num + 1)
// );

const createCategoryLinkFile = () => {
	fs.writeFile(`./categoryLinks${en_name}.csv`, "", function () {
		console.log("deleted categoryLinks file");
	});

	fs.readFile("./categories.csv", "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		let urls = data.split(",");
		console.log(urls);
		urls.forEach(async (url) => {
			if (url)
				fs.appendFile(
					`./categoryLinks${en_name}.csv`,
					`${baseUrl}/${url},`,
					function (err) {
						if (err) return console.log(err);
					}
				);
		});
	});
};

createCategoryLinkFileBool && createCategoryLinkFile();

const scrapeSubcategoryLinkFile = () => {
	fs.writeFile(`./subcategoryLinks${en_name}.csv`, "", function () {
		console.log("deleted subcategoryLinks file");
	});

	fs.readFile(`./categoryLinks${en_name}.csv`, "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		let urls = data.split(",");
		console.log(urls);
		urls.forEach(async (url) => {
			if (url) console.log(url);
			if (url)
				fs.appendFile(
					`subcategoryLinks${en_name}.csv`,
					url + "\r\n",
					function (err) {
						if (err) return console.log(err);
					}
				);
			if (url) subcategoryLinkQueue.add({ url });
		});
	});
};

const processSubcategoryLinks = async (url) => {
	console.log("processing category link " + url);

	const html = await fetchHtml(url);

	const selector = cheerio.load(html);
	var links = [];

	const searchResults = selector("div.refine-categories a");
	searchResults.each((idx, value) => {
		var link = selector(value).attr("href");
		console.log("link", link);
		if (link) subcategoryLinkQueue.add({ url: link });
		links.push(link);
	});

	if (links.length > 0)
		fs.appendFile(
			`subcategoryLinks${en_name}.csv`,
			links.join("\r\n") + "\r\n",
			function (err) {
				if (err) return console.log(err);
			}
		);
};

subcategoryLinkQueue.process(async (job) => {
	console.log("subcategoryLink job", job.data.url);
	await processSubcategoryLinks(job.data.url);
});

subcategoryLinkQueue.on("completed", function (job, result) {
	console.log("completed");
});

scrapeSubcategoryLinkFileBool && scrapeSubcategoryLinkFile();

const scrapeProductLinks = () => {
	console.log("scraping product links");
	fs.writeFile(`./productLinks${en_name}.csv`, "", function (err) {
		if (err) return console.log(err);
	});

	fs.readFile(`./subcategoryLinks${en_name}.csv`, "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		let urls = data.split("\r\n");
		console.log(urls);
		urls.forEach(async (url) => {
			console.log(url);
			if (url) productLinkQueue.add({ url: `${url}?limit=4000` });
		});
	});
};

const processProductLinks = async (url) => {
	console.log("processing product link " + url);
	const html = await fetchHtml(url);

	const selector = cheerio.load(html);
	var links = [];

	const searchResults = selector("a.product-img");
	searchResults.each((idx, value) => {
		var link = selector(value).attr("href");
		console.log(link);
		links.push(link.replace("?limit=4000", "").replace("&limit=4000", ""));
	});

	fs.appendFile(
		`productLinks${en_name}.csv`,
		links.join("\r\n") + "\r\n",
		function (err) {
			if (err) return console.log(err);
		}
	);
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
	fs.writeFile(
		`./productDetails${en_name}.csv`,
		'ID,Τύπος,"Κωδικός προϊόντος",Όνομα,Δημοσιευμένο,"Είναι προτεινόμενο;","Ορατότητα στον κατάλογο","Σύντομη περιγραφή",Περιγραφή,"Ημερομηνία έναρξης εκπτωτικής τιμής","Ημερομηνία λήξης εκπτωτικής τιμής","Κατάσταση φόρου","Κατηγορία φόρου","Σε απόθεμα;",Απόθεμα,"Χαμηλή ποσότητα αποθέματος","Να επιτρέπονται λίστες αναμονής;","Μεμονωμένη πώληση;","Βάρος (kg)","Μήκος (cm)","Πλάτος (cm)","Ύψος (cm)","Να επιτρέπονται αξιολογήσεις πελάτη;","Σημείωση αγοράς","Τιμή προσφοράς","Κανονική τιμή",Κατηγορίες,Ετικέτες,"Κατηγορία αποστολής",Εικόνες,"Όριο μεταφόρτωσης","Ημέρες λήξης μεταφόρτωσης",Γονέας,"Ομαδοποιημένα προϊόντα","Αύξηση πωλήσεων","Προϊόντα παράλληλης πώλησης","Εξωτερικό URL","Κείμενο κουμπιού",Θέση,"Όνομα ιδιότητας 1","Τιμή(ές) ιδιότητας 1","Ιδιότητα 1 ορατή","Ιδιότητα 1 καθολική","Όνομα ιδιότητας 2","Τιμή(ές) ιδιότητας 2","Ιδιότητα 2 ορατή","Ιδιότητα 2 καθολική"np,SKU,product_link\r\n',
		function (err) {
			if (err) return console.log(err);
		}
	);

	fs.readFile(`./productLinks_nodup.csv`, "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		let urls = data.split("\r\n");
		urls.forEach(async (url) => {
			console.log(url);
			if (url) productDetailsQueue.add({ url });
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

let id = 0;
const processProductDetails = async (url) => {
	console.log("processing product detail link " + url);

	// const siteUrl = "https://bikez.com";

	const html = await fetchHtml(encodeURI(url));

	const selector = cheerio.load(html);
	let product = "";
	const ID = ++id;
	console.log("ID: ", ID);
	const type = "simple";
	const model = "";

	const name =
		selector("h1.title.page-title>span").first().text() &&
		selector("h1.title.page-title>span")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ")
            .replace(/\"/g, "'");

	const published = 1;
	const suggested = 0;
	const visibility = "visible";
	const short_description = "";

	let description =
		selector("div.block-content ").first().html() &&
		selector("div.block-content")
			.first()
			.html()
			.trim()
			.replace(/\s+/g, " ")
			.replace(/style="([^"]*)"/g, "")
			.replace(/"/g, `'`)
			.replace(/<font face='Verdana'>/g, ``)
			.replace(/<\/font>/g, ``)
			.replace(/h3/g, `h4`);

	const sale_start = "";
	const sale_end = "";
	const tax_state = "";
	const tax_category = "none";
	const in_stock = 1;

	const stock =
		selector("li.product-stock.in-stock>span").first().text() &&
		selector("li.product-stock.in-stock>span")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");

	const low_stock = "";
	const wait_list = 0;
	const individual_sale = 0;
	const weight =
		selector("li.product-weight>span").first().text() &&
		selector("li.product-weight>span")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");
	const length = "";
	const width = "";
	const height = "";
	const customer_reviews = 0;
	const sale_notice = "";
	let price_sale =
		selector("div.product-price-old").first().text() &&
		selector("div.product-price-old")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");

	const price =
		selector("div.product-price-new").first().text() &&
		selector("div.product-price-new")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");

	if (!price) {
		price_sale =
			selector("div.product-price").first().text() &&
			selector("div.product-price")
				.first()
				.text()
				.trim()
				.replace(/\s+/g, " ");
	}

	const brand = selector("div.brand-image.product-manufacturer>a>span")
		.first()
		.text();

	let categories = "";
	let cat2 = "";
	let regex = /./;
	if (url.includes("?product_id")) {
		regex = /https:\/\/www\.dizi-living\.gr\/(.*)\?/;
	} else {
		regex = /https:\/\/www\.dizi-living\.gr\/(.*)\//;
	}
	try {
		const cat = url.match(regex);
		cat2 = cat[1].split("/").join(">");
	} catch (ex) {
		cat2 = "";
	}
	categories = `"${brand},${cat2}"`;

	const labels = "";
	const shipping_category = "";
	const image = selector("div.swiper-slide")
		.first()
		.children("img")
		.eq(0)
		.attr("data-largeimg")
        .replace(/\,/g,"%2C");

	const upload_limit = "";
	const upload_days_timeout = "";
	const parent = "";
	const grouped_products = "";
	const sale_increase = "";
	const parallel_products = "";
	const external_url = "";
	const button_text = "";
	const position = "";
	const property_ean_name = "ean";

	const property_ean_value =
		selector("li.product-ean>span").first().text() &&
		selector("li.product-ean>span")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");

	const property_ean_visible = 1;
	const property_ean_global = 1;

	const property_mpn_name = "mpn";

	const property_mpn_value =
		selector("li.product-mpn>span").first().text() &&
		selector("li.product-mpn>span")
			.first()
			.text()
			.trim()
			.replace(/\s+/g, " ");

	const property_mpn_visible = 1;
	const property_mpn_global = 1;

    const SKU = selector("li.product-model>span").first().text() &&
	selector("li.product-model>span")
		.first()
		.text()
		.trim()
		.replace(/\s+/g, " ");

    const product_link = encodeURI(url).replace(/\,/g,"%2C");

	// const description =
	// 	selector("div.block-content ").first().text() &&
	// 	selector("div.block-content ")
	// 		.first()
	// 		.text()
	// 		.trim()
	// 		.replace(/\s+/g, " ");

	// const description2 = selector("div.block-content").find('h1,h2,h3,h4,h5,span,b,p');
	// description2.each(
	// 	(index, item) =>
	// 		selector(item).text() && descText.push(selector(item).text())
	// );
	product =
		ID +
		"," +
		type +
		"," +
		model +
		"," +
		`"${name}"` +
		"," +
		published +
		"," +
		suggested +
		"," +
		visibility +
		"," +
		short_description +
		',"' +
		description +
		'",' +
		sale_start +
		"," +
		sale_end +
		"," +
		tax_state +
		"," +
		tax_category +
		"," +
		in_stock +
		"," +
		stock +
		"," +
		low_stock +
		"," +
		wait_list +
		"," +
		individual_sale +
		"," +
		weight +
		"," +
		length +
		"," +
		width +
		"," +
		height +
		"," +
		customer_reviews +
		"," +
		sale_notice +
		',"' +
		price +
		'","' +
		price_sale +
		'",' +
		categories +
		"," +
		labels +
		"," +
		shipping_category +
		',"' +
		image +
		'",' +
		upload_limit +
		"," +
		upload_days_timeout +
		"," +
		parent +
		"," +
		grouped_products +
		"," +
		sale_increase +
		"," +
		parallel_products +
		"," +
		external_url +
		"," +
		button_text +
		"," +
		position +
		"," +
		property_ean_name +
		"," +
		property_ean_value +
		"," +
		property_ean_visible +
		"," +
		property_ean_global +
		"," +
		property_mpn_name +
		"," +
		property_mpn_value +
		"," +
		property_mpn_visible +
		"," +
		property_mpn_global +
        "," +
		SKU +
		',"' +
		product_link
        + '"';

    console.log(SKU,product_link)


	fs.appendFile(
		`productDetails${en_name}.csv`,
		product + "\r\n",
		function (err) {
			if (err) return console.log(err);
		}
	);
};

scrapeProductDetailsBool && scrapeProductDetails();
