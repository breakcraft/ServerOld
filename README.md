# Lost City – May 18 2004

> **NOTE**  
> Learn about our history and ethos on our forum:  
> <https://lostcity.rs/t/faq-what-is-lost-city/16>

## Getting Started

> **IMPORTANT**  
> If you run into issues, please see our [common issues](#common-issues).

1. **Download and extract** this repo somewhere on your computer.  
2. **Install** the required [dependencies](#dependencies).  
3. **Open the folder** you downloaded, run the quick-start script and follow the prompts.  
   You may disregard any “severity” warnings.

After setup completes, wait until the console says **“World started”** before launching the game.  
The server ships with its own web client, so you don’t need a separate download!

## Dependencies

- [Node.js 22](https://nodejs.org/)  
- [Java 17 (LTS)](https://adoptium.net/) — later LTS versions work too.

> **TIP**  
> Using VS Code? Install our [RuneScript Language extension](https://marketplace.visualstudio.com/items?itemName=2004scape.runescriptlanguage).

## Workflow

| Role | Command | What it does |
|------|---------|--------------|
| **Content devs** | `npm start` | Watches scripts/configs, repacks on change |
| **Engine devs**  | `npm run dev` | Same as above **plus** full server restart on engine changes |

## Common Issues

- **`bad option: --import`** – Upgrade to Node 22 and rerun.  
- **`"java" is not recognised …`** – Java not installed or not in `PATH`.  
- **Class-file version 61.0 error** – You’re on Java 8/11; set `JAVA_PATH=<path-to-java17>` in `.env`.

## License

Licensed under the [MIT License](LICENSE).
