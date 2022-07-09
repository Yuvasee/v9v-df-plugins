**Vectors** plugin for Dark Forest. Energy and silver automated logistics with clear visualization + cool perks.

![Vectors screenshot](https://github.com/yuvasee/v9v-df-plugins/blob/main/docs/screenshot.png?raw=true)

# Installation

- clone this repo to local folder
- run `yarn` to install dependencies
- run `yarn dev` to start serving plugins
- add plugin to the game using the next code snippet:

```js
export { default } from "http://127.0.0.1:2222/v9v_Vectors.js?dev";
```

# Features

## Energy and silver automated logistics with clear visualization

- "E" mode
  - Captures if needed + repeatedly sends energy until target reaches energy cap.
  - Sends only when donor reaches max effective energy level (default is 80%).
  - Never sends energy over planet cap - current - incoming (arriving in next 10 seconds).
- "Es" mode
  - Like "E" mode + sends silver.
- "S" mode
  - Sends silver until target reaches silver cap.
  - Not sends when donor silver < 10% of cap.
  - Never sends silver over planet cap - current - incoming.
- "Se" mode
  - Like "S" mode + sends energy.
- "C" mode
  - Captures planet and puts min energy on it, then automatically self-drops.

## Settings

- Max/min planet energy percent limits, 20/80 by default.

## Auto-upgrades

- Always on.
- Automatically upgrades planets when they have enough silver.
- Maximizes distance, then speed.

## Auto-claim victory

- Always on.
- Checks all the time for victory conditions and claims victory when ready.

## What else?

- All the settings and vectors for the game are persisted to browser local.
