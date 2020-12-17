Bebop
------
###### A hilarious **discord.js** bot for the punk/hc server

Bebop is a DIY punk project so why not put it online and make it open source? 

### Installation

#### Requirements
- A Discord app with a bot.
  You can create a discord app in the [Discord developers website](https://discord.com/developers/).
  Afterwards, create a bot and copy its token.
- node.js version  >= 12

#### 1. create credentials.js

- You will need to create a **credentials file** and place it under `src/sec/credentials.js`
- Use `src/sec/credentials-example.js` as a template for the file.  
- The credentials file should contain your **discord app bot token** under `token` and the
desired `username` for the bot. 
    
#### 2. Run `yarn install` or `npm install` to load dependencies

#### 3. Run bebop
After the credentials file is created, run bebop with `node index.js`.
 
If you a more appropriate way to run it - D.I.Y

#### 4. Invite bebop to your discord server
Read the documentation on [inviting a bot to a Discord server here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html).
