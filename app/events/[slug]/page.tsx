import {notFound} from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const EventDetailItem = ({icon, alt, label}:{ icon:string, alt:string, label:string}) => {
    return (
        <div className="flex-row-gap-2 items-center">
            <Image src={icon} alt={alt} width={17} height={17} />
            <p>{label}</p>
        </div>
    );
}

const EventAgenda = ({agendaItems} :{agendaItems:string[]}) => {
    return (
        <div className="agenda" >
            <h2>Agenda</h2>
            <ul>
                {agendaItems.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

const EventTags = ({tags} : {tags: string[]}) => {
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    );
}

const EventDetailsPage = async ( {params}: {params: Promise<{slug:string}>}) => {

    const {slug} = await params ;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const {event : e} = await request.json();

    if (!e) return notFound();
    const bookings = 10;

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{e.description}</p>
            </div>

            <div className="details">
                <div className="content">
                    <Image src={e.image} alt={e.title} width={800} height={800} className="banner"/>
                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{e.overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={e.date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="time" label={e.time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="location" label={e.location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={e.mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={e.audience} />
                    </section>

                    <EventAgenda agendaItems={JSON.parse(e.agenda[0])} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{e.organizer}</p>
                    </section>
                    <EventTags tags={JSON.parse(e.tags[0])} />

                </div>


                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot !
                            </p>
                        ): (
                            <p className="text-sm">
                                Be the first to book your spot !
                            </p>
                        )}
                        <BookEvent />

                    </div>
                </aside>

            </div>
        </section>
    );
}
export default EventDetailsPage
