import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const url = "https://boardgamegeek.com/browse/boardgame";
export const getGamesList = async (pages) => {
  const gameList = [];
  try {
    for (let i = 1; i <= pages; i++) {
      const response = await fetch(url + `/page/${i}`);
      const html = await response.text();

      const $ = cheerio.load(html);

      const gameData = $(".primary");

      gameData.map((i, el) => {
        const title = $(el).text().trim();
        const link = "https://boardgamegeek.com" + $(el).attr("href");
        gameList.push({ title, link });
      });
    }
    return gameList;
  } catch (error) {
    console.log(error);
  }
};

const getGameImageUrl = async (imagePageUrl) => {
  try {
    console.log(imagePageUrl);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);
    await page.goto(imagePageUrl);
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const imageUrl = $("[loading='eager']").attr("src");
    console.log(imageUrl);
    return imageUrl;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getGameInfo = async (gameUrl) => {
  try {
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

    const maxPplayTime = $("[ng-if='max>0 && min != max']:last")
      .text()
      .slice(1);
    console.log(maxPplayTime);

    const weight = $("[class^='ng-binding gameplay-weight-']").text().trim();
    console.log(weight);

    const imagePageUrl =
      "https://boardgamegeek.com" +
      $("[class='game-header-image']").find("a").attr("href");

    let gameImageUrl = false;
    let attempts = 0;

    while (gameImageUrl === false && attempts < 5) {
      gameImageUrl = await getGameImageUrl(imagePageUrl);
      attempts++;
      if (gameImageUrl === false) {
        // Wait a few seconds, also a good idea to swap proxy here*
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    return {
      title,
      rating,
      minPlayers,
      maxPlayers,
      minPplayTime,
      maxPplayTime,
      weight,
      gameImageUrl,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
};
