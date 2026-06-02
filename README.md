# Alice's Shape App

An interactive playground where you type to draw. Whatever you type appears big on screen, and certain words trigger shapes and colors in the background.

🎨 **Live:** https://bmichaellee.github.io/alice-app/

## How to play

Just start typing — there's no input box, the whole page listens.

- **Type a shape name** to fill the background with it: `triangle`, `circle`, `oval`, `square`, `rectangle`, `diamond`, `pentagon`, `hexagon`, `octagon`, `star`, `heart`, `arrow`, `clover`.
- **Type a color** (any CSS color name like `red`, `blue`, `aliceblue`) to wash the background in that color.
- **Type two words** — a color *and* a shape, like `red star` — to draw filled shapes in that color over a dark background with a subtle matching tint.
- **Type `alice`** for a surprise: every shape at once. 💜
- **Backspace** edits, **Esc** or **Enter** clears the screen.

Shapes and background colors fade in gently as you type.

## Develop

```bash
npm install
npm run dev
```

Built with [React](https://react.dev) + [Vite](https://vite.dev). Pushing to `main` automatically builds and deploys to GitHub Pages via GitHub Actions.
