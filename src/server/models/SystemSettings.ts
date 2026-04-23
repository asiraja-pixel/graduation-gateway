import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String }
});

export const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);
