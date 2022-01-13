const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const web3 = require("@solana/web3.js");

const { getWalletBalance, transferSOL, airDropSol } = require("./solana.js");
const {
  getReturnAmount,
  totalAmtToBePaid,
  randomNumber,
} = require("./helper.js");

const userWallet = web3.Keypair.generate();
const userPublicKey = new web3.PublicKey(userWallet.publicKey).toString();
const userSecretKey = userWallet.secretKey;

const constructor = async () => {
  console.log(
    chalk.green(
      figlet.textSync("THE SOL ROULETTE", {
        font: "Wavy",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log(chalk.cyan`The max bidding amount is 2 SOL.`);
  await airDropSol(userWallet, 2);
};
//Treasury
const secretKey = [
  111, 188, 76, 169, 30, 105, 254, 33, 228, 66, 56, 215, 9, 37, 51, 188, 188,
  188, 20, 224, 228, 115, 17, 163, 151, 105, 113, 251, 105, 177, 28, 157, 125,
  202, 195, 203, 253, 137, 26, 209, 7, 2, 66, 193, 76, 241, 203, 168, 213, 5,
  226, 11, 142, 44, 125, 191, 167, 172, 166, 207, 176, 137, 210, 27,
];

const treasuryWallet = web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));

const game = () => {
  const questions = [
    {
      name: "SOL",
      type: "number",
      message: "Enter you bidding amount in SOL",
    },
    {
      type: "rawlist",
      name: "RATIO",
      message: "What is the ratio of your staking?",
      choices: ["1:1.25", "1:1.5", "1:1.75", "1:2"],
      filter: function (val) {
        const stakeFactor = val.split(":")[1];
        return stakeFactor;
      },
    },
    {
      type: "number",
      name: "RANDOM",
      message: "Guess a random number from 1 to 5 (both 1, 5 included)",
      when: async (val) => {
        if (parseFloat(totalAmtToBePaid(val.SOL)) > 5) {
          console.log(
            chalk.red`You have violated the max stake limit. Stake with a smaller amount.`
          );
          return false;
        } else {
          // console.log("In when")
          console.log(
            `You need to pay ${chalk.green`${totalAmtToBePaid(
              val.SOL
            )}`} to move forward`
          );
          const userBalance = await getWalletBalance(
            userWallet.publicKey.toString()
          );
          if (userBalance < totalAmtToBePaid(val.SOL)) {
            console.log(
              chalk.red`You don't have enough balance in your wallet`
            );
            return false;
          } else {
            console.log(
              chalk.green`You will get ${getReturnAmount(
                val.SOL,
                parseFloat(val.RATIO)
              )} if guessing the number correctly`
            );
            return true;
          }
        }
      },
    },
  ];
  return inquirer.prompt(questions);
};

const gameExecution = async () => {
  constructor();
  const randint = randomNumber(1, 5);
  const answers = await game();
  if (answers.RANDOM) {
    const paymentSignature = await transferSOL(
      userWallet,
      treasuryWallet,
      totalAmtToBePaid(answers.SOL)
    );
    console.log(
      `Signature of payment for playing the game`,
      chalk.green`${paymentSignature}`
    );
    if (answers.RANDOM === randint) {
      await airDropSol(
        treasuryWallet,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      );
      const prizeSignature = await transferSOL(
        treasuryWallet,
        userWallet,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      );
      console.log(chalk.green`Your guess is absolutely correct!`);
      console.log(
        `Here is the price signature `,
        chalk.green`${prizeSignature}`
      );
    } else {
      //better luck next time
      console.log(
        chalk.yellowBright`Better luck next time! The number was ${randint}.`
      );
    }
  }
};

gameExecution();
// const sample = async () => {
//   await airDropSol(userWallet, 2);
// };
// sample();
