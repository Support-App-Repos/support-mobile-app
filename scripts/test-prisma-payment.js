require("dotenv").config({ path: "env/.env.production" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  try {
    const plans = await prisma.paymentPlan.findMany({ take: 3 });
    console.log("PRISMA_OK", plans.length, plans.map(p => ({ id: p.id, name: p.name, price: p.price })));
  } catch (e) {
    console.error("PRISMA_FAIL", e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
