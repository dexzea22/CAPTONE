const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

// Endpoint to get order statistics
router.get('/order-stats', async (req, res) => {
  try {
    const orders = await prismaClient.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)) // last 30 days
        }
      },
      include: {
        orderItems: true
      }
    });

    const orderStats = orders.map(order => ({
      date: order.createdAt.toISOString().split('T')[0],
      totalAmount: order.amount
    }));

    res.json(orderStats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Endpoint to get top-selling items with product names
router.get('/top-selling-items', async (req, res) => {
    try {
      const items = await prismaClient.orderItem.groupBy({
        by: ['itemId'],
        _sum: {
          totalPrice: true
        },
        _count: {
          itemId: true
        },
        orderBy: {
          _sum: {
            totalPrice: 'desc'
          }
        },
        take: 10
      });

      const itemIds = items.map(item => item.itemId);

      const foodItems = await prismaClient.foodItem.findMany({
        where: {
          id: { in: itemIds }
        }
      });

      const foodItemMap = new Map(foodItems.map(item => [item.id, item.name]));

      const topItems = items.map(item => ({
        name: foodItemMap.get(item.itemId) || 'Unknown Item',
        totalSales: item._sum.totalPrice
      }));

      res.json(topItems);
    } catch (error) {
      console.error('Error fetching top-selling items:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
});

// Endpoint to get monthly revenue
router.get('/monthly-revenue', async (req, res) => {
    try {
      const revenueData = await prismaClient.order.groupBy({
        by: ['createdAt'],
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      });
  
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
  
      const monthlyRevenue = revenueData.reduce((acc, item) => {
        const month = item.createdAt.getMonth();
        const year = item.createdAt.getFullYear();
        const key = `${year}-${month < 10 ? '0' : ''}${month + 1}`;
  
        if (!acc[key]) {
          acc[key] = 0;
        }
  
        acc[key] += item._sum.amount;
  
        return acc;
      }, {});
  
      const formattedMonthlyRevenue = Object.entries(monthlyRevenue).map(([key, totalRevenue]) => {
        const [year, month] = key.split('-');
        return {
          month: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
          totalRevenue
        };
      });
  
      // Reverse the order to have the most recent month last
      formattedMonthlyRevenue.reverse();
  
      res.json(formattedMonthlyRevenue);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  });
  

// Endpoint to get daily orders trend
router.get('/daily-orders-trend', async (req, res) => {
    try {
      const orders = await prismaClient.order.groupBy({
        by: ['createdAt'],
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
  
      const dailyOrders = orders.map(order => ({
        date: order.createdAt.toISOString().split('T')[0],
        totalOrders: order._count.id
      }));
  
      res.json(dailyOrders);
    } catch (error) {
      console.error('Error fetching daily orders trend:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
});

// Endpoint to get customer satisfaction ratings
// router.get('/customer-satisfaction', async (req, res) => {
//     try {
//       // Fetch all reviews
//       const reviews = await prismaClient.review.findMany({
//         select: {
//           aspect: true,
//           rating: true
//         }
//       });
  
//       // Compute average ratings by aspect
//       const aspectRatings = reviews.reduce((acc, review) => {
//         if (!acc[review.aspect]) {
//           acc[review.aspect] = { totalRating: 0, count: 0 };
//         }
//         acc[review.aspect].totalRating += review.rating;
//         acc[review.aspect].count += 1;
//         return acc;
//       }, {});
  
//       const satisfactionData = Object.entries(aspectRatings).map(([aspect, { totalRating, count }]) => ({
//         aspect,
//         averageRating: totalRating / count
//       }));
  
//       res.json(satisfactionData);
//     } catch (error) {
//       console.error('Error fetching customer satisfaction ratings:', error);
//       res.status(500).json({ error: 'Error fetching data' });
//     }
//   });

// Endpoint to get revenue by day of the week
router.get('/revenue-by-day', async (req, res) => {
    try {
      // Fetch all orders with their amounts and createdAt dates
      const orders = await prismaClient.order.findMany({
        select: {
          createdAt: true,
          amount: true,
        }
      });
  
      // Group by day of the week manually
      const revenueByDay = orders.reduce((acc, order) => {
        const dayOfWeek = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
        if (!acc[dayOfWeek]) {
          acc[dayOfWeek] = 0;
        }
        acc[dayOfWeek] += order.amount;
        return acc;
      }, {});
  
      // Convert to array format
      const result = Object.entries(revenueByDay).map(([day, totalRevenue]) => ({
        day,
        totalRevenue
      }));
  
      res.json(result);
    } catch (error) {
      console.error('Error fetching revenue by day of the week:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  });

module.exports = router;
