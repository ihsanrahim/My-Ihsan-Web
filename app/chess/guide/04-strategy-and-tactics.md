# 4 · Strategy and tactics

> *"Tactics is knowing what to do when there is something to do. Strategy is knowing what to do when there is nothing to do."* (attributed to Savielly Tartakower)

A game has three phases: the **opening** (about the first 10 to 15 moves), the **middlegame** and the **endgame**. Each one needs a different way of thinking.

---

## Part A: Opening principles

1. **Control the centre** (d4, d5, e4, e5) with pawns and pieces.
2. **Develop knights and bishops** quickly, knights usually before bishops.
3. **Castle early** to keep the king safe and bring a rook to the centre.
4. **Don't move a piece twice** without a good reason.
5. **Don't bring the queen out too early.** It gets chased and you lose time.
6. **Connect your rooks** (nothing standing between them on the back rank).
7. **Don't grab pawns** at the cost of development.

---

## Part B: Tactics, the patterns that win material

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

## Part C: Mating patterns

Recognise these finishing shapes and you will find mates much faster.

### Back-rank mate

The king is trapped behind its own pawns (for example on g8 with pawns on f7, g7, h7), and a rook or queen mates on the back rank.

**Defence:** make a "luft" (an escape square) by moving a pawn such as `h6` / `h3`, or keep a rook on the back rank.

### Smothered mate

A knight gives check and the king cannot move because its own pieces surround it. Seen in the Blackburne, Caro-Kann and Kieninger traps in [chapter 1](01-fastest-checkmates.md).

### Arabian mate

A rook and knight mate a king in the corner: the rook gives check next to the king (for example on h7 against a king on h8), protected by the knight, which also covers g8. One of the oldest known patterns, already described in Arabic manuscripts of shatranj.

### Anastasia's mate

A knight on e7 covers g8 and g6, and a rook or queen mates on the h-file against a king on h7, whose own pawn on g7 blocks its escape.

### Boden's mate

Two bishops on crossing diagonals mate a king that has castled queenside, often after a queen sacrifice on c6 or c3.

### Ladder (lawnmower) mate

Two rooks (or a rook and queen) take turns pushing the king to the edge, one rank at a time, then mate it there. The easiest way to finish when you are far ahead.

### Queen and king mate

The queen gives mate on a square next to the enemy king, protected by its own king or another piece.

---

## Part D: Middlegame strategy

When there is no tactic, follow a plan.

### 1. Find your worst piece and improve it

A bishop blocked by its own pawns, a knight on the edge ("a knight on the rim is dim"), a rook on a closed file: move these to better squares.

### 2. Rooks belong on open files

An **open file** has no pawns. A **half-open file** has only the opponent's pawn. Put rooks there, and double them if you can. A rook on the 7th rank (2nd for black) is very strong.

### 3. Knights love outposts

An **outpost** is a square in the opponent's half that no enemy pawn can attack, ideally supported by your own pawn. A knight on d5 or e5 that cannot be chased is often worth more than a bishop.

### 4. Bishops love open positions

Two bishops (the "bishop pair") are strong in open positions with few pawns. In closed positions knights are often better.

### 5. Pawn structure

| Weakness | What it means | How to use it |
|---|---|---|
| **Isolated pawn** | No friendly pawn on the files beside it | Block it with a piece, then attack it |
| **Doubled pawns** | Two pawns on the same file | They defend each other badly |
| **Backward pawn** | Cannot be protected by a neighbour and cannot advance safely | Put pressure on it and the square in front |
| **Passed pawn** | No enemy pawn can stop it on its way to promotion | "Passed pawns must be pushed." Support it with pieces |

### 6. Attack where you are stronger

Pawns point the way. If your pawn chain points to the kingside (for example white pawns on d4 and e5), attack on the kingside. Attack the king only when you have more pieces near it than the defender.

### 7. Pawn breaks

A **pawn break** is a pawn move that challenges the opponent's chain and opens lines (for example `...c5` or `...f6` in the French, `...f5` in the King's Indian). Most plans are built around one key break.

### 8. Space

If you have more space, avoid trades so your opponent stays cramped. If you are cramped, trade pieces to get room.

---

## Part E: Endgames

In the endgame the **king becomes a fighting piece**. Bring it to the centre.

### Must-know mates

**King and queen vs king.** Use the queen to shrink the enemy king's box a knight's move away from it, bring your own king close, then mate on the edge. Careful: always leave the enemy king at least one move, or it is **stalemate** (a draw).

**King and rook vs king.** Use the rook to cut the king off rank by rank. Bring your king opposite the enemy king (with one square between), then check with the rook along the edge.

**Two rooks vs king.** The ladder mate from Part C.

### King and pawn endings

- **Opposition:** when the kings face each other with one square between them, the side that does *not* have to move usually wins the fight. This decides many pawn endings.
- **Rule of the square:** draw a square from the pawn to its promotion rank. If the defending king can step inside that square, it catches the pawn.
- **King in front of the pawn:** when promoting a pawn with your king's help, put the king in front of the pawn, not behind it.

### Rook endings

The most common endings. Two famous ideas:

- **Lucena position (winning):** build a "bridge" with your rook to shield your king from checks and promote the pawn.
- **Philidor position (drawing):** the defender keeps the rook on their third rank until the pawn advances, then checks from behind.
- And a rule: **rooks belong behind passed pawns**, both your own and the opponent's.

### Draw rules the game knows

My Ihsan's engine plays the full rules, so remember these when you are behind:

- **Stalemate** (buntu): no legal move and not in check. Draw.
- **Threefold repetition**: the same position three times. Draw.
- **50-move rule**: 50 moves each with no capture and no pawn move. Draw.
- **Insufficient material**: for example king and bishop vs king. Draw.

When losing, look for a stalemate trick or a repetition. When winning, avoid them.

---

## Strategy cheat sheet

| Phase | Main goal | Key question |
|---|---|---|
| Opening | Develop, centre, castle | "Have I developed all my pieces?" |
| Middlegame | Tactics and plans | "What is my worst piece? Where should I attack?" |
| Endgame | Active king, passed pawns | "Can I make a passed pawn? Is my king active?" |

👉 Next: [Training plan in My Ihsan](05-training-plan.md)
