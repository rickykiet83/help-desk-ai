import { auth } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      user?: typeof auth.$Infer.Session.user;
      session?: typeof auth.$Infer.Session.session;
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
}
