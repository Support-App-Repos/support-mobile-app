/**
 * Stripe Payment Controller
 * Handles Stripe payment processing, checkout sessions, and webhooks
 */

const stripe = require('../lib/stripe');
const { prisma } = require('../lib/prisma');
const { getUserId } = require('../helpers/userHelper');

// Create payment intent for one-time payments
exports.createPaymentIntent = async (req, res) => {
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
    } = req.body;

    if (!listingId || !paymentPlanId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and payment plan ID are required',
      });
    }

    // Get payment plan
    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { id: paymentPlanId },
    });

    if (!paymentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Payment plan not found',
      });
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Calculate total amount
    let totalAmount = paymentPlan.price + paymentPlan.listingFee + paymentPlan.processingFee;
    let discountAmount = 0;

    // Apply promo code if provided
    if (promoCodeId) {
      const promoCode = await prisma.promoCode.findUnique({
        where: { id: promoCodeId },
      });

      if (promoCode && promoCode.isActive) {
        if (promoCode.discountType === 'percentage') {
          discountAmount = (totalAmount * promoCode.discountValue) / 100;
        } else {
          discountAmount = promoCode.discountValue;
        }
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    // Get or create Stripe customer
    let customerId = null;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.email) {
      // Try to find existing Stripe customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId,
        listingId,
        paymentPlanId,
        promoCodeId: promoCodeId || '',
        listingTitle: listing.title,
      },
      description: `Payment for listing: ${listing.title}`,
    });

    // Create pending subscription record
    const subscription = await prisma.subscription.create({
      data: {
        listingId,
        userId,
        paymentPlanId,
        promoCodeId: promoCodeId || null,
        amountPaid: totalAmount,
        discountAmount,
        status: 'pending',
        transactionId: paymentIntent.id,
        paymentMethod: 'stripe',
      },
      include: {
        paymentPlan: true,
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        subscriptionId: subscription.id,
        amount: totalAmount,
      },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

// Create checkout session for subscriptions (monthly)
exports.createCheckoutSession = async (req, res) => {
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
      successUrl,
      cancelUrl,
    } = req.body;

    if (!listingId || !paymentPlanId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and payment plan ID are required',
      });
    }

    // Get payment plan
    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { id: paymentPlanId },
    });

    if (!paymentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Payment plan not found',
      });
    }

    if (paymentPlan.type !== 'monthly') {
      return res.status(400).json({
        success: false,
        message: 'Checkout session is only for monthly subscriptions',
      });
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Calculate total amount
    let totalAmount = paymentPlan.price + paymentPlan.listingFee + paymentPlan.processingFee;
    let discountAmount = 0;

    // Apply promo code if provided
    if (promoCodeId) {
      const promoCode = await prisma.promoCode.findUnique({
        where: { id: promoCodeId },
      });

      if (promoCode && promoCode.isActive) {
        if (promoCode.discountType === 'percentage') {
          discountAmount = (totalAmount * promoCode.discountValue) / 100;
        } else {
          discountAmount = promoCode.discountValue;
        }
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    // Get or create Stripe customer
    let customerId = null;
    if (user.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: paymentPlan.name,
              description: `Subscription for listing: ${listing.title}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        listingId,
        paymentPlanId,
        promoCodeId: promoCodeId || '',
      },
      // For mobile apps, use deep link scheme if URLs not provided
      success_url: successUrl || `${process.env.MOBILE_APP_SCHEME || 'supportapp'}://payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.MOBILE_APP_SCHEME || 'supportapp'}://payment/cancel`,
    });

    // Create pending subscription record
    const subscription = await prisma.subscription.create({
      data: {
        listingId,
        userId,
        paymentPlanId,
        promoCodeId: promoCodeId || null,
        amountPaid: totalAmount,
        discountAmount,
        status: 'pending',
        transactionId: session.id,
        paymentMethod: 'stripe',
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        subscriptionId: subscription.id,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message,
    });
  }
};

// Confirm payment (after client-side confirmation)
exports.confirmPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { paymentIntentId, subscriptionId } = req.body;

    if (!paymentIntentId || !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and subscription ID are required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update subscription status
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription || subscription.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found or access denied',
        });
      }

      // Get payment plan to calculate dates
      const paymentPlan = await prisma.paymentPlan.findUnique({
        where: { id: subscription.paymentPlanId },
      });

      const startsAt = new Date();
      let endsAt = null;

      if (paymentPlan && paymentPlan.type === 'monthly') {
        endsAt = new Date(startsAt);
        endsAt.setMonth(endsAt.getMonth() + 1);
      }

      // Update subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'paid',
          startsAt,
          endsAt,
          transactionId: paymentIntentId,
        },
        include: {
          paymentPlan: true,
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Update promo code usage if applicable
      if (subscription.promoCodeId) {
        await prisma.promoCode.update({
          where: { id: subscription.promoCodeId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      // Publish listing if payment successful
      await prisma.listing.update({
        where: { id: subscription.listingId },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: updatedSubscription,
        message: 'Payment confirmed successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
};

// Stripe webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function to handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
  const { userId, listingId, paymentPlanId, promoCodeId } = paymentIntent.metadata;

  // Find subscription by transaction ID
  const subscription = await prisma.subscription.findFirst({
    where: {
      transactionId: paymentIntent.id,
      status: 'pending',
    },
  });

  if (subscription) {
    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { id: paymentPlanId },
    });

    const startsAt = new Date();
    let endsAt = null;

    if (paymentPlan && paymentPlan.type === 'monthly') {
      endsAt = new Date(startsAt);
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'paid',
        startsAt,
        endsAt,
      },
    });

    // Update promo code usage
    if (promoCodeId) {
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // Publish listing
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }
}

// Helper function to handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  const { userId, listingId, paymentPlanId, promoCodeId } = session.metadata;

  const subscription = await prisma.subscription.findFirst({
    where: {
      transactionId: session.id,
      status: 'pending',
    },
  });

  if (subscription) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + 1);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'paid',
        startsAt,
        endsAt,
        transactionId: session.subscription || session.id,
      },
    });

    // Update promo code usage
    if (promoCodeId) {
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // Publish listing
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }
}

// Helper function to handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  // Update subscription status based on Stripe subscription status
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      transactionId: subscription.id,
    },
  });

  if (dbSubscription) {
    let status = 'paid';
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      status = 'failed';
    }

    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status,
        endsAt: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    });
  }
}

// Helper function to handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      transactionId: subscription.id,
    },
  });

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: 'failed',
      },
    });
  }
}

// Helper function to handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice) {
  // Handle recurring subscription payments
  if (invoice.subscription) {
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        transactionId: invoice.subscription,
      },
    });

    if (dbSubscription) {
      // Update subscription end date
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'paid',
          endsAt: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        },
      });
    }
  }
}

// Helper function to handle invoice payment failed
async function handleInvoicePaymentFailed(invoice) {
  if (invoice.subscription) {
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        transactionId: invoice.subscription,
      },
    });

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'failed',
        },
      });
    }
  }
}

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId, sessionId } = req.query;

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return res.json({
        success: true,
        data: {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        },
      });
    }

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return res.json({
        success: true,
        data: {
          status: session.payment_status,
          amount: session.amount_total ? session.amount_total / 100 : 0,
        },
      });
    }

    res.status(400).json({
      success: false,
      message: 'Payment intent ID or session ID is required',
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message,
    });
  }
};

