import mongoose from "mongoose";

export async function connectToDatabase() {
  // Ensure dotenv is loaded in case env vars weren't populated earlier
  try {
    const dotenv = await import('dotenv');
    const path = await import('path');
    const envPath = path.resolve(process.cwd(), '.env');
    // Debug: check if .env exists
    try {
      const fs = await import('fs');
      const exists = fs.existsSync(envPath);
      console.log('.env path:', envPath, 'exists:', exists);
    } catch (e) {
      // ignore
    }
    dotenv.config({ path: envPath, override: true });
  } catch (e) {
    // ignore if import fails; process.env may already be set
  }

  const mongoUri = process.env.MONGODB_URI as string | undefined;
  // If dotenv didn't populate it, attempt a simple manual parse of .env
  let finalMongoUri = mongoUri;
  if (!finalMongoUri) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const envPath = path.resolve(process.cwd(), '.env');
      let content = fs.readFileSync(envPath, { encoding: 'utf-8' });
      // If the file seems to have non-UTF8 bytes (e.g., BOM for UTF-16), try reading as utf16le
      if (!content.includes('MONGODB_URI')) {
        try {
          content = fs.readFileSync(envPath, { encoding: 'utf16le' });
        } catch (e) {
          // ignore
        }
      }
      console.log('.env content:\n', content);
      for (const line of content.split(/\r?\n/)) {
        let trimmed = line.trim();
        if (!trimmed) continue;
        // remove UTF-8 BOM or stray nulls/bytes at line start
        trimmed = trimmed.replace(/^([\uFEFF\u0000\x00])+/, '');
        if (trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
      finalMongoUri = process.env.MONGODB_URI as string | undefined;
      console.log('After manual .env parse, MONGODB_URI present:', !!finalMongoUri);
    } catch (e) {
      // ignore
    }
  }

  if (!finalMongoUri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  try {
    const maskedUri = finalMongoUri?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('Connecting to MongoDB with URI:', maskedUri);
    
    // Set connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(finalMongoUri as string, options);
    console.log("Connected to MongoDB database:", mongoose.connection.name);
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n🛡️  MONGODB ATLAS IP WHITELIST ISSUE:');
      console.error('Your current IP address is likely not whitelisted in MongoDB Atlas.');
      console.error('1. Log in to https://cloud.mongodb.com/');
      console.error('2. Go to Security > Network Access');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Add Current IP Address" or "Allow Access From Anywhere (0.0.0.0/0)"');
      console.error('5. Click "Confirm" and wait 1-2 minutes for the changes to apply.\n');
    }
    
    throw error;
  }
}

export { mongoose };

