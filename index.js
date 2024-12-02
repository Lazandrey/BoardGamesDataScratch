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
    const gameInfo = await getGameInfo(gameList[i].link);
    gameInfo.id = i;
    boardGameInfoListFile.write(JSON.stringify(gameInfo, null, 2) + "\n");
  }

  boardGameInfoListFile.close();
} catch (error) {
  console.log(error);
}
