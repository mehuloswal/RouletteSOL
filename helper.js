function totalAmtToBePaid(investment) {
  return investment + 0.05 * investment;
}

function getReturnAmount(investment, stakeFactor) {
  return investment * stakeFactor;
}
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = { randomNumber, totalAmtToBePaid, getReturnAmount };
