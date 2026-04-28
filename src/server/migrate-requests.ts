import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { ClearanceRequest } from './models/ClearanceRequest.js';

dotenv.config();

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected.');

    const requests = await ClearanceRequest.find({
      $or: [
        { nationality: { $exists: false } },
        { gender: { $exists: false } },
        { phoneNumber: { $exists: false } },
        { address: { $exists: false } },
        { startYear: { $exists: false } },
        { endYear: { $exists: false } }
      ]
    });

    console.log(`Found ${requests.length} requests needing update.`);

    for (const req of requests) {
      const student = await User.findById(req.studentId);
      if (student) {
        req.studentName = student.name;
        req.registrationNumber = student.registrationNumber;
        req.nationality = student.nationality;
        req.gender = student.gender;
        req.phoneNumber = student.phoneNumber;
        req.address = student.address;
        req.startYear = student.startYear;
        req.endYear = student.endYear;
        await req.save();
        console.log(`Updated request for ${student.name}`);
      } else {
        console.warn(`Student not found for request ${req._id}`);
      }
    }

    console.log('Migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
