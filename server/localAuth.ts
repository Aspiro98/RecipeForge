import session from "express-session";
import type { Express, RequestHandler, Request } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        claims: {
          sub: string;
          email: string;
          first_name: string;
          last_name: string;
        };
      };
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // GET login route - return 405 Method Not Allowed
  app.get("/api/login", (req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST for login." });
  });

  // Simple login route for local development
  app.post("/api/login", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "User not found. Please sign up first." });
      }

      // Set user in session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.json({ 
        user,
        message: "Logged in successfully" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Signup route for local development
  app.post("/api/signup", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Create new user
      const newUser = await storage.upsertUser({
        email,
        firstName,
        lastName,
        profileImageUrl: null,
        id: `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });

      // Set user in session
      req.session.userId = newUser.id;
      req.session.user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };
      
      res.status(201).json({ 
        user: newUser,
        message: "Account created successfully" 
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // GET logout route for frontend compatibility
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "RecipeForge API is running",
      timestamp: new Date().toISOString()
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request for routes to use
    req.user = {
      claims: {
        sub: user.id,
        email: user.email || '',
        first_name: user.firstName || '',
        last_name: user.lastName || '',
      }
    };

    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
