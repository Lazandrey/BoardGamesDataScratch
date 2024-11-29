import * as cheerio from "cheerio";
import fetch from "node-fetch";
import fs from "fs";
import puppeteer from "puppeteer";

const url = "https://boardgamegeek.com/browse/boardgame";
const pages = 10;
const gameInfoList = [];
const getGamesList = async (pages) => {
  const gameList = [];

  for (let i = 1; i <= pages; i++) {
    const response = await fetch(url + `/page/${i}`);
    const html = await response.text();

    const $ = cheerio.load(html);

    const primary = $(".primary");

    primary.map((i, el) => {
      const title = $(el).text().trim();
      const link = "https://boardgamegeek.com" + $(el).attr("href");
      gameList.push({ title, link });
    });
  }

  return gameList;
};

const getGameInfo = async (gameUrl) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  await page.goto(gameUrl);
  const html = await page.content();
  await browser.close();
  const $ = cheerio.load(html);

  const title = $("[itemprop='name']:first").text();

  console.log(title);

  const rating = $("[itemprop='ratingValue']").attr("content");
  console.log(rating);

  const minPlayers = $("[ng-if='min > 0']:first").text();
  console.log(minPlayers);
  const maxPlayers = $("[ng-if='max>0 && min != max']:first").text().slice(1);
  console.log(maxPlayers);

  const minPplayTime = $("[ng-if='min > 0']:last").text();
  console.log(minPplayTime);
  const maxPplayTime = $("[ng-if='max>0 && min != max']:last").text().slice(1);
  console.log(maxPplayTime);

  const weight = $("[class^='ng-binding gameplay-weight-']").text().trim();

  console.log(weight);

  return {
    title,
    rating,
    minPlayers,
    maxPlayers,
    minPplayTime,
    maxPplayTime,
    weight,
  };
};

const gameList = await getGamesList(pages);
await fs.promises.writeFile("gameList.json", JSON.stringify(gameList, null, 2));

console.log(gameList.length);
for (let i = 0; i < gameList.length; i++) {
  console.log(i);
  const gameInfo = await getGameInfo(gameList[i].link);
  gameInfoList.push(gameInfo);
}

await fs.promises.writeFile(
  "gameInfo.json",
  JSON.stringify(gameInfoList, null, 2)
);
