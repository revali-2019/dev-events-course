import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

// TypeScript interface for the Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC 5322 compliant email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Pre-save hook to verify that the referenced event exists
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's modified or document is new
  if (this.isModified('eventId') || this.isNew) {
    try {
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        return next(
          new Error(
            `Event with ID ${this.eventId} does not exist. Please provide a valid event ID.`
          )
        );
      }
    } catch (error) {
      return next(
        new Error('Failed to validate event reference. Please check the event ID.')
      );
    }
  }

  next();
});

// Create index on eventId for faster queries and lookups
BookingSchema.index({ eventId: 1 });

// Compound index for queries filtering by both event and email
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true , name: 'eventId_email_unique'});
BookingSchema.index({ eventId: 1, createdAt: -1 });
BookingSchema.index({ email:1 });

// Prevent model recompilation in development (Next.js hot reload)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
