// bestSellerRouter.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const bestSellers = await prisma.orderItem.groupBy({
      by: ['itemId'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5, // Limit to 5 best sellers
    });

    const bestSellerItems = [];
    for (let i = 0; i < bestSellers.length; i++) {
      const bestSellerId = bestSellers[i].itemId;
      const bestSellerItem = await prisma.foodItem.findUnique({
        where: {
          id: bestSellerId,
        },
      });
      bestSellerItems.push(bestSellerItem);
    }

    res.render('bestSeller', { bestSellerItems });
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).send('Error fetching best sellers');
  }
});

module.exports = router;
