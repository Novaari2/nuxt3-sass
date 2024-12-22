import { H3Event } from "h3";
import { serverSupabaseUser } from "#supabase/server";

export const protectRoute = async (event: H3Event) => {
    const user = await serverSupabaseUser(event);

    if(!user){
        throw createError({
            statusMessage: 'Unauthorized',
            statusCode: 401
        })
    }

    event.context.user = user
}