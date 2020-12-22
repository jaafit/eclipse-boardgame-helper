Mini application for the boardgame [Eclipse](https://boardgamegeek.com/boardgame/246900/eclipse-second-dawn-galaxy)

[**Demo**](https://www.endlessenergyblueprint.com/helper)

# Battle

Calculate the probability of winning the battle.
Also, you can simulate one battle and get results (see dev console for play-by-play).

Enter the parameters of each army using the characteristics of ships and their number. 
Also choose which technologies each fleet has and whether it's attacking or defending.

Ships characteristics:

* Number - number of ships of this type
* Hull - number of hulls
* Morph - number of Morph Shields
* Computer (white) - number of computers
* Shield (black) - number of shields
* Initiative - number of initiative
* Cannons - number of cannons
* Missiles (standard module is 2 missile; enter 2, not 1, for each module)

Select number of battles for the calculation.
Algorithm will simulate that number of battles and display average statistics. 
**Attention**, a lot of battles will lead to long-term calculation.

After selecting all parameters, press "Run Battle" to get results.

# Rep

Calculate the average point value of your reputation tiles compared to your opponents.

* **Your Rep Spaces:** How many spaces there are for reputation on your board.
* **Player Count:** How many players are playing (including you).
* **Their Rep Spaces:** How many spaces there are for reputation on your opponents' boards.
* **Your Tiles per Draw:** How many tiles you draw when you draw tiles.
* **Opponent Tiles per Draw:** How many tiles opponents draw when they draw tiles.

The "Tiles per Draw" fields are split into 8 seperate draws, but these don't necessarily correspond to the 8 rounds of the game.  They simply give you a way to simulate drawing early vs late.
For each of the 8 draws, the order between players drawing is randomized.

# Odds

Calculate the probability of hits to the opponent.
Select number of cannons or missiles and set bonus. Press "Calc" to get results.

Types of counter:

* Ion (yellow) - number of ion cannons or missiles
* Plasma (orange) - number of plasma cannons or missiles
* Soliton (blue) - number of soliton cannons
* Antimatter (red) - number of antimatter cannons or missiles
* Rift (violet) - number of rift cannons 
* Bonus (white) - bonus of computers, considering opponent's shields

# Dice

Simulate a throw of dice.
Select number of dice of each color. Press "Throw" to get results.

# Races

Randomly select a race to play.
Select the probability of selection of each race and press "Get random race" for get results.

Code available at https://github.com/jaafit/eclipse-boardgame-helper

Credit to Negromovich for coding this in 2014 for 1st Ed:
https://github.com/Negromovich/eclipse-boardgame-helper