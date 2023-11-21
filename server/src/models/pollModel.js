import mongoose from "mongoose";

const PollSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    expiryTime: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    choice: {
      type: [String],
      required: true,
    },
    vote: {
      type: [Number],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("polls", PollSchema);
