const Express = require("express");
import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({path:'../.env'})

const stripe = new Stripe(process.env.STRIPE_KEY as string, {
  apiVersion: "2024-06-20",
});

const router = Express.Router();

router.post("/create-checkout-session", async (req: any, res: any) => {
  const { cartItems, userId } = req.body;

  // Simplify metadata to only include item IDs and quantities
  const metadata = cartItems.map((item: any) => ({
    id: item.id,
    quantity: item.cartTotalQuantity,
  }));

  try {
    // Create a new customer in Stripe with simplified metadata
    const customer = await stripe.customers.create({
      metadata: {
        userId: userId,
        cart: JSON.stringify(metadata),
      },
    });

    // Map cart items to line items for the checkout session
    const line_items = cartItems.map((item: any) => {
      const productData: any = {
        name: item.name,
      };

      if (item.image && item.image.trim() !== "") {
        productData.images = [item.image];
      }

      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: item.price * 100,
        },
        quantity: item.cartTotalQuantity,
      };
    });

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1500,
              currency: "usd",
            },
            display_name: "Next day air",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      customer: customer.id,
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    // Return the session URL to the client
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session", error);
    res.status(500).send("Internal Server Error");
  }
});

// Stripe webhook endpoint
const endpointSecret =
  process.env.STRIPE_WEBHOOK_SECRET ??
  "whsec_e0395be0265aa3bfe1b3143ebc8a0589d952ceab1aed919f96df9f1b34ff69be";

router.post(
  "/webhook",
  Express.raw({ type: "application/json" }),
  async (req: any, res: any) => {
    let data: any;
    let eventType: string;

    try {
      const sig = req.headers["stripe-signature"] as string;

      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      console.log("Webhook Verified");
      data = event.data.object;
      eventType = event.type;

      // Handle specific webhook events
      if (eventType === "checkout.session.completed") {
        // Retrieve customer details
        const customer = await stripe.customers.retrieve(data.customer);
        console.log("Customer:", customer);
        // Process order creation
        await createOrder(customer, data);
      }
    } catch (err: any) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Respond to the webhook
    res.status(200).end();
  }
);

// Create order function
const createOrder = async (customer: any, data: any) => {
  const cart = JSON.parse(customer.metadata?.cart);

  const products = cart.map((item: any) => ({
    productId: item.id,
    quantity: item.quantity,
  }));

  // Create order logic here
  console.log("Creating order for customer:", customer.id);
};

export default router;
