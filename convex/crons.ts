import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const checkReminders = internalAction({
  args: {},
  handler: async () => {
    console.log("Checking assessment reminders...", new Date().toISOString());
  },
});

const crons = cronJobs();

crons.interval("check assessment reminders", { hours: 24 }, internal.crons.checkReminders, {});

export default crons;
