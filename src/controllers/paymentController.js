/**
 * Payment Controller
 * Handles payment plans and subscriptions
 * Uses MongoDB directly for reads to ensure compatibility
 */

const { prisma } = require('../lib/prisma');
const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');

// Get all payment plans
exports.getPaymentPlans = async (req, res) => {
  try {
    // Get MongoDB collection
    const paymentPlanCollection = await getCollection('PaymentPlan');

    // Fetch payment plans using MongoDB directly
    // Get all plans (we'll filter active ones in the mapping)
    const paymentPlanDocs = await paymentPlanCollection.find({}).sort({ type: 1 }).toArray();

    // Format payment plans to match Prisma schema
    const paymentPlans = paymentPlanDocs.map(doc => {
      // Handle both field name formats (snake_case and camelCase)
      const isActive = doc.is_active !== undefined ? doc.is_active : (doc.isActive !== undefined ? doc.isActive : true);
      const listingFee = doc.listing_fee !== undefined ? doc.listing_fee : (doc.listingFee !== undefined ? doc.listingFee : 0);
      const processingFee = doc.processing_fee !== undefined ? doc.processing_fee : (doc.processingFee !== undefined ? doc.processingFee : 0);
      
      return {
        id: doc._id.toString(),
        name: doc.name,
        type: doc.type,
        price: doc.price,
        listingFee: listingFee,
        processingFee: processingFee,
        features: doc.features || null,
        isActive: isActive !== false, // Default to true if not set
        createdAt: doc.created_at || doc.createdAt || new Date(),
        updatedAt: doc.updated_at || doc.updatedAt || new Date(),
      };
    });

    // Filter to only active plans
    const activePlans = paymentPlans.filter(plan => plan.isActive !== false);

    res.json({
      success: true,
      data: activePlans,
    });
  } catch (error) {
    console.error('Error fetching payment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment plans',
      error: error.message,
    });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const {
      listingId,
      paymentPlanId,
      promoCodeId,
      amountPaid,
      discountAmount = 0,
      paymentMethod,
      transactionId,
    } = req.body;

    if (!listingId || !paymentPlanId || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID, payment plan ID, and amount paid are required',
      });
    }

    // Get payment plan to calculate dates
    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { id: paymentPlanId },
    });

    if (!paymentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Payment plan not found',
      });
    }

    const startsAt = new Date();
    let endsAt = null;

    if (paymentPlan.type === 'monthly') {
      endsAt = new Date(startsAt);
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        listingId,
        userId,
        paymentPlanId,
        promoCodeId: promoCodeId || null,
        amountPaid: parseFloat(amountPaid),
        discountAmount: parseFloat(discountAmount),
        status: 'paid',
        paymentMethod,
        transactionId,
        startsAt,
        endsAt,
      },
      include: {
        paymentPlan: true,
        promoCode: true,
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message,
    });
  }
};

// Validate promo code
exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required',
      });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code',
      });
    }

    // Check if promo code is active and valid
    const now = new Date();
    const isValid =
      promoCode.isActive &&
      (!promoCode.validFrom || promoCode.validFrom <= now) &&
      (!promoCode.validUntil || promoCode.validUntil >= now) &&
      (!promoCode.maxUses || promoCode.usedCount < promoCode.maxUses);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is not valid or has expired',
      });
    }

    res.json({
      success: true,
      data: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      },
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message,
    });
  }
};

