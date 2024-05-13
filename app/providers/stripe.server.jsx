import Stripe from "stripe";

export function getDomainUrl(request) {
  const host =
    request.headers.get("X-Forward-Host") ?? request.headers.get("host");

  if (!host) {
    throw new Error("Could not find the url");
  }

  const protocol = host.includes("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

export const getStripeSession = async (items, domainUrl, user_id) => {
  try {
    console.log("secret; 🙏🙏🙏", process.env.STRIPE_SECRET_KEY)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const lineItems = items.map((product) => {
      return {
        price: product.id,
        quantity: product.quantity,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
      };
    });

    // console.log(items);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      shipping_address_collection: { allowed_countries: ["AU"] },
      phone_number_collection: { enabled: true },
      customer_creation: "always",
      metadata: { user_id },
      payment_intent_data: {
        metadata: { user_id },
      },
      line_items: lineItems,
      shipping_options: [
        { shipping_rate: "shr_1P7bpmP810b2U08hpbdB7XjP" },
        { shipping_rate: "shr_1P7bqcP810b2U08hjjzQuC07" },
      ],
      success_url: `${domainUrl}/payment/success`,
      cancel_url: `${domainUrl}/`,
    });

    return session.url;
  } catch (error) {
    console.log(error);
    return "/300";
  }
};
