import mongoose from 'mongoose';

const studyTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  estimatedMinutes: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false }
});

const studyDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  topics: [studyTopicSchema]
});

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  title: { type: String, required: true },
  examDate: { type: Date, required: true },
  dailyHours: { type: Number, required: true },
  scheduleDays: [studyDaySchema],
  createdAt: { type: Date, default: Date.now }
});

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;
