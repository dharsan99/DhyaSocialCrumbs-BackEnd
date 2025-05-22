const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const saveFacebookAccount = async ({ clientId, handle, accessToken }) => {
  return prisma.socialMediaAccount.create({
    data: {
      platform: "facebook",
      handle,
      accessToken,
      client: { connect: { id: clientId } },
    },
  });
};

module.exports = {
  saveFacebookAccount,
};