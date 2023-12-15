import mongoose, { Document, Model, Schema } from "mongoose";

interface IReview extends Document {
  rating: number;
  title: string;
  comment: string;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
}

interface IReviewModel extends Model<IReview> {
  calculatingAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
  {
    // ... (rest of your schema)
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

async function calculateAndSaveAverageRating(
  this: Model<IReview>,
  productId: mongoose.Types.ObjectId
): Promise<void> {
  const result: any[] = await this.aggregate([
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
    const aggregateResult = result[0];
    if (aggregateResult) {
      await this.findOneAndUpdate(
        { _id: productId },
        {
          averageRating: Math.ceil(aggregateResult.averageRating || 0),
          numOfReviews: aggregateResult.numOfReviews || 0,
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
}

ReviewSchema.statics.calculatingAverageRating = calculateAndSaveAverageRating;

ReviewSchema.post<IReview>("save", async function () {
  await calculateAndSaveAverageRating.call(
    this.constructor as Model<IReview>,
    this.product
  );
});

const Review = mongoose.model<IReview, IReviewModel>("Review", ReviewSchema);

export default Review;
