# Wayfair DeepSearch
A Demo to show some ideas in terms of helping users to drill down to deeper intent search terms

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Image generation

This Svelte app will need to call the ComfyUI backend to generate images. 

In my case, it is hosted locally. Do not forget to enable CORS for ComfyUI. 

Also listening to all IPs for incoming requests. 

Running the ComfyUI on Mac M1: 
```
python main.py --enable-cors-header --force-fp16 --listen 0.0.0.0
```

## Useful ComfyUI Doc
https://www.yunrobot.cn/showdoc/web/#/641840309/231516846