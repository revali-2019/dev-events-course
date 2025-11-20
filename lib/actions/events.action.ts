'use server';

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import type { IEventPlain } from "@/database";

export const getSimilarEventsBySlug = async (slug : string): Promise<IEventPlain[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({slug});
        if (!event) return [];

        return (await Event.find({ _id: { $ne: event._id},  tags: { $in: event.tags}}).lean()) as unknown as IEventPlain[];

    }catch {
        return [];
    }
}