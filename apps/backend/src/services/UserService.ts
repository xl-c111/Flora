import { prisma } from '../config/database';
import { User, Occasion, Color, Mood } from '@prisma/client';

// Interface for Auth0 user data (from JWT token)
export interface Auth0UserData {
  sub: string; // Auth0 user ID (e.g., "google-oauth2|102320438631690408711")
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

// Interface for updating user profile
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Interface for user preferences
export interface UserPreferences {
  favoriteOccasions?: Occasion[];
  favoriteColors?: Color[];
  favoriteMoods?: Mood[];
}

export class UserService {
  /**
   * Sync user from Auth0 - Create or update user profile
   * Called when user logs in to ensure database has latest Auth0 data
   */
  async syncUser(auth0Data: Auth0UserData): Promise<User> {
    console.log('👤 Syncing user from Auth0:', auth0Data.sub);

    // Parse name into firstName/lastName if available
    let firstName: string | null = null;
    let lastName: string | null = null;

    if (auth0Data.name) {
      const nameParts = auth0Data.name.split(' ');
      firstName = nameParts[0] || null;
      lastName = nameParts.slice(1).join(' ') || null;
    }

    // Upsert user (create if not exists, update if exists)
    const user = await prisma.user.upsert({
      where: { id: auth0Data.sub },
      update: {
        email: auth0Data.email,
        // Only update name if we have new data
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        updatedAt: new Date(),
      },
      create: {
        id: auth0Data.sub, // Use Auth0 ID as primary key
        email: auth0Data.email,
        firstName,
        lastName,
      },
    });

    console.log('✅ User synced:', user.id);
    return user;
  }

  /**
   * Get user by ID with all relationships
   */
  async getUser(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Update user profile (firstName, lastName, phone)
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    console.log('📝 Updating user profile:', userId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    console.log('✅ User profile updated');
    return user;
  }

  /**
   * Update user preferences (favorite occasions, colors, moods)
   */
  async updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<User> {
    console.log('🎨 Updating user preferences:', userId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...preferences,
        updatedAt: new Date(),
      },
    });

    console.log('✅ User preferences updated');
    return user;
  }

  /**
   * Get user statistics (order count, subscription count, etc.)
   */
  async getUserStats(userId: string): Promise<{
    orderCount: number;
    subscriptionCount: number;
    addressCount: number;
    totalSpentCents: number;
  }> {
    const [orderCount, subscriptionCount, addressCount, orders] =
      await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.subscription.count({ where: { userId } }),
        prisma.address.count({ where: { userId } }),
        prisma.order.findMany({
          where: { userId },
          select: { totalCents: true },
        }),
      ]);

    const totalSpentCents = orders.reduce(
      (sum, order) => sum + order.totalCents,
      0
    );

    return {
      orderCount,
      subscriptionCount,
      addressCount,
      totalSpentCents,
    };
  }

  /**
   * Delete user (soft delete - for GDPR compliance)
   * In production, this would archive user data instead of hard delete
   */
  async deleteUser(userId: string): Promise<void> {
    console.log('🗑️ Deleting user:', userId);

    // In production, you'd want to:
    // 1. Cancel all active subscriptions
    // 2. Archive orders
    // 3. Anonymize user data
    // For now, we'll just delete (be careful in production!)

    await prisma.user.delete({
      where: { id: userId },
    });

    console.log('✅ User deleted');
  }
}
