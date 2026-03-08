declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        fullName: string;
        role: "user" | "admin";
        brandsId: string[];
      };
    }
  }
}

export {};
