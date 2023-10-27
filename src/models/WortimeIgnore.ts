import { model, Schema } from "mongoose";

const worktimeIgnoreReminderSchema = new Schema({
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
});

const WorktimeIgnoreReminder = model(
  "WorktimeIgnoreReminder",
  worktimeIgnoreReminderSchema,
);

export default WorktimeIgnoreReminder;
