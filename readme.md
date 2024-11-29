https://boardgamegeek.com/browse/boardgame/ allows take 10 first page without registration.
Each page has 100 games.
Now parsed 1000 games.

Const pages = 10 - set to script first 10 pages.

Game's detail page firsly opened with some template code and then script on page load real content.
That is why standatrt fetch and axios do not work, They load only template code.
So was used headless browser puppeteer.
Parsing time for each game is 3-4 seconds.
