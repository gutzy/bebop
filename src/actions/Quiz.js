const Settings = require('../lib/Settings'), utils = require('../lib/Utils'), {getDoc} = require('../lib/ReadLib'),
    pointsBank = require("../lib/PointsBank"), itemStorage = require("../lib/ItemStorage");

const AnswerReward = 5;
const TimeLimit = 10;
const MinimumQuestionsForPrizeAwards = 5;

let quizStarted = false, shouldStopQuiz = false, answerTimeout;

/// utils etc.

async function getPollQuestion(client, channel, quiz, questions, totalQuestions, questionsLeft) {

    if (shouldStopQuiz) return;
    const question = quiz.splice(Math.floor(Math.random() * quiz.length), 1),
        answer = questions[question];

    // look for special prize
    const prizes = await itemStorage.getInventory(client, client.user.id, {type: "prize"});
    let specialPrize = false;

    if (prizes.length > 0 && totalQuestions >= MinimumQuestionsForPrizeAwards && questionsLeft*1 === 1) {
        specialPrize = true;
        channel.send("I have a special prize waiting for whoever answers this...");
    }

    channel.send(`Question ${totalQuestions-(questionsLeft-1)}/${totalQuestions}: ${question}`);
    questionsLeft--;

    const winningAnswer = await utils.awaitResponses(channel, answer, { time: TimeLimit }),
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

    if (questionsLeft === 0) quizStarted = false;
}

//// actions

function listQuestions(req) {
    const {channel, message, author} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    const questions = Object.keys(Settings.get('quiz-questions', {}));
    let str = ``;
    for (let i = 0; i < questions.length; i++) { str += `${i+1}: ${questions[i]}\n`; }

    return channel.send("**Ok <@"+author.id+">, here are all the questions:**\n"+str)
}

function stopQuiz(req) {
    const {channel, message, author} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    shouldStopQuiz = true;
    quizStarted = false;
    clearTimeout(answerTimeout);
    return channel.send("Ok <@"+author.id+">, the quiz is over. Everybody go home!")
}

async function addQuestion(req) {

    const {content, channel, message, author} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    channel.send(`<@${author.id}>, ok. Enter the question to add:`)
    const question = await utils.awaitResponses(channel,"*", { from: author, time: 30 })
    if (!question) return channel.send("No question entered.. Let's try again later.");

    channel.send(`<@${author.id}>, ok. Enter the answer:`)
    const answer = await utils.awaitResponses(channel,"*", { from: author, time: 30 })
    if (!answer) return channel.send("No answer entered.. Let's try again later.");

    const questions = Settings.get('quiz-questions', {});
    questions[question.content.trim()] = answer.content.trim();
    Settings.set('quiz-questions', questions);
    return channel.send("Ok, added question!")

}

async function removeQuestion(req, target, value, doc) {

    const {props, author, channel, message} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@"+author.id+">, Don't tell me what to do!");

    let index = doc.match('#NumericValue$').text();

    if (!index) {
        channel.send("Enter the # of the question you want to remove:")
        index = await utils.awaitResponses(channel, '^#NumericValue$', {from: author, time: 10});
        index = getDoc(index.content).match('#NumericValue').text();
    }

    if (!index) return channel.send("No question # entered... Let's try again later.")

    index = index *1 - 1;

    const questions = Settings.get('quiz-questions', {});
    const qs = Object.keys(questions);
    if (index < 0 || index > qs.length || !qs[index]) return channel.send("Question # is out of range")

    channel.send("Are you sure you want to remove the following question? (answer yes/no)\n - "+qs[index]);
    const yesNo = await utils.awaitResponses(channel, '(yes|no)', {from: author, time: 10});
    if (!yesNo) return channel.send("Didn't get a removal confirmation... Aborting.")
    console.log(yesNo.content);

    if (getDoc(yesNo.content).has('no')) return channel.send("Ok, aborting.");

    else if (getDoc(yesNo.content).has('yes')) {
        delete questions[qs[index]];
        Settings.set('quiz-questions', questions);
        return channel.send("Ok, removed quiz question");
    }
}

async function startQuiz(req, target, value, doc) {

    const {author, channel, client, message} = req;
    if (!utils.validateModMessage(message, channel)) return channel.send("<@" + author.id + ">, Don't tell me what to do!");

    if (quizStarted) return channel.send(`<@${author.id}>, there is already a quiz running right now. You can ask me to stop it.`)

    const amount = (doc.match('#NumericValue+').text() || "1")*1
    const points = await pointsBank.getPoints(client, client.user.id);
    if (points < AnswerReward * amount) return channel.send("Sorry boss, I'm too broke.");

    const questions = Settings.get('quiz-questions', {}), qs = Object.keys(questions);
    if (qs.length < amount) { return channel.send("Sorry boss, I don't have that many questions."); }

    // Ok - quiz can run. /////////////////////////////////////////////////////////////////////////////////////////////

    shouldStopQuiz = false;
    quizStarted = true;

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
};
