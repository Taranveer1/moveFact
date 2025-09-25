// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuth = require("next-auth").default;
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
