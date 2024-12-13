import fs from "fs";

import readline from "readline";

import { XMLParser } from "fast-xml-parser";

const getGameInfoByIdFromAPI = async (id) => {
  try {
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi/game/${id}&stats=1`
    );

    const xml = await response.text();
    const parser = new XMLParser();

    const gameInfo = parser.parse(xml);

    let gameTitle = "";
    if (Array.isArray(gameInfo.boardgames.boardgame.name)) {
      gameTitle = gameInfo.boardgames.boardgame.name[0];
    } else {
      gameTitle = gameInfo.boardgames.boardgame.name;
    }
    const game = {
      id: id,
      title: gameTitle,
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

const getGamesIdsFromFile = async (maxQty) => {
  try {
    const lineReader = readline.createInterface({
      input: fs.createReadStream("boardGamedIDs.csv", "utf-8"),
    });
    const boardGameInfoListFile = fs.createWriteStream(
      `boardGameInfoListFromAPI${maxQty}.json`,
      {
        flags: "w",
      }
    );
    let i = 0;
    for await (const line of lineReader) {
      i++;
      const id = line.replace("\ufeff", "");
      const gameInfo = await getGameInfoByIdFromAPI(id);
      console.log(i, "", gameInfo.title);
      boardGameInfoListFile.write(JSON.stringify(gameInfo, null, 2) + "\n");
      if (maxQty && i >= maxQty) {
        break;
      }
    }
    boardGameInfoListFile.close();
    return;
  } catch (error) {
    console.log(error);
  }
};

try {
  getGamesIdsFromFile(1000);
} catch (error) {
  console.log(error);
}
