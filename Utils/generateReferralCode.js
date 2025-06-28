////////////////////////////////////////////////// generate Referral Code ////////////////////////////////////////////////////////

function generateReferralCode(name = "") {
  const random = Math.floor(1000 + Math.random() * 9000);
  const base = name?.toLowerCase().slice(0, 3) || "usr";
  return `${base}${random}`;
}

module.exports = generateReferralCode;
