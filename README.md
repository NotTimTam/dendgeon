# teenydumdgeon

Did somebody say "lightweight retro-themed open-source easy-to-understand easier-to-learn dungeon crawler engine"?

N-no?

Anyway, this is all of those things. First and foremost, it is a dungeon crawler game I am building in vanilla JS. That's right! No node, and no rendering libraries! Just good old fashioned JS and HTML Canvas. The entire engine is built from the ground up to maximize efficieny while running at a constant 60fps (on any mid-range computer hardware)

Being HTML you can easily export this to an NW.js desktop application, mobile app, or anything else that can run an HTML page.

There isn't official documentation yet, but everything is thoroughly commented and easy to read. The engine itself is relatively simple, and the game loop follows the common-

1. User input.
2. Game logic.
3. Game rendering.

-game loop methodology. Every object in the game utilizes these three functions at their core, meaning implementing brand new functionality into the engine is easy.

## Roadmap

-   More enemies.
-   Levels with increasing difficulty.
-   A boss room.
-   Better collision system.

### Completed

-   Multiple light sources.
-   A minimap.
