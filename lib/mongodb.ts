    import mongoose from 'mongoose';

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('پادشاه! لطفا MONGODB_URI رو در فایل .env.local ست کن.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cached = (global as any).mongoose;

    if (!cached) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cached = (global as any).mongoose = { conn: null, promise: null };
    }

    async function connectDB() {
      if (cached.conn) {
        return cached.conn;
      }

      if (!cached.promise) {
        const opts = {
          bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
          console.log("🔥 پادشاه! دیتابیس مثل ساعت کار می‌کنه و متصل شد.");
          return mongoose;
        });
      }
      
      try {
        cached.conn = await cached.promise;
      } catch (e) {
        cached.promise = null;
        console.error("Database connection error:", e); // Log the error for debugging
        throw e;
      }

      return cached.conn;
    }

    export default connectDB;
