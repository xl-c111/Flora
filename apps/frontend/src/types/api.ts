export enum Occasion {
  BIRTHDAY = "BIRTHDAY",
  ANNIVERSARY = "ANNIVERSARY",
  WEDDING = "WEDDING",
  GRADUATION = "GRADUATION",
  VALENTINES_DAY = "VALENTINES_DAY",
  MOTHERS_DAY = "MOTHERS_DAY",
  FATHERS_DAY = "FATHERS_DAY",
  CHRISTMAS = "CHRISTMAS",
  EASTER = "EASTER",
  SYMPATHY = "SYMPATHY",
  CONGRATULATIONS = "CONGRATULATIONS",
  GET_WELL_SOON = "GET_WELL_SOON",
  JUST_BECAUSE = "JUST_BECAUSE"
}

export enum Season {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
  ALL_SEASON = "ALL_SEASON"
}

export enum Mood {
  ROMANTIC = "ROMANTIC",
  CHEERFUL = "CHEERFUL",
  ELEGANT = "ELEGANT",
  PEACEFUL = "PEACEFUL",
  VIBRANT = "VIBRANT",
  SOPHISTICATED = "SOPHISTICATED",
  WHIMSICAL = "WHIMSICAL",
  CLASSIC = "CLASSIC"
}

export enum Color {
  RED = "RED",
  PINK = "PINK",
  WHITE = "WHITE",
  YELLOW = "YELLOW",
  ORANGE = "ORANGE",
  PURPLE = "PURPLE",
  BLUE = "BLUE",
  GREEN = "GREEN",
  MIXED = "MIXED",
  PASTEL = "PASTEL"
}

export enum ProductType {
  BOUQUET = "BOUQUET",
  ARRANGEMENT = "ARRANGEMENT",
  PLANT = "PLANT",
  SUCCULENT = "SUCCULENT",
  ORCHID = "ORCHID",
  ROSE = "ROSE",
  LILY = "LILY",
  TULIP = "TULIP",
  SUNFLOWER = "SUNFLOWER",
  MIXED_FLOWERS = "MIXED_FLOWERS"
}

export enum PriceRange {
  UNDER_25 = "UNDER_25",
  RANGE_25_50 = "RANGE_25_50",
  RANGE_50_75 = "RANGE_50_75",
  RANGE_75_100 = "RANGE_75_100",
  OVER_100 = "OVER_100"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRange: PriceRange;
  imageUrl?: string;
  inStock: boolean;
  occasions: Occasion[];
  seasons: Season[];
  moods: Mood[];
  colors: Color[];
  type: ProductType;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FilterOptions {
  occasions: Occasion[];
  seasons: Season[];
  moods: Mood[];
  colors: Color[];
  types: ProductType[];
  priceRanges: PriceRange[];
}