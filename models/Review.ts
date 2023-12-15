import mongoose, { Document, Schema } from "mongoose";

interface IReview extends Document {
  rating: number;
  title: string;
  comment: string;
  user: mongoose.Types.ObjectId; // Use mongoose.Types.ObjectId here
  product: mongoose.Types.ObjectId;
}

interface IReviewModel extends mongoose.Model<IReview> {
  calculatingAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculatingAverageRating = async function (
  productId: mongoose.Types.ObjectId
): Promise<void> {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await mongoose.model<IReview>("Review").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post<IReview>("save", async function () {
  await mongoose
    .model<IReview, IReviewModel>("Review")
    .calculatingAverageRating(this.product);
});
const Review = mongoose.model<IReview, IReviewModel>("Review", ReviewSchema);

export default Review;
