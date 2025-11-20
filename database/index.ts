// Central export point for all database models
export { default as Booking } from './booking.model';
export { default as Event } from './event.model';

// Re-export TypeScript interfaces for type safety
export type { IBooking } from './booking.model';
export type { IEvent, IEventPlain } from './event.model';
