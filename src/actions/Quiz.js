const Settings = require('../lib/Settings'), utils = require('../lib/Utils'), {getDoc} = require('../lib/ReadLib'),
    pointsBank = require("../lib/PointsBank"), itemStorage = require("../lib/ItemStorage");

const AnswerReward = 5;
const TimeLimit = 10;

let shouldStopQuiz = false, answerTimeout;

/// utils etc.

async function getPollQuestion(client, channel, quiz, questions, totalQuestions, questionsLeft) {

    if (shouldStopQuiz) return;
    const question = quiz.splice(Math.floor(Math.random() * quiz.length), 1),
        answer = questions[question];

    // look for special prize
    const prizes = await itemStorage.getInventory(client, client.user.id, {type: "prize"});
    let specialPrize = false;

    if (prizes.length > 0 && totalQuestions >= 5 && questionsLeft*1 === 1) {
        specialPrize = true;
        channel.send("I have a special prize waiting for whoever answers this...");
    }

    channel.send(`Question ${totalQuestions-(questionsLeft-1)}/${totalQuestions}: ${question}`);
    questionsLeft--;

    const winningAnswer = await utils.awaitResponses(channel, answer, 10),
        winner = winningAnswer ? winningAnswer.author.id : false;

    if (winner) {
        if (specialPrize) {
            if (!shouldStopQuiz) {
                const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
                await itemStorage.giveItem(client, client.user.id, winner, randomPrize.name);
                channel.send("<@" + winner + "> is correct! You win a special prize: " + randomPrize.name + "!");
            }
        } else {
            if (!shouldStopQuiz) {
                await pointsBank.givePoints(client, client.user.id, winner, AnswerReward);
                channel.send("<@" + winner + "> is correct! You win " + AnswerReward + " punk points");
            }
        }
    }
    else {
        if (!shouldStopQuiz) channel.send("Nobody got that... Better luck next time!");
    }

    if (questionsLeft > 0) answerTimeout = setTimeout(()=> getPollQuestion(client, channel, quiz, questions, totalQuestions, questionsLeft), 1000);
    else if (totalQuestions > 1) channel.send("ok, we're done for now. Thanks for playing!");

}

//// actions

function listQuestions(req) {
    const {channel, message, author} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    const questions = Object.keys(Settings.get('quiz-questions', {}));
    return channel.send("**Ok <@"+author.id+">, here are all the questions:**\n"+questions.join("\n"))
}

function resetQuiz(req) {
    const {channel} = req;
    return channel.send("Ok, reset the quiz questions");
}

function stopQuiz(req) {
    const {channel, message, author} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    shouldStopQuiz = true;
    clearTimeout(answerTimeout);
    return channel.send("Ok <@"+author.id+">, the quiz is over. Everybody go home!")
}

function addQuestion(req) {

    const {content, channel, message, author,} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    const s = content.split("|").map(r => r.trim());
    if (s.length < 2) return channel.send("Missing quiz answer");
    if (s.length > 2) return channel.send("Use just one | separator");
    const q = s[0], a = s[1];

    const questions = Settings.get('quiz-questions', {});
    questions[q] = a;

    Settings.set('quiz-questions', questions);
    return channel.send("Ok, set the quiz question and its answer");
}

function removeQuestion(req) {

    const {props, author, channel, message} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    const s = props.join(" ");
    const questions = Settings.get('quiz-questions', {});
    if (!questions[s]) {
        return channel.send("Couldn't find this quiz question to remove");
    }
    delete questions[s];
    Settings.set('quiz-questions', questions);
    return channel.send("Ok, removed quiz question");

}

async function startQuiz(req, target, value, doc) {

    const {author, channel, client, message} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@" + author.id + ">, Don't tell me what to do!");

    const amount = (doc.match('#NumericValue+').text() || "1")*1
    const points = await pointsBank.getPoints(client, client.user.id);
    if (points < AnswerReward * amount) return channel.send("Sorry boss, I'm too broke.");

    const questions = Settings.get('quiz-questions', {}), qs = Object.keys(questions);
    if (qs.length < amount) { return channel.send("Sorry boss, I don't have that many questions."); }

    // Ok - quiz can run. /////////////////////////////////////////////////////////////////////////////////////////////

    shouldStopQuiz = false;

    const quiz = [], all = [...qs];
    while (quiz.length < amount) quiz.push(all.splice(Math.floor(Math.random() * all.length), 1));

    channel.send(`ok <@${author.id}>. Starting Quiz!`)
    await getPollQuestion(client, channel, quiz, questions, amount, amount);
}

module.exports = {
    addQuestion,
    removeQuestion,
    listQuestions,
    startQuiz,
    stopQuiz,
    resetQuiz,
};
