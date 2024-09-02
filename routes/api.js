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


// Endpoint to get revenue by day
router.get('/revenue-by-day', async (req, res) => {
  try {
    // Fetch all orders with their amounts and createdAt dates
    const orders = await prismaClient.order.findMany({
      select: {
        createdAt: true,
        amount: true,
      }
    });

    // Group by the exact date instead of just the day of the week
    const revenueByDate = orders.reduce((acc, order) => {
      // Extract date in 'YYYY-MM-DD' format
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.amount;
      return acc;
    }, {});

    // Convert to array format
    const result = Object.entries(revenueByDate).map(([day, totalRevenue]) => ({
      day,
      totalRevenue
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching revenue by day:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});


  // Endpoint to get yearly revenue
router.get('/yearly-revenue', async (req, res) => {
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

    const yearlyRevenue = revenueData.reduce((acc, item) => {
      const year = item.createdAt.getFullYear();
      if (!acc[year]) {
        acc[year] = 0;
      }
      acc[year] += item._sum.amount;
      return acc;
    }, {});

    const formattedYearlyRevenue = Object.entries(yearlyRevenue).map(([year, totalRevenue]) => ({
      year,
      totalRevenue
    }));

    // Reverse the order to have the most recent year last
    formattedYearlyRevenue.reverse();

    res.json(formattedYearlyRevenue);
  } catch (error) {
    console.error('Error fetching yearly revenue:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Total Revenue
router.get('/total-revenue', async (req, res) => {
  try {
    const totalRevenue = await prismaClient.order.aggregate({
      _sum: {
        amount: true
      }
    });
    res.json({ totalRevenue: totalRevenue._sum.amount || 0 });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    res.status(500).json({ error: 'Error fetching total revenue' });
  }
});

// Total Number of Orders
router.get('/total-orders', async (req, res) => {
  try {
    const totalOrders = await prismaClient.order.count();
    res.json({ totalOrders });
  } catch (error) {
    console.error('Error fetching total number of orders:', error);
    res.status(500).json({ error: 'Error fetching total number of orders' });
  }
});

// Pending Orders
router.get('/pending-orders', async (req, res) => {
  try {
    const pendingOrders = await prismaClient.order.count({
      where: { status: 'PENDING' }
    });
    res.json({ pendingOrders });
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Error fetching pending orders' });
  }
});

// Preparing Orders
router.get('/preparing-orders', async (req, res) => {
  try {
    const preparingOrders = await prismaClient.order.count({
      where: { status: 'preparing' }
    });
    res.json({ preparingOrders });
  } catch (error) {
    console.error('Error fetching preparing orders:', error);
    res.status(500).json({ error: 'Error fetching preparing orders' });
  }
});

// Delivered Orders
router.get('/delivered-orders', async (req, res) => {
  try {
    const deliveredOrders = await prismaClient.order.count({
      where: { status: 'delivered' }
    });
    res.json({ deliveredOrders });
  } catch (error) {
    console.error('Error fetching delivered orders:', error);
    res.status(500).json({ error: 'Error fetching delivered orders' });
  }
});

// Endpoint to get order transactions
router.get('/order-transactions', async (req, res) => {
  try {
    const transactions = await prismaClient.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)) // last 30 days
        }
      },
      include: {
        orderItems: true
      }
    });

    const transactionData = transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.createdAt.toISOString().split('T')[0],
      totalAmount: transaction.amount,
      contactPerson: transaction.contactPerson || 'N/A',
      items: transaction.orderItems.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      }))
    }));

    res.json(transactionData);
  } catch (error) {
    console.error('Error fetching order transactions:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});




module.exports = router;
