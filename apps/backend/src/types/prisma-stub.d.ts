declare module '@prisma/client' {
  export enum PurchaseType {
    ONE_TIME = 'ONE_TIME',
    SUBSCRIPTION = 'SUBSCRIPTION',
  }

  export enum SubscriptionType {
    RECURRING_WEEKLY = 'RECURRING_WEEKLY',
    RECURRING_BIWEEKLY = 'RECURRING_BIWEEKLY',
    RECURRING_MONTHLY = 'RECURRING_MONTHLY',
    RECURRING_QUARTERLY = 'RECURRING_QUARTERLY',
    RECURRING_YEARLY = 'RECURRING_YEARLY',
    SPONTANEOUS = 'SPONTANEOUS',
    SPONTANEOUS_WEEKLY = 'SPONTANEOUS_WEEKLY',
    SPONTANEOUS_BIWEEKLY = 'SPONTANEOUS_BIWEEKLY',
    SPONTANEOUS_MONTHLY = 'SPONTANEOUS_MONTHLY',
  }

  export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
  }

  export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
  }

  export enum DeliveryType {
    STANDARD = 'STANDARD',
    EXPRESS = 'EXPRESS',
    SAME_DAY = 'SAME_DAY',
    PICKUP = 'PICKUP',
  }

  export enum Occasion {
    BIRTHDAY = 'BIRTHDAY',
    ANNIVERSARY = 'ANNIVERSARY',
    WEDDING = 'WEDDING',
    GRADUATION = 'GRADUATION',
    VALENTINES_DAY = 'VALENTINES_DAY',
    MOTHERS_DAY = 'MOTHERS_DAY',
    FATHERS_DAY = 'FATHERS_DAY',
    CHRISTMAS = 'CHRISTMAS',
    EASTER = 'EASTER',
    SYMPATHY = 'SYMPATHY',
    CONGRATULATIONS = 'CONGRATULATIONS',
    GET_WELL_SOON = 'GET_WELL_SOON',
    JUST_BECAUSE = 'JUST_BECAUSE',
    HOUSEWARMING = 'HOUSEWARMING',
    THANK_YOU = 'THANK_YOU',
  }

  export enum Season {
    SPRING = 'SPRING',
    SUMMER = 'SUMMER',
    FALL = 'FALL',
    WINTER = 'WINTER',
    ALL_SEASON = 'ALL_SEASON',
  }

  export enum Mood {
    ROMANTIC = 'ROMANTIC',
    CHEERFUL = 'CHEERFUL',
    ELEGANT = 'ELEGANT',
    PEACEFUL = 'PEACEFUL',
    VIBRANT = 'VIBRANT',
    SOPHISTICATED = 'SOPHISTICATED',
    WHIMSICAL = 'WHIMSICAL',
    CLASSIC = 'CLASSIC',
    MODERN = 'MODERN',
    RUSTIC = 'RUSTIC',
  }

  export enum Color {
    RED = 'RED',
    PINK = 'PINK',
    WHITE = 'WHITE',
    YELLOW = 'YELLOW',
    ORANGE = 'ORANGE',
    PURPLE = 'PURPLE',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    MIXED = 'MIXED',
    PASTEL = 'PASTEL',
    BURGUNDY = 'BURGUNDY',
    LAVENDER = 'LAVENDER',
  }

  export enum ProductType {
    BOUQUET = 'BOUQUET',
    ARRANGEMENT = 'ARRANGEMENT',
    PLANT = 'PLANT',
    SUCCULENT = 'SUCCULENT',
    ORCHID = 'ORCHID',
    ROSE = 'ROSE',
    LILY = 'LILY',
    TULIP = 'TULIP',
    SUNFLOWER = 'SUNFLOWER',
    MIXED_FLOWERS = 'MIXED_FLOWERS',
    DRIED_FLOWERS = 'DRIED_FLOWERS',
    ARTIFICIAL = 'ARTIFICIAL',
  }

  export enum PriceRange {
    UNDER_25 = 'UNDER_25',
    RANGE_25_50 = 'RANGE_25_50',
    RANGE_50_75 = 'RANGE_50_75',
    RANGE_75_100 = 'RANGE_75_100',
    OVER_100 = 'OVER_100',
  }

  export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
  }

  export type Product = any;
  export type Subscription = any;
  export type Order = any;
  export type User = any;
  export type Address = any;
  export type OrderItem = any;
  export type DeliveryTracking = any;

  export class PrismaClient {
    [key: string]: any;

    constructor(options?: any);

    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  }
}
