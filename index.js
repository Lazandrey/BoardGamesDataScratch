import fs from "fs";
import fsasync from "fs/promises";

import { getGamesList, getGameInfo } from "./src/selectors.js";

const pages = 10;
// const boardGameInfoList = [];

try {
  const gameList = await getGamesList(pages);
  await fsasync.writeFile("gameList.json", JSON.stringify(gameList, null, 2));

  console.log(gameList.length);
  const boardGameInfoListFile = fs.createWriteStream("boardGameInfoList.json", {
    flags: "w",
  });

  for (let i = 0; i < gameList.length; i++) {
    console.log(i);
    let gameInfo = false;
    let attempts = 0;

    while (gameInfo === false && attempts < 5) {
      gameInfo = await getGameInfo(gameList[i].link);
      attempts++;
      if (gameInfo === false) {
        // Wait a few seconds, also a good idea to swap proxy here*
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    gameInfo.id = i;
    boardGameInfoListFile.write(JSON.stringify(gameInfo, null, 2) + "\n");
  }

  boardGameInfoListFile.close();
} catch (error) {
  console.log(error);
}
