/**
 * Stripe Payment Controller
 * Handles Stripe payment processing, checkout sessions, and webhooks
 */

const stripe = require('../lib/stripe');
const { prisma } = require('../lib/prisma');
const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');

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

    // Create pending subscription record using MongoDB directly (bypasses replica set requirement)
    const subscriptionCollection = await getCollection('Subscription');
    const subscriptionData = {
      listing_id: new ObjectId(listingId),
      user_id: new ObjectId(userId),
      payment_plan_id: new ObjectId(paymentPlanId),
      promo_code_id: promoCodeId ? new ObjectId(promoCodeId) : null,
      amount_paid: totalAmount,
      discount_amount: discountAmount,
      status: 'pending',
      transaction_id: paymentIntent.id,
      payment_method: 'stripe',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const subscriptionResult = await subscriptionCollection.insertOne(subscriptionData);
    const subscription = await subscriptionCollection.findOne({ _id: subscriptionResult.insertedId });
    
    // Convert to string ID for response
    const subscriptionId = subscription._id.toString();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        subscriptionId: subscriptionId,
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

    // Create pending subscription record using MongoDB directly (bypasses replica set requirement)
    const subscriptionCollection = await getCollection('Subscription');
    const subscriptionData = {
      listing_id: new ObjectId(listingId),
      user_id: new ObjectId(userId),
      payment_plan_id: new ObjectId(paymentPlanId),
      promo_code_id: promoCodeId ? new ObjectId(promoCodeId) : null,
      amount_paid: totalAmount,
      discount_amount: discountAmount,
      status: 'pending',
      transaction_id: session.id,
      payment_method: 'stripe',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const subscriptionResult = await subscriptionCollection.insertOne(subscriptionData);
    const subscription = await subscriptionCollection.findOne({ _id: subscriptionResult.insertedId });
    const subscriptionId = subscription._id.toString();

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        subscriptionId: subscriptionId,
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
      // Update subscription status using MongoDB directly (bypasses replica set requirement)
      const subscriptionCollection = await getCollection('Subscription');
      const paymentPlanCollection = await getCollection('PaymentPlan');
      const listingCollection = await getCollection('Listing');
      const promoCodeCollection = await getCollection('PromoCode');

      // Find subscription by ID
      const subscription = await subscriptionCollection.findOne({
        _id: new ObjectId(subscriptionId),
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found',
        });
      }

      // Verify user owns this subscription
      const subscriptionUserId = subscription.user_id?.toString();
      if (subscriptionUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      // Get payment plan to calculate dates
      const paymentPlan = await paymentPlanCollection.findOne({
        _id: subscription.payment_plan_id,
      });

      const startsAt = new Date();
      let endsAt = null;

      if (paymentPlan && paymentPlan.type === 'monthly') {
        endsAt = new Date(startsAt);
        endsAt.setMonth(endsAt.getMonth() + 1);
      }

      // Update subscription
      await subscriptionCollection.updateOne(
        { _id: new ObjectId(subscriptionId) },
        {
          $set: {
            status: 'paid',
            starts_at: startsAt,
            ends_at: endsAt,
            transaction_id: paymentIntentId,
            updated_at: new Date(),
          },
        }
      );

      // Get updated subscription with related data
      const updatedSubscription = await subscriptionCollection.findOne({
        _id: new ObjectId(subscriptionId),
      });

      // Get payment plan and listing for response
      const updatedPaymentPlan = await paymentPlanCollection.findOne({
        _id: subscription.payment_plan_id,
      });
      const listing = await listingCollection.findOne({
        _id: subscription.listing_id,
      }, {
        projection: { _id: 1, title: 1 },
      });

      // Update promo code usage if applicable
      if (subscription.promo_code_id) {
        await promoCodeCollection.updateOne(
          { _id: subscription.promo_code_id },
          { $inc: { used_count: 1 } }
        );
      }

      // Publish listing if payment successful
      await listingCollection.updateOne(
        { _id: subscription.listing_id },
        {
          $set: {
            status: 'Pending', // Set to Pending - admin approval required to make it Active
            published_at: new Date(),
            updated_at: new Date(),
          },
        }
      );

      // Format response to match expected structure
      const responseData = {
        id: updatedSubscription._id.toString(),
        listingId: updatedSubscription.listing_id.toString(),
        userId: updatedSubscription.user_id.toString(),
        paymentPlanId: updatedSubscription.payment_plan_id.toString(),
        promoCodeId: updatedSubscription.promo_code_id?.toString() || null,
        amountPaid: updatedSubscription.amount_paid,
        discountAmount: updatedSubscription.discount_amount,
        status: updatedSubscription.status,
        transactionId: updatedSubscription.transaction_id,
        paymentMethod: updatedSubscription.payment_method,
        startsAt: updatedSubscription.starts_at,
        endsAt: updatedSubscription.ends_at,
        paymentPlan: updatedPaymentPlan ? {
          id: updatedPaymentPlan._id.toString(),
          name: updatedPaymentPlan.name,
          type: updatedPaymentPlan.type,
          price: updatedPaymentPlan.price,
        } : null,
        listing: listing ? {
          id: listing._id.toString(),
          title: listing.title,
        } : null,
      };

      res.json({
        success: true,
        data: responseData,
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

    // Update listing status to Pending (admin approval required)
    const { getCollection } = require('../lib/mongodb');
    const { ObjectId } = require('mongodb');
    const listingCollection = await getCollection('Listing');
    
    await listingCollection.updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: {
          status: 'Pending', // Set to Pending - admin approval required to make it Active
          published_at: new Date(),
          updated_at: new Date(),
        },
      }
    );
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

    // Update listing status to Pending (admin approval required)
    const { getCollection } = require('../lib/mongodb');
    const { ObjectId } = require('mongodb');
    const listingCollection = await getCollection('Listing');
    
    await listingCollection.updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: {
          status: 'Pending', // Set to Pending - admin approval required to make it Active
          published_at: new Date(),
          updated_at: new Date(),
        },
      }
    );
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

// Check if user has a valid active subscription
exports.checkSubscriptionValidity = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const subscriptionCollection = await getCollection('Subscription');
    const paymentPlanCollection = await getCollection('PaymentPlan');
    const now = new Date();

    // Find active subscriptions for this user
    // A subscription is valid if:
    // 1. status is 'paid'
    // 2. payment_plan type is 'monthly'
    // 3. ends_at is in the future (or null for lifetime subscriptions)
    const subscriptions = await subscriptionCollection.find({
      user_id: new ObjectId(userId),
      status: 'paid',
    }).toArray();

    // Check each subscription for validity
    let validSubscription = null;
    for (const sub of subscriptions) {
      const paymentPlan = await paymentPlanCollection.findOne({
        _id: sub.payment_plan_id,
      });

      // Only monthly subscriptions need validity check
      if (paymentPlan && paymentPlan.type === 'monthly') {
        // Check if subscription hasn't expired
        if (!sub.ends_at || new Date(sub.ends_at) > now) {
          validSubscription = {
            id: sub._id.toString(),
            status: sub.status,
            startsAt: sub.starts_at,
            endsAt: sub.ends_at,
            paymentPlan: {
              id: paymentPlan._id.toString(),
              name: paymentPlan.name,
              type: paymentPlan.type,
            },
          };
          break; // Found a valid subscription, no need to check others
        }
      }
    }

    if (validSubscription) {
      return res.json({
        success: true,
        data: {
          hasValidSubscription: true,
          subscription: validSubscription,
        },
      });
    }

    // No valid subscription found
    return res.json({
      success: true,
      data: {
        hasValidSubscription: false,
        subscription: null,
      },
    });
  } catch (error) {
    console.error('Error checking subscription validity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription validity',
      error: error.message,
    });
  }
};

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

