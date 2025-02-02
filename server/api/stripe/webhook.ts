import { PrismaClient } from '@prisma/client';
import { SubscriptIcon } from 'lucide-vue-next';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const STRIPE_WEBHOOK_SECRET = useRuntimeConfig().stripeWebhookSecret;

export default defineEventHandler(async (event) => {
    const signature = getHeader(event, 'Stripe-Signature') as string;
    const body = await readRawBody(event)

    let stripeEvent
    try {
        stripeEvent = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.log(error);
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid signature',
        });
    }

    const session = stripeEvent.data.object as Stripe.Checkout.Session

    if(stripeEvent.type === "checkout.session.completed") {
        const subscriptio  = await stripe.subscriptions.retrieve(session.subscription as string);

        if(!session?.metadata?.userId){
            throw createError({
                statusCode: 400,
                statusMessage: 'User id is required',
            });
        }

        await prisma.userSubscription.create({
            data: {
                userId: session?.metadata?.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        })
    }

    // if they upgrade or cancelled
    if(stripeEvent.type === "invoice.payment_succeeded"){
        const subscription = await stripe.subscription.retrieve(session.subscription as string);
        await prisma.userSubscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
            },
        })
    }

    return 200;
})