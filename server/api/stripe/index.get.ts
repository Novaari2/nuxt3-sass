import { User } from "~/server/types";
import { PrismaClient } from "@prisma/client";
import { absoluteUrl } from "~/server/utils";


const prisma = new PrismaClient();
const returnUrl = absoluteUrl('/settings');

export default defineEventHandler(async (event) => {
    await protectRoute(event)
    const user = event.context.user as User

    const userSubscription = await prisma.userSubscription.findUnique({
        where: {
            userId: user.id
        }
    })

    // cancel or upgrade subscription
    if(userSubscription && userSubscription.stripeCustomerId){
        const stripeSession = await stripe.billingPortal.sesssions.create({
            customer: userSubscription.stripeCustomerId,
            returnUrl: returnUrl
        })

        return {
            url: stripeSession.url
        }
    }

    //New Subscription

    const stripeSession = await stripe.checkout.sessions.create({
        success_url: returnUrl,
        cancel_url: returnUrl,
        payment_method_types: ['card'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        customer_email: user.email,
        line_items: [
            {
                price_data: {
                    currency: 'USD',
                    product_data: {
                        name: 'Genius Pro',
                        description: 'Unlimited AI Generations'
                    },
                    unit_amount: 2000,
                    recurring: {
                        interval: 'month'
                    }
                },
                quantity: 1
            }
        ],
        metadata: {
            userId: user.id
        }
    })

    return {
        url: stripeSession
    }
})