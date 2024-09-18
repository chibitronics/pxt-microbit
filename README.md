# Chibitronics fork of the micro:bit MakeCode frontend

## Why fork the micro:bit MakeCode frontend?
Chibitronics is working on a clip for the micro:bit! We're implementing a MakeCode extension to make coding with the clip easier.

We are implementing the extension using the public [MakeCode Extension API](https://makecode.com/extensions/getting-started), but we also want to extend the micro:bit simulator to include a visualization of the Chibi Clip.

Here's a screenshot of the WIP vizualization:

<img width="369" alt="CleanShot 2024-09-18 at 18 39 05@2x" src="https://github.com/user-attachments/assets/c9e351d4-3a86-4ab5-bdaf-dcebc2c9bc5b">

In order to implement a custom visualization, we need to extend the MakeCode frontend code to include this visualization code and logic. This is why we need have this fork!

## Build and run

To build and run this locally:

1. Clone the chibitronics/pxt-microbit GitHub repository
2. In `pxt-microbit/`, run `npm install`
3. Run `npm run start`

There will be a lot of build messages in the console.

When it has finished building, the script should open the MakeCode frontend in your browser!

### Heads up: Patched changes to `pxt`
