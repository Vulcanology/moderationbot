const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const fs = require('fs');

let bannedWords = [];

fs.readFile('./data.json', (err, data) => {
    if (err) throw err;

    data = JSON.parse(data);
    bannedWords = data.bannedWords;
});

client.on('ready', () => {
    console.log('Logged in!');
    client.user.setActivity('yo mama');
});

client.on('message', async message => {
    if (message.author.id === message.author.bot) return;
    if (message.content.startsWith(config.prefix + "unban")) {
        let guild = message.guild
        let cmd = (config.prefix + "unban ")
        let str = (message.content);
        let targID = (str.slice(cmd.length));
        let member = message.member;
        guild.members.unban(targID).then((member) => {
            message.channel.send(`Completed.`);
        }).catch(() => {
            if (!message.member.hasPermission(['BAN_MEMBERS', 'ADMINISTRATOR'])) {
                message.reply("You do not have permission to unban members.");
            }
        })
    } else if (message.content.startsWith(config.prefix + "ban")) {
        let guild = (message.guild);
        let str = (message.content);
        let cmd = (config.prefix + "ban ");
        let targID = (str.slice(cmd.length));
        let userObject = client.users.fetch(targID);
        let memberObject = guild.member(userObject);
        let member = memberObject;
        guild.members.ban(targID).then(() => {
        message.channel.send(`Completed.`);
    }).catch(() => {
        if (!message.member.hasPermission(['BAN_MEMBERS', 'ADMINISTRATOR'])) {
            message.reply("You do not have permission to ban members.");
        } else if (member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR'])) {
            message.reply("You cannot ban this member.");
        }
    })
    } else if (message.content.startsWith(`${config.prefix}kick`)) {
        let member = message.mentions.users.first();
        const memberTarg = message.guild.members.cache.get(member.id)
        console.log(member)
        memberTarg.kick().then(() => {
            message.channel.send(`Completed.`);
        }).catch(() => {
            if (!message.member.hasPermission(['KICK_MEMBERS', 'ADMINISTRATOR'])) {
                message.reply("You do not have permission to kick this member.");
            } else if (member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR'])) {
                message.reply("You cannot kick this member.");
            }
        })
    }

    if (!message.member.hasPermission("ADMINISTRATOR")) return;
    if (message.content.toLowerCase() === (config.prefix + 'bl')) {
        message.author.createDM().then(async channel => {
            message.delete();
            channel.send(`All blacklisted words are as follows: ${bannedWords.join(", ")}.`);
            message.reply('Check your DMs for a list of blacklisted words.')
                .then(msg => {
                    setTimeout(() => msg.delete(), 8000)
                  })
        .catch("Looks like that didn't work. Please try again later.");
                })
        }
    if (bannedWords.some(word => message.toString().toLowerCase().includes(word))) {
        message.delete().catch(e => console.error(`Message by ${message.author} couldn't be deleted. Please restart the bot, and if failure persists, retreive help, preferably from a knowledgable peer.`));
        var response = await message.reply(`please do not swear.`);
        setTimeout(() => response.delete(), 3000);
    }
    if (message.content.toLowerCase().startsWith(config.prefix + 'blacklist add ')) {
        let newWord = (message.content.toLowerCase().substring(config.prefix + 'blacklist add '));
        bannedWords.push(newWord);

    }
    if (message.content.toLowerCase().startsWith('$blacklist remove')) {
        let removeWord = message.content.substring(`${config.prefix}blacklist remove `.length, message.content.length);
        bannedWords.filter(removeWord);
        
        let data = JSON.stringify({
            bannedWords: bannedWords
        }, null, 4);
        fs.writeFile('./data.json', data, err => {
            if (err) throw err;
            message.reply('that word has been removed from the filter.');
        });
    };
});

client.login(config.token);