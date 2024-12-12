import fs from "fs";
import fsasync from "fs/promises";
import readline from "readline";
import { parseString } from "xml2js";
import { XMLParser } from "fast-xml-parser";

import { getGamesList, getGameInfo } from "./src/selectors.js";
import { title } from "process";

const getGameInfoByIdFromAPI = async (id) => {
  console.log(id);
  try {
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi/game/${id}&stats=1`
    );

    const xml = await response.text();
    const parser = new XMLParser();

    const gameInfo = parser.parse(xml);

    const game = {
      id: id,
      title: gameInfo.boardgames.boardgame.name[0],
      rating: gameInfo.boardgames.boardgame.statistics.ratings.average,
      usersrated: gameInfo.boardgames.boardgame.statistics.ratings.usersrated,
      minPlayers: gameInfo.boardgames.boardgame.minplayers,
      maxPlayers: gameInfo.boardgames.boardgame.maxplayers,
      minPplayTime: gameInfo.boardgames.boardgame.minplaytime,
      maxPplayTime: gameInfo.boardgames.boardgame.maxplaytime,
      weight: gameInfo.boardgames.boardgame.statistics.ratings.averageweight,
      gameImageUrl: gameInfo.boardgames.boardgame.image,
      age: gameInfo.boardgames.boardgame.age,
      description: gameInfo.boardgames.boardgame.description,
    };

    return game;
  } catch (error) {
    console.log(error);
  }
};

const getGamesIdsFromFile = async () => {
  try {
    const lineReader = readline.createInterface({
      input: fs.createReadStream("boardGamedIDs.csv", "utf-8"),
    });
    const boardGameInfoListFile = fs.createWriteStream(
      "boardGameInfoListFromAPI.json",
      {
        flags: "w",
      }
    );

    for await (const line of lineReader) {
      const id = line.replace("\ufeff", "");
      const gameInfo = await getGameInfoByIdFromAPI(id);
      console.log(gameInfo);
      boardGameInfoListFile.write(JSON.stringify(gameInfo, null, 2) + "\n");
    }
    boardGameInfoListFile.close();
    return;
  } catch (error) {
    console.log(error);
  }
};

try {
  getGamesIdsFromFile();
} catch (error) {
  console.log(error);
}
