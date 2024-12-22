import { protectRoute } from "~/server/utils";
import Replicate from "replicate";

const config = useRuntimeConfig();

const replicate = new Replicate({
    auth: config.replicateKey
});

export default defineEventHandler(async (event) => {
    // verify and Get user
    await protectRoute(event);

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

    const model = "anotherjesse/dreambooth-batch:0de6c0b01bd739f96052a4564ca1c8a53ed5246de86c0ef86ca8abe28f9aacad";

    const response = await replicate.run(
        model, 
        { input: { 
            prompt: prompt 
        } 
    });

    return response
})