import mongoose, { Schema, Document } from "mongoose";

export interface ITimelineEntry {
  id: string;
  timestamp: string;
  status: string;
  title: string;
  description: string;
}

export interface ILead extends Document {
  firstName: string;
  lastName?: string;
  contactNo: string;
  email?: string;
  enquiryDate: string;
  course: string;
  status: "Interested" | "Not Interested" | "Demo Scheduled" | "Enrolled" | "Contacted";
  followUp: string;
  remark: string;
  occupation?: string;
  leadSource?: string;
  address?: string;
  offeredFees?: string;
  finalFees?: string;
  referral?: "Yes" | "No";
  enquiringFor?: "Self" | "Other";
  timeline: ITimelineEntry[];
}

const TimelineSchema = new Schema<ITimelineEntry>({
  id: { type: String, required: true },
  timestamp: { type: String, required: true },
  status: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const LeadSchema = new Schema<ILead>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    contactNo: { type: String, required: true },
    email: { type: String, default: "" },
    enquiryDate: { type: String, required: true },
    course: { type: String, required: true },
    status: {
      type: String,
      enum: ["Interested", "Not Interested", "Demo Scheduled", "Enrolled", "Contacted"],
      default: "Interested",
    },
    followUp: { type: String, default: "Pending" },
    remark: { type: String, default: "Newly Added" },
    occupation: { type: String, default: "" },
    leadSource: { type: String, default: "" },
    address: { type: String, default: "" },
    offeredFees: { type: String, default: "" },
    finalFees: { type: String, default: "" },
    referral: { type: String, enum: ["Yes", "No"], default: "No" },
    enquiringFor: { type: String, enum: ["Self", "Other"], default: "Self" },
    timeline: { type: [TimelineSchema], default: [] },
  },
  { timestamps: true }
);

// Map MongoDB _id to `id` for frontend compatibility
LeadSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret: Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);