import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model" ;
import { v2 as cloudinary} from 'cloudinary';

export async function POST (req: NextRequest)  {
    try {
        await connectDB();
        const formData = await req.formData();
        let event ;
        try {
            event = Object.fromEntries(formData.entries());
        }catch (e) {
            return NextResponse.json({message: 'Invalid JSOn Data Format'}, {status: 400})
        }

        const file = formData.get('image') as File;
        if (!file) {
            return NextResponse.json({message: 'Image File is required'}, {status : 400});
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'DevEvent'}, (error, results) => {
                if (error) return reject(error);

                resolve(results);
            }).end(buffer);
        })
        event.image = (uploadResult as {secure_url: string}).secure_url;

        const createdEvent = await Event.create(event);
        return NextResponse.json({message: 'Successfully Created Event', event: createdEvent}, {status:201});
    }catch (e) {
        console.error(e);
        return NextResponse.json({message:"Event Creation Failed", error: e instanceof Error ? e.message : 'Unknown'}, {status: 500})
    }
}


export async function GET() {
    try {
        await connectDB();
        const events = await Event.find().sort({createdAt: -1});
        return NextResponse.json({ message: 'Successfully fetched event' , events : events}, {status : 200});
    }catch (error) {
        console.error('Event fetch error:', error);
        return NextResponse.json({message: 'Event Fetch Failed' } ,{status: 500});
    }
}