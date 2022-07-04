require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const covid19Api = require("covid19-api");
const text = require("./const");

const bot = new Telegraf(process.env.BOT_TOKEN);

const menuBtns = Markup.keyboard([
	["US", "Ukraine", "Poland", "France"],
	["UK", "Germany", "Romania", "Spain"],
]).resize()

bot.start((ctx) => {
	let startText = `Привіт ${ctx.message.from.first_name ? ctx.message.from.first_name : ""} ✋`
	ctx.replyWithHTML(startText + text.startText, {
		disable_web_page_preview: true,
	}, menuBtns);
});

bot.help((ctx) => ctx.reply(text.countriesList));

bot.on("text", async (ctx) => {
	let data = {};
	try {
		data = await covid19Api.getReportsByCountries(ctx.message.text);

		//Capitalize First Letter
		function capFirLet(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		let formData = `Країна: ${capFirLet(data[0][0].country)} \n`;
		formData += `Всього випадків: ${data[0][0].cases.toLocaleString("en-US")} чол. \n`;
		formData += `Летальних: ${data[0][0].deaths.toLocaleString("en-US")} чол. \n`;
		formData += `Одужало: ${data[0][0].recovered.toLocaleString("en-US")} чол.`;

		ctx.reply(formData);
	} catch (error) {
		ctx.reply(text.errorText);
	}
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
