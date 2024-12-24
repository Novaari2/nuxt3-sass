import { incrementApiLimit, checkApiLimit, protectRoute } from '~/server/utils'
import { User } from '~/server/types'
import Replicate from "replicate";

const config = useRuntimeConfig();

const replicate = new Replicate({
    auth: config.replicateKey
});

export default defineEventHandler(async (event) => {
    // verify and Get user
    await protectRoute(event);
    const user = event.context.user as User

    const {prompt} = await readBody(event)

    if(!replicate.auth){
        throw createError({
            statusCode: 400,
            statusMessage: "Replicate is not configured"
        })
    }

    if(!prompt){
        throw createError({
            statusCode: 400,
            statusMessage: "Prompt are required"
        })
    }

    const freeTrial = await checkApiLimit(user.id);
    if(!freeTrial){
        throw createError({
            statusCode: 403,
            statusMessage: "Free trial has expired. Please upgrade to pro."
        })
    }

    const model = "anotherjesse/dreambooth-batch:0de6c0b01bd739f96052a4564ca1c8a53ed5246de86c0ef86ca8abe28f9aacad";

    const response = await replicate.run(
        model, 
        { input: { 
            prompt: prompt 
        } 
    });

    await incrementApiLimit(user.id);
    return response
})