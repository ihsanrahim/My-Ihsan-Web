# ♟️ My Ihsan Chess Guide

A step-by-step guide for players of **Explore › 3D chess** in My Ihsan. Read the chapters in order, or go straight to the one you need.

| # | Chapter | What you will learn |
|---|---------|---------------------|
| 1 | [Fastest checkmates and opening traps](#chapter-1-fastest-checkmates-and-opening-traps) | Fool's mate, Scholar's mate, Légal's mate and other quick wins, and how to stop each one |
| 2 | [Popular openings](#chapter-2-popular-openings) | The openings strong players use most, with their first moves and the idea behind them |
| 3 | [Thinking like a professional](#chapter-3-thinking-like-a-professional) | How masters choose a move, read notation, check for blunders and study games |
| 4 | [Strategy and tactics](#chapter-4-strategy-and-tactics) | Opening principles, middlegame plans, tactical patterns, mating patterns and endgames |
| 5 | [Training plan in My Ihsan](#chapter-5-training-plan-in-my-ihsan) | A 4-week plan using the robot levels, clocks, undo and the move list |

Every move line in this guide has been played through the My Ihsan chess engine to make sure it is legal and that each checkmate really is checkmate.

## How to read the moves

The move list in the game (📜 Moves) uses **standard algebraic notation**, and so does this guide.

- Squares are named by **file** (a–h, left to right from white's side) and **rank** (1–8, from white's side). White's king starts on **e1**, black's on **e8**.
- Pieces: **K** king, **Q** queen, **R** rook, **B** bishop, **N** knight. Pawns have no letter: `e4` means a pawn moves to e4.
- `x` = capture (`Bxf7` = bishop takes on f7), `+` = check, `#` = checkmate.
- `O-O` = castle kingside, `O-O-O` = castle queenside.
- `1.e4 e5` = white's first move, then black's reply. `3...Nf6` = black's third move.
- `?` = a mistake, `??` = a blunder, `!` = a good move.

## Piece names in the game

| Symbol | English | Classic theme (BM) | Malay court theme |
|:-:|---|---|---|
| ♚ K | King | Raja | Sultan |
| ♛ Q | Queen | Menteri | Permaisuri |
| ♜ R | Rook | Tir | Laksamana |
| ♝ B | Bishop | Gajah | Bendahara |
| ♞ N | Knight | Kuda | Hulubalang |
| ♟ P | Pawn | Bidak | Pesilat |

| English | Bahasa Melayu |
|---|---|
| Check | Sah |
| Checkmate | Mat |
| Stalemate | Buntu |
| Draw | Seri |
| Castling | Istana |
| Promotion | Naik pangkat |

## A little history

Chess reached the Muslim world as *shatranj* from Persia, and for several centuries the strongest players and writers on the game lived in the Abbasid lands. **Al-Adli ar-Rumi** (9th century) wrote one of the earliest known books on chess, and **as-Suli** (died about 946) was the champion of his time in Baghdad; his endgame studies are still discussed today. The "Arabian mate" in chapter 4 is named after this tradition.

---

## Chapter 1: Fastest checkmates and opening traps

These are the quickest ways a game can end. Learn them for two reasons:

1. **So they never happen to you.** Most of these only work if the other side makes a bad move.
2. **To punish beginners.** Against the robot on level 1, or a friend who is new, they can win in a few moves.

> ⚠️ A good opponent will not fall for them. If you play only for quick traps, you will often end up with a worse position. Use them as a bonus, and play the sound openings from [chapter 2](#chapter-2-popular-openings) as your main plan.

The weak point in every one of these traps is the same: the squares next to the king that only the king protects, especially **f7** (for black) and **f2** (for white) at the start of the game.

---

### Fool's mate: 2 moves (the fastest possible)

```
1.f3 e5
2.g4 Qh4#
```

White opens the diagonal from h4 to e1 by moving the f- and g-pawns, and black's queen mates at once. The same thing happens after `1.f4 e5 2.g4 Qh4#`.

White can fall into the same idea too: `1.e4 g5 2.d4 f6 3.Qh5#`.

**Lesson:** at the start, do not move the f- and g-pawns in front of your king without a reason.

---

### Scholar's mate: 4 moves

```
1.e4 e5
2.Bc4 Nc6
3.Qh5 Nf6??
4.Qxf7#
```

The white queen and bishop both aim at f7. Black only protected e5 and forgot f7.

A version with the queen on f3: `1.e4 e5 2.Qf3 Nc6 3.Bc4 d6?? 4.Qxf7#`.

#### How to stop Scholar's mate

After `3.Qh5`, black should protect e5 **and** block the queen:

```
1.e4 e5
2.Bc4 Nc6
3.Qh5 g6!
4.Qf3 Nf6!
5.Qb3 Qe7
6.Nc3 Nd4
```

Now the white queen has been pushed around, black has developed with tempo (each move made a threat) and black is better. **Bringing the queen out early is a weakness when the opponent knows the defence.**

The simplest rule: after white's bishop goes to c4, play `...Nf6` early so the knight guards h5 and the queen cannot come there.

---

### Légal's mate: 7 moves

Named after the 18th-century French master Légal. It shows a famous idea: **giving up the queen to deliver mate with minor pieces.**

```
1.e4 e5
2.Nf3 d6
3.Bc4 Bg4
4.Nc3 g6?
5.Nxe5! Bxd1??
6.Bxf7+ Ke7
7.Nd5#
```

Black thinks the knight on f3 is pinned to the queen and wins the queen, but white's bishop and two knights mate the king. Black should have played `5...dxe5`, which only loses a pawn (after `6.Qxg4`).

**Lesson:** a pin on the queen is not a real pin. The piece *can* move if the reward is bigger than the queen.

---

### Blackburne Shilling trap: 7 moves (black wins)

Named after the English master Joseph Blackburne, who reportedly won small bets with it.

```
1.e4 e5
2.Nf3 Nc6
3.Bc4 Nd4
4.Nxe5? Qg5!
5.Nxf7?? Qxg2
6.Rf1 Qxe4+
7.Be2 Nf3#
```

`3...Nd4` is not a good move, but it sets a trap. White grabs the pawn, then the rook on f7, and gets mated by a **smothered mate**: the king is boxed in by its own pieces.

**How white avoids it:** answer `3...Nd4` with `4.Nxd4 exd4 5.c3` or simply `4.O-O`. Do not take the e5 pawn.

---

### Englund Gambit trap: 8 moves (black wins)

```
1.d4 e5
2.dxe5 Nc6
3.Nf3 Qe7
4.Bf4? Qb4+
5.Bd2 Qxb2
6.Bc3? Bb4
7.Qd2 Bxc3
8.Qxc3 Qc1#
```

Black's queen grabs the b2 pawn and white's back rank collapses. White should play `4.Qd5` or `4.Nc3` instead of `4.Bf4`.

---

### Smothered mate in the Caro-Kann: 6 moves

```
1.e4 c6
2.d4 d5
3.Nc3 dxe4
4.Nxe4 Nd7
5.Qe2 Ngf6??
6.Nd6#
```

The queen on e2 pins the e7 pawn to the king, so `Nd6` cannot be taken. The black king is surrounded by its own pieces. Black should play `5...Ndf6` instead, so the d7 knight leaves and the king gets a square.

**Lesson:** when your opponent's queen stands on the same line as your king, be careful about blocking your king in.

---

### Kieninger trap (Budapest Gambit): 8 moves (black wins)

```
1.d4 Nf6
2.c4 e5
3.dxe5 Ng4
4.Bf4 Nc6
5.Nf3 Bb4+
6.Nbd2 Qe7
7.a3 Ngxe5
8.axb4?? Nd3#
```

Taking the bishop opens a path for the smothered mate on d3: the white king is blocked by its own queen and knight. White should play `8.Nxe5 Nxe5 9.e3` and stay safe.

---

### Fried Liver Attack (not a mate, but a strong attack)

A favourite of club players. It starts like this:

```
1.e4 e5
2.Nf3 Nc6
3.Bc4 Nf6
4.Ng5 d5
5.exd5 Nxd5?
6.Nxf7! Kxf7
7.Qf3+ Ke6
8.Nc3
```

The black king is pulled into the middle of the board and white attacks. **Black's correct defence** is to not recapture with the knight:

```
5...Na5!
6.Bb5+ c6
7.dxc6 bxc6
8.Be2 h6
```

Black has given a pawn, but chases the white pieces and gets fast development.

---

### Traps that win the queen

#### Petrov trap

```
1.e4 e5
2.Nf3 Nf6
3.Nxe5 Nxe4?
4.Qe2 Nf6??
5.Nc6+
```

The knight moves with a **discovered check** from the queen on e2 and also attacks black's queen on d8. Black loses the queen. (After `3.Nxe5` black should play `3...d6` first, then take on e4.)

#### Elephant trap (Queen's Gambit Declined)

```
1.d4 d5
2.c4 e6
3.Nc3 Nf6
4.Bg5 Nbd7
5.cxd5 exd5
6.Nxd5? Nxd5!
7.Bxd8 Bb4+
8.Qd2 Bxd2+
9.Kxd2 Kxd8
```

White thinks the knight on f6 is pinned and grabs a pawn. Black gives up the queen, wins it back with check, and ends up a **whole piece ahead**.

---

### Summary: how to never lose to a quick trap

1. **Protect f7 / f2** in the first moves. Watch any queen or bishop aiming there.
2. **Don't move the f- and g-pawns** in front of your king early.
3. **Develop knights and bishops before the queen.**
4. **Castle early** to move the king away from the centre.
5. **Before you grab a "free" pawn or piece, ask: why is it free?**
6. **A pin on the queen can be broken** if the reward is checkmate or more material.

---

## Chapter 2: Popular openings

You do not need to memorise long lines. Strong players remember the **idea** of an opening and the first few moves. If your opponent leaves the book, you still know what you are trying to do.

**Start with one opening for white and two replies for black** (one against `1.e4`, one against `1.d4`). Play them again and again against the robot.

| If you like... | Play with white | Play with black vs 1.e4 | Play with black vs 1.d4 |
|---|---|---|---|
| Simple, classical play | Italian Game | 1...e5 (Italian / Ruy Lopez) | Queen's Gambit Declined |
| A system with few lines to learn | London System | Caro-Kann | Slav Defence |
| Sharp, attacking games | Scotch Game | Sicilian Defence | King's Indian Defence |

---

### Openings with 1.e4

#### Italian Game (Giuoco Piano): best first opening

```
1.e4 e5
2.Nf3 Nc6
3.Bc4 Bc5
4.c3 Nf6
5.d3 d6
6.O-O O-O
```

**Idea for white:** the bishop on c4 aims at f7, `c3` prepares `d4` to take the centre, and the slow `d3` keeps everything safe. Later white often plays `Re1`, `Nbd2-f1-g3` and pushes `d4` or `b4`.

**Idea for black:** copy the same healthy setup, castle, and look for `...d5` or `...a6` with `...Ba7`.

A related line is the **Two Knights Defence** (`3...Nf6`). Against `4.d3 Be7 5.O-O O-O` you get a calm game. If white plays `4.Ng5`, see the Fried Liver in [chapter 1](#chapter-1-fastest-checkmates-and-opening-traps).

#### Ruy Lopez (Spanish Opening): the opening of world champions

```
1.e4 e5
2.Nf3 Nc6
3.Bb5 a6
4.Ba4 Nf6
5.O-O Be7
6.Re1 b5
7.Bb3 d6
8.c3 O-O
```

**Idea:** the bishop on b5 attacks the knight that defends e5. White builds slowly with `c3` and `d4`, and the game is a long fight about the centre. It is rich and deep, so it is a good second opening once the Italian feels comfortable.

#### Scotch Game: open the centre at once

```
1.e4 e5
2.Nf3 Nc6
3.d4 exd4
4.Nxd4 Nf6
5.Nxc6 bxc6
6.e5 Qe7
```

**Idea:** white opens lines immediately and gets active pieces. Good for players who like tactics.

#### Sicilian Defence: black's most popular fighting reply

The **Najdorf** (favourite of Fischer and Kasparov):

```
1.e4 c5
2.Nf3 d6
3.d4 cxd4
4.Nxd4 Nf6
5.Nc3 a6
```

The **Dragon** (the g7 bishop looks like a dragon's breath along the diagonal):

```
1.e4 c5
2.Nf3 d6
3.d4 cxd4
4.Nxd4 Nf6
5.Nc3 g6
6.Be3 Bg7
7.f3 O-O
8.Qd2 Nc6
```

**Idea:** black trades the c-pawn for white's d-pawn, so the position is unbalanced. Black often attacks on the queenside with the half-open c-file while white attacks the king. Games are sharp, so know the ideas before you play it.

If you are white and do not want to learn the big Sicilian lines, try the **Alapin**: `1.e4 c5 2.c3 Nf6 3.e5 Nd5 4.d4 cxd4 5.Nf3 Nc6`.

#### French Defence: solid and counter-attacking

```
1.e4 e6
2.d4 d5
3.Nc3 Nf6
4.Bg5 Be7
5.e5 Nfd7
```

The **Advance variation**: `1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6`.

**Idea:** black lets white have space but attacks the white pawn chain at its base with `...c5` and `...f6`. The bishop on c8 is often black's problem piece, so plan how to activate it.

#### Caro-Kann Defence: very solid

```
1.e4 c6
2.d4 d5
3.Nc3 dxe4
4.Nxe4 Bf5
5.Ng3 Bg6
6.h4 h6
7.Nf3 Nd7
```

**Idea:** like the French, but the c8 bishop gets out before `...e6`. Black has a healthy pawn structure and good endgames. A great choice if you like safe positions.

#### Scandinavian Defence: simple to learn

```
1.e4 d5
2.exd5 Qxd5
3.Nc3 Qa5
4.d4 Nf6
5.Nf3 Bf5
```

**Idea:** black takes the centre pawn at once. The queen comes out early, but from a5 it is safe. Easy to play because white's choices are limited.

---

### Openings with 1.d4

#### Queen's Gambit Declined: classical and solid

```
1.d4 d5
2.c4 e6
3.Nc3 Nf6
4.Bg5 Be7
5.e3 O-O
6.Nf3 h6
```

**Idea:** white offers the c4 pawn to pull black's d5 pawn away from the centre. Black declines and keeps a strong d5. Watch out for the **Elephant trap** in [chapter 1](#chapter-1-fastest-checkmates-and-opening-traps).

#### Queen's Gambit Accepted

```
1.d4 d5
2.c4 dxc4
3.Nf3 Nf6
4.e3 e6
5.Bxc4 c5
6.O-O a6
```

**Idea:** black takes the pawn, but does **not** try to keep it. White wins it back and black uses the time to develop. Trying to keep the pawn with `...b5` usually goes wrong, for example `1.d4 d5 2.c4 dxc4 3.e3 b5? 4.a4 c6 5.axb5 cxb5 6.Qf3`, attacking the rook on a8.

#### Slav Defence

```
1.d4 d5
2.c4 c6
3.Nf3 Nf6
4.Nc3 dxc4
5.a4 Bf5
```

**Idea:** black supports d5 with the c-pawn, keeping the c8 bishop free to come out. Solid, and the structure is similar to the Caro-Kann, so the two fit well together.

#### London System: one setup against almost everything

```
1.d4 d5
2.Bf4 Nf6
3.e3 e6
4.Nf3 c5
5.c3 Nc6
6.Nbd2 Bd6
7.Bg3 O-O
8.Bd3
```

**Idea:** white plays the same moves (`d4`, `Bf4`, `e3`, `Nf3`, `c3`, `Nbd2`, `Bd3`) whatever black does. Very little theory, a safe king and a slow attack later with `Ne5`, `Qf3` or `h4`. A good choice if you don't have time to study openings.

#### King's Indian Defence: let white have the centre, then attack it

```
1.d4 Nf6
2.c4 g6
3.Nc3 Bg7
4.e4 d6
5.Nf3 O-O
6.Be2 e5
7.O-O Nc6
8.d5 Ne7
```

**Idea:** black castles quickly, then strikes with `...e5` and often `...f5`, attacking white's king on the kingside while white attacks on the queenside. Sharp and exciting.

#### Nimzo-Indian Defence

```
1.d4 Nf6
2.c4 e6
3.Nc3 Bb4
4.e3 O-O
5.Bd3 d5
6.Nf3 c5
```

**Idea:** the bishop pins the c3 knight so it cannot support `e4`. Black is often happy to give the bishop for the knight to damage white's pawns.

---

### Other first moves

#### English Opening

```
1.c4 e5
2.Nc3 Nc6
3.g3 g6
4.Bg2 Bg7
5.Rb1 d6
```

**Idea:** white controls d5 from the side and the g2 bishop presses on the long diagonal. A flexible, positional opening.

---

### How to learn an opening (the professional way)

1. **Learn the first 5 to 8 moves, not 20.**
2. **For each move, ask why it is played.** What square does it control? Which piece does it free?
3. **Know the typical plan** (pawn breaks like `d4`, `...c5`, `...f5`) and where the pieces belong.
4. **Play it 10 to 20 times** against the robot. After each game, look at the 📜 move list and find the first move where you left your plan.
5. **Learn the traps** in your opening, for both sides.
6. **Add a new line only when an opponent surprises you.**

---

## Chapter 3: Thinking like a professional

The biggest difference between a beginner and a master is not memory. It is **how they think before each move**. Masters follow a routine so they rarely miss something simple.

---

### The thinking routine for every move

#### Step 1: What did my opponent's last move do?

Before you look at your own ideas, ask:

- Does it **attack** something of mine?
- Does it **threaten** a check, a capture or a mate next move?
- What square or line did it **open** or **leave unguarded**?

Most beginner losses come from skipping this step.

#### Step 2: Checks, captures, threats (CCT)

Look at every **check**, every **capture** and every **threat** for both sides. Forcing moves are where tactics hide. Masters look at them first, even ones that look silly.

#### Step 3: Choose 2 or 3 candidate moves

Don't play the first good move you see. Find two or three reasonable moves, then compare them. A well-known saying: *"When you see a good move, look for a better one."*

#### Step 4: Calculate the reply

For each candidate, ask: **what is the opponent's best answer?** Assume they will find it. Look a couple of moves deep along forcing lines.

#### Step 5: Blunder check

Before you let go of the piece, ask one last time:

- After my move, is any of my pieces **undefended** and attackable?
- Is my **back rank** safe?
- Can they give a **check** that wins something?

> 🧠 In My Ihsan you drop a piece by tapping the target square. Make the blunder check a habit before that final tap.

---

### Evaluating a position like a master

When there is no tactic, masters judge the position using these factors:

| Factor | Questions to ask |
|---|---|
| **Material** | Who has more? Pawn = 1, knight = 3, bishop = 3, rook = 5, queen = 9. |
| **King safety** | Is either king exposed, uncastled or short of defenders? |
| **Piece activity** | Which pieces are doing nothing? Which side has more active pieces? |
| **Pawn structure** | Isolated, doubled or backward pawns? Passed pawns? |
| **Space** | Who controls more squares in the centre and the opponent's half? |
| **Weak squares** | Holes that no pawn can defend, perfect outposts for a knight. |

Then make a **plan**: find your worst piece and improve it, or attack where you are stronger.

---

### Professional habits

1. **Think in plans, not single moves.** "I will put my knight on d5, then push f4" is better than looking for random threats.
2. **Prophylaxis.** Ask "what does my opponent want to do?" and stop it before it happens. This was the trademark of champions like Petrosian and Karpov.
3. **Trade when you are ahead, avoid trades when you are behind.** With extra material, simplify into an easy endgame. When attacking, keep pieces on the board.
4. **Every piece has a job.** If a piece has no job, find one for it.
5. **Use your clock well.** Spend time at critical moments (when the position changes, after a capture, when you have many choices) and play quickly in simple positions.
6. **Stay calm after a mistake.** Many games are won by the player who makes the second-to-last mistake. Keep fighting.
7. **Respect your opponent.** Play every move as if they will find the best reply.

---

### How masters study

| Method | How to do it |
|---|---|
| **Tactics puzzles every day** | 10 to 20 minutes daily. Pattern recognition is the fastest way to improve. |
| **Endgames** | Learn the basic mates and king-and-pawn endings early (see chapter 4). |
| **Review your own games** | After each game, find the move where you went wrong, without an engine first. |
| **Play through master games** | Guess each move before you look at the answer. |
| **Play longer games** | Slow games (15+10 or 30+0) teach more than fast ones. |

#### A famous game to study: the Opera Game

Paul Morphy beat two noble amateurs at the Paris opera in 1858. It shows rapid development, open lines and a beautiful finish. Play it through on a real board or in the 2-player mode.

```
1.e4 e5        2.Nf3 d6       3.d4 Bg4
4.dxe5 Bxf3    5.Qxf3 dxe5    6.Bc4 Nf6
7.Qb3 Qe7      8.Nc3 c6       9.Bg5 b5
10.Nxb5 cxb5   11.Bxb5+ Nbd7  12.O-O-O Rd8
13.Rxd7 Rxd7   14.Rd1 Qe6     15.Bxd7+ Nxd7
16.Qb8+ Nxb8   17.Rd8#
```

**What to notice:**

- Black's `3...Bg4` and `4...Bxf3` give up a bishop for a knight and lose time.
- By move 12 every white piece is developed and the king is castled. Black's pieces on f8 and h8 never moved.
- White gives up material (the knight, then the bishop, then the queen) to keep the attack. Development is worth more than material when the opponent's king is in the centre.
- The final mate uses only a rook and a bishop.

---

### Common beginner mistakes and the pro fix

| Mistake | Pro fix |
|---|---|
| Moving the same piece many times in the opening | Develop a new piece each move |
| Bringing the queen out early | Develop knights and bishops first |
| Not castling | Castle within the first 10 moves |
| Grabbing every pawn | Ask why it is free; development may be worth more |
| Only looking at your own plan | Always check the opponent's last move first |
| Attacking with one piece | Bring more pieces before you attack |
| Giving up when behind | Look for tricks, stalemate ideas and your opponent's mistakes |
| Playing too fast | Use the blunder check before every move |

---

## Chapter 4: Strategy and tactics

> *"Tactics is knowing what to do when there is something to do. Strategy is knowing what to do when there is nothing to do."* (attributed to Savielly Tartakower)

A game has three phases: the **opening** (about the first 10 to 15 moves), the **middlegame** and the **endgame**. Each one needs a different way of thinking.

---

### Part A: Opening principles

1. **Control the centre** (d4, d5, e4, e5) with pawns and pieces.
2. **Develop knights and bishops** quickly, knights usually before bishops.
3. **Castle early** to keep the king safe and bring a rook to the centre.
4. **Don't move a piece twice** without a good reason.
5. **Don't bring the queen out too early.** It gets chased and you lose time.
6. **Connect your rooks** (nothing standing between them on the back rank).
7. **Don't grab pawns** at the cost of development.

---

### Part B: Tactics, the patterns that win material

Most games between beginners and club players are decided by tactics. Learn to spot these patterns.

| Pattern | What it is | Example |
|---|---|---|
| **Fork** | One piece attacks two or more pieces at once | A knight checks the king and attacks the queen |
| **Pin** | A piece cannot move without exposing a more valuable piece behind it | A bishop pins a knight to the king |
| **Skewer** | Like a pin, but the more valuable piece is in front and must move | A rook checks the king, and the queen behind it falls |
| **Discovered attack** | Moving one piece opens a line for another piece to attack | Moving a knight reveals a bishop's check |
| **Double check** | Two pieces give check at once; the king must move | Often leads to mate |
| **Removing the defender** | Capture or chase away the piece that guards something | Take the knight that defends the back rank |
| **Deflection** | Force a defender away from its duty | A sacrifice that drags the queen off a key square |
| **Decoy** | Lure a piece onto a bad square | Sacrifice to pull the king into a check |
| **Overloading** | One piece is defending two things; attack both | Then it can only save one |
| **Zwischenzug** | An "in-between" move, often a check, before the expected recapture | Check first, then take back |

**Training tip:** knights are the best forking pieces because they jump. Every time a knight can reach a square that attacks two valuable pieces, check it.

---

### Part C: Mating patterns

Recognise these finishing shapes and you will find mates much faster.

#### Back-rank mate

The king is trapped behind its own pawns (for example on g8 with pawns on f7, g7, h7), and a rook or queen mates on the back rank.

**Defence:** make a "luft" (an escape square) by moving a pawn such as `h6` / `h3`, or keep a rook on the back rank.

#### Smothered mate

A knight gives check and the king cannot move because its own pieces surround it. Seen in the Blackburne, Caro-Kann and Kieninger traps in [chapter 1](#chapter-1-fastest-checkmates-and-opening-traps).

#### Arabian mate

A rook and knight mate a king in the corner: the rook gives check next to the king (for example on h7 against a king on h8), protected by the knight, which also covers g8. One of the oldest known patterns, already described in Arabic manuscripts of shatranj.

#### Anastasia's mate

A knight on e7 covers g8 and g6, and a rook or queen mates on the h-file against a king on h7, whose own pawn on g7 blocks its escape.

#### Boden's mate

Two bishops on crossing diagonals mate a king that has castled queenside, often after a queen sacrifice on c6 or c3.

#### Ladder (lawnmower) mate

Two rooks (or a rook and queen) take turns pushing the king to the edge, one rank at a time, then mate it there. The easiest way to finish when you are far ahead.

#### Queen and king mate

The queen gives mate on a square next to the enemy king, protected by its own king or another piece.

---

### Part D: Middlegame strategy

When there is no tactic, follow a plan.

#### 1. Find your worst piece and improve it

A bishop blocked by its own pawns, a knight on the edge ("a knight on the rim is dim"), a rook on a closed file: move these to better squares.

#### 2. Rooks belong on open files

An **open file** has no pawns. A **half-open file** has only the opponent's pawn. Put rooks there, and double them if you can. A rook on the 7th rank (2nd for black) is very strong.

#### 3. Knights love outposts

An **outpost** is a square in the opponent's half that no enemy pawn can attack, ideally supported by your own pawn. A knight on d5 or e5 that cannot be chased is often worth more than a bishop.

#### 4. Bishops love open positions

Two bishops (the "bishop pair") are strong in open positions with few pawns. In closed positions knights are often better.

#### 5. Pawn structure

| Weakness | What it means | How to use it |
|---|---|---|
| **Isolated pawn** | No friendly pawn on the files beside it | Block it with a piece, then attack it |
| **Doubled pawns** | Two pawns on the same file | They defend each other badly |
| **Backward pawn** | Cannot be protected by a neighbour and cannot advance safely | Put pressure on it and the square in front |
| **Passed pawn** | No enemy pawn can stop it on its way to promotion | "Passed pawns must be pushed." Support it with pieces |

#### 6. Attack where you are stronger

Pawns point the way. If your pawn chain points to the kingside (for example white pawns on d4 and e5), attack on the kingside. Attack the king only when you have more pieces near it than the defender.

#### 7. Pawn breaks

A **pawn break** is a pawn move that challenges the opponent's chain and opens lines (for example `...c5` or `...f6` in the French, `...f5` in the King's Indian). Most plans are built around one key break.

#### 8. Space

If you have more space, avoid trades so your opponent stays cramped. If you are cramped, trade pieces to get room.

---

### Part E: Endgames

In the endgame the **king becomes a fighting piece**. Bring it to the centre.

#### Must-know mates

**King and queen vs king.** Use the queen to shrink the enemy king's box a knight's move away from it, bring your own king close, then mate on the edge. Careful: always leave the enemy king at least one move, or it is **stalemate** (a draw).

**King and rook vs king.** Use the rook to cut the king off rank by rank. Bring your king opposite the enemy king (with one square between), then check with the rook along the edge.

**Two rooks vs king.** The ladder mate from Part C.

#### King and pawn endings

- **Opposition:** when the kings face each other with one square between them, the side that does *not* have to move usually wins the fight. This decides many pawn endings.
- **Rule of the square:** draw a square from the pawn to its promotion rank. If the defending king can step inside that square, it catches the pawn.
- **King in front of the pawn:** when promoting a pawn with your king's help, put the king in front of the pawn, not behind it.

#### Rook endings

The most common endings. Two famous ideas:

- **Lucena position (winning):** build a "bridge" with your rook to shield your king from checks and promote the pawn.
- **Philidor position (drawing):** the defender keeps the rook on their third rank until the pawn advances, then checks from behind.
- And a rule: **rooks belong behind passed pawns**, both your own and the opponent's.

#### Draw rules the game knows

My Ihsan's engine plays the full rules, so remember these when you are behind:

- **Stalemate** (buntu): no legal move and not in check. Draw.
- **Threefold repetition**: the same position three times. Draw.
- **50-move rule**: 50 moves each with no capture and no pawn move. Draw.
- **Insufficient material**: for example king and bishop vs king. Draw.

When losing, look for a stalemate trick or a repetition. When winning, avoid them.

---

### Strategy cheat sheet

| Phase | Main goal | Key question |
|---|---|---|
| Opening | Develop, centre, castle | "Have I developed all my pieces?" |
| Middlegame | Tactics and plans | "What is my worst piece? Where should I attack?" |
| Endgame | Active king, passed pawns | "Can I make a passed pawn? Is my king active?" |

---

## Chapter 5: Training plan in My Ihsan

How to use the features of **Explore › 3D chess** to improve step by step.

### The tools you have

| Feature | How it helps you train |
|---|---|
| 🤖 **Robot level 1 · Easy** | Practise opening principles and the quick traps from chapter 1 |
| 🤖 **Robot level 2 · Medium** | Practise your openings and basic tactics |
| 🤖 **Robot level 3 · Hard** | Real games: play slowly and use the thinking routine |
| ⚪ / ⚫ / 🔀 **I play** | Practise both colours; your black openings need training too |
| ⏱ **Clock** (None, 3+2, 5+0, 10+0, 15+10, 30+0) | Start with no clock or 30+0; use 3+2 and 5+0 only for fun |
| ↶ **Undo** | Take back a blunder and find the right move (training games only) |
| 🔄 **Flip board** | See the position from your opponent's side to spot their threats |
| 📜 **Move list** | Review the game and find where it turned |
| 👥 **2 players** | Play friends and family, or set up famous games and play through them |
| ↩ **Resume** | The game is saved, so you can think about a hard position later |
| 🏆 **Won / Lost / Drawn** | Your record against the robot is shown on the chess banner |

---

### Week 1: Basics and quick traps

- **Learn notation** from the [guide index](#how-to-read-the-moves). Watch the 📜 move list as you play.
- Play **Fool's mate and Scholar's mate** in 2-player mode to see how they work, then play the defence to each.
- Play **5 games against robot level 1** as white, using the Italian Game. Goal: castle in every game.
- Learn the **king and queen vs king** mate. Practise until you can do it without stalemate.

### Week 2: Openings and tactics

- Pick **one opening as white** and **one reply to 1.e4** from [chapter 2](#chapter-2-popular-openings).
- Play **5 games against level 2** with each colour.
- Every day, spend 10 minutes on the tactical patterns in [chapter 4](#chapter-4-strategy-and-tactics): forks, pins and skewers.
- After each game, open the move list and write down the first move where you lost material.

### Week 3: Thinking routine

- Play **level 2 with a 30+0 clock**. Before every move, follow the routine in [chapter 3](#chapter-3-thinking-like-a-professional): opponent's last move → checks, captures, threats → candidates → blunder check.
- Use **Undo** only after the game ends: go back to your mistake and find a better move.
- Learn the **king and rook vs king** mate and the **rule of the square**.
- Play through the **Opera Game** in 2-player mode, guessing white's moves.

### Week 4: Real games

- Play **level 3 with 15+10**. No undo during the game.
- Add **one reply to 1.d4** to your repertoire.
- Review every loss: was it a tactic you missed (chapter 4, Part B), a bad plan (Part D) or the clock?
- Goal: your first win against level 3.

---

### Daily 20-minute routine

| Minutes | Activity |
|---|---|
| 5 | Review one trap or mating pattern from chapters 1 and 4 |
| 10 | One game against the robot (or a few moves of a longer saved game) |
| 5 | Look at the move list and find your best and worst move |

---

### Checklist before every move ✅

1. What did my opponent just do?
2. Any checks, captures or threats, for me or for them?
3. Do I have 2 or 3 candidate moves?
4. What is their best reply?
5. Is anything of mine left undefended? Is my back rank safe?

Good luck, and enjoy the game. ♟️
