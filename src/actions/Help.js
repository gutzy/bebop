function showHelp(props, author, channel, guild, client, message) {

    const str = `Hey <@${author.id}>, I'll try to help!
I am **bebop** and I am here to kill the ninja turtles! and show ROCKSTEADY that I am not a stupid!!! 
When you want my attention, please start by typing \`Bebop,\` before your question.
For example, \`Bebop, spare some Change?\`

- You can ask \`How punk Am I?\` and I will tell you how punk you are
- You can also check how punk anyone else is, by asking me \`How punk is [tagged-username]\`
- You can ask me to \`Give [tagged-username] 5 punk points\` and I will give him 5 punk points
- If you don't have any points, ask me to \`Spare some change\` and I will give you some. But just once.
- You can ask me to remember something by saying \`Remember [something]\`, and when you ask me \`Do you remember?\` I will tell you what I remember
- You can also ask me any other question. I know a lot of things!
`

    return channel.send(str);
}


module.exports = {
    showHelp
};
