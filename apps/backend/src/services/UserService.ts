import { prisma } from '../config/database';
import { User, Address } from '@prisma/client';

export class UserService {
  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    });
  }

  // Create or update user from Supabase auth
  async upsertUser(userData: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> {
    return await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
      create: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
    });
  }

  // Update user profile
  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // Create user address
  async createAddress(
    userId: string,
    addressData: {
      label?: string;
      firstName: string;
      lastName: string;
      company?: string;
      street1: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
      phone?: string;
      isDefault?: boolean;
    }
  ): Promise<Address> {
    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return await prisma.address.create({
      data: {
        userId,
        ...addressData,
      },
    });
  }

  // Get user addresses
  async getUserAddresses(userId: string): Promise<Address[]> {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // Update address
  async updateAddress(
    addressId: string,
    userId: string,
    updateData: Partial<Address>
  ): Promise<Address> {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });
  }

  // Delete address
  async deleteAddress(addressId: string, userId: string): Promise<void> {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });
  }

  // Get user preferences for recommendations
  async getUserPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        favoriteOccasions: true,
        favoriteColors: true,
        favoriteMoods: true,
      },
    });

    return user;
  }

  // Update user preferences
  async updateUserPreferences(
    userId: string,
    preferences: {
      favoriteOccasions?: string[];
      favoriteColors?: string[];
      favoriteMoods?: string[];
    }
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data: preferences,
    });
  }
}
