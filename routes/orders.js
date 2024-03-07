const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create an order
router.post('/create', async (req, res) => {
  const { userId, items } = req.body; // items: array of { itemId, quantity }

  try {
    // Validate userId and items
    if (!userId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const order = await prisma.order.create({
      data: {
        userId: userId,
        orderItems: {
          createMany: {
            data: items.map(item => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        orderItems: true,
      },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            foodItem: true,
          },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving orders', details: error.message });
  }
});

// Get an order by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            foodItem: true,
          },
        },
      },
    });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving order', details: error.message });
  }
});

// Update an order (assuming updating the entire order's items)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; // New set of items

  try {
    // Validate items
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Create new items
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderItems: {
          createMany: {
            data: items.map(item => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        orderItems: true,
      },
    });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order', details: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({
      where: { id },
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting order', details: error.message });
  }
});

module.exports = router;
