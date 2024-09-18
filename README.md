# Chibitronics fork of the micro:bit MakeCode frontend

## Why fork the micro:bit MakeCode frontend?
Chibitronics is working on a clip for the micro:bit! We're implementing a MakeCode extension to make coding with the clip easier.

We are implementing the extension using the public [MakeCode Extension API](https://makecode.com/extensions/getting-started), but we also want to extend the micro:bit simulator to include a visualization of the Chibi Clip.

Here's a screenshot of the WIP vizualization:

<img width="369" alt="CleanShot 2024-09-18 at 18 39 05@2x" src="https://github.com/user-attachments/assets/c9e351d4-3a86-4ab5-bdaf-dcebc2c9bc5b">

In order to implement a custom visualization, we need to extend the MakeCode frontend code to include this visualization code and logic. This is why we need have this fork!

## Build and run instructions

To build and run this locally:

1. Clone the chibitronics/pxt-microbit GitHub repository
2. In `pxt-microbit/`, run `npm install`
3. Run `npm run start`

There will be a lot of build messages in the console.

When it has finished building, the script should open the MakeCode frontend in your browser!

### Heads up: Patched changes to `pxt`

Note that we also needed to make changes to [https://github.com/microsoft/pxt](https://github.com/microsoft/pxt), which is the repository for the `pxt-core` npm module that `pxt-microbit` depends on. In this repository, we're implementing this by using the npm tool, `patch-package`, which applies a patch to `node_modules/pxt-core` after installing the module.

If you want to update this patch, you should follow the instructions in [https://github.com/chibitronics/pxt](https://github.com/chibitronics/pxt)!

## Deploying to prod -- be careful!! Pushes to `master` are auto-deployed :D

The production site is here: [https://microbit.chibitronics.com/#editor](https://microbit.chibitronics.com/#editor)


The MakeCode frontend is a (giant) static site, so we can deploy it on a simple static host. Our frontend is hosted on AWS S3.

Running `npm run build` will create a production build of the frontend in `./built/packaged`. Because we have a GitHub workflow to manage pushes to prod, we shouldn't normally need to create a production build by running this command manually. (We might use it to test bugs that only occur in the production build and not the dev build, or if we are having problems with our GitHub workflow.)

**In this repo, we've set up a [GitHub workflow](https://github.com/chibitronics/pxt-microbit/blob/master/.github/workflows/main.yml) that automatically deploys changes to `master` branch to prod.** 

NOTE: Changes will take up to an hour to be reflected on microbit.chibitronics.com, due to Cloudflare caching.


