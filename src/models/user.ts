import mongoose, { Document, Model } from "mongoose";

interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema:any = new mongoose.Schema<UserDocument>({
  name: { type: String, required: true, minLength: 3, maxLength: 30 },
  email: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 200,
    unique: true,
  },
  password: { type: String, required: true, minLength: 6, maxLength: 200 },
});

const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
);

export default User;
