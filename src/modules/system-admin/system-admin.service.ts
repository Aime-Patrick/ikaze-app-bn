import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Place } from 'src/schemas/places.schema';
import { Payment } from 'src/schemas/payment.schema';
import { Review } from 'src/schemas/review.schema';
import { Activity } from 'src/schemas/activity.schema';
@Injectable()
export class SystemAdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Place.name) private placeModel: Model<Place>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async getStatistics() {
    // Dates for this month and last month
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total users and places
    const totalUsers = await this.userModel.countDocuments();
    const totalPlaces = await this.placeModel.countDocuments();

    // New users and places this month
    const usersThisMonth = await this.userModel.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const placesThisMonth = await this.placeModel.countDocuments({ createdAt: { $gte: startOfThisMonth } });

    // New users and places last month
    const usersLastMonth = await this.userModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });
    const placesLastMonth = await this.placeModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });


    // Revenue (replace with real calculation if you have a Payment schema)
    const revenueAgg = await this.paymentModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    // Revenue growth (replace with real calculation if you have a Payment schema)
    const revenueThisMonthAgg = await this.paymentModel.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueLastMonthAgg = await this.paymentModel.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;
    const revenueGrowth = revenueLastMonth ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

    // Growth rate (users)
    const growthRate = usersLastMonth
      ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : usersThisMonth > 0 ? 100 : 0;

    // Trends
    const trends = {
      users: usersThisMonth,
      places: placesThisMonth,
      revenue: revenueGrowth,
      growth: growthRate,
    };

    return {
      totalUsers,
      totalPlaces,
      revenue,
      growthRate,
      trends,
    };
  }

  async getRecentActivities(limit = 10) {
    return this.activityModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getReports() {
    // 1. User Growth Data (users per month for the last 6 months)
    const now = new Date();
    const userGrowthData: { month: string; users: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await this.userModel.countDocuments({
        createdAt: { $gte: month, $lt: nextMonth }
      });
      userGrowthData.push({
        month: month.toLocaleString('default', { month: 'short' }),
        users: count,
      });
    }

    // 2. Most Visited Places (top 4 by visits)
    const mostVisitedPlaces = await this.placeModel.find()
      .sort({ visits: -1 })
      .limit(4)
      .select({ name: 1, visits: 1, _id: 0 })
      .lean();

    // 3. Revenue Data (sum per month for last 6 months)
    const revenueData: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const agg = await this.paymentModel.aggregate([
        { $match: { createdAt: { $gte: month, $lt: nextMonth } } },
        { $group: { _id: null, revenue: { $sum: "$amount" } } }
      ]);
      revenueData.push({
        month: month.toLocaleString('default', { month: 'short' }),
        revenue: agg[0]?.revenue || 0,
      });
    }

    // 4. Engagement Data (example: bookings, reviews, maps, favorites)
    // You may need to adjust this based on your actual schema
    const bookings = await this.placeModel.aggregate([
      { $group: { _id: null, usage: { $sum: "$bookings" } } }
    ]);
    const reviews = await this.reviewModel.countDocuments();
    // If you have maps/favorites usage, aggregate similarly
    const engagementData = [
      { feature: "Bookings", usage: bookings[0]?.usage || 0 },
      { feature: "Reviews", usage: reviews },
      // Add more features as needed
    ];

    // 5. Recent Reviews (last 3)
    const recentReviews = await this.reviewModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select({ place: 1, user: 1, rating: 1, comment: 1, _id: 0 })
      .lean();

    return {
      userGrowthData,
      mostVisitedPlaces,
      revenueData,
      engagementData,
      reviews: recentReviews,
    };
  }
}
