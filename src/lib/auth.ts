import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import db from '@/lib/db';
import { comparePassword } from '@/lib/auth/password';
import { authConfig } from '@/lib/auth.config';
import { sendEmail } from '@/lib/email';

// Memory cache for rate-limiting logins (resets on server restart, simple and fast)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  basePath: '/api/auth',

  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes access token
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    // Google OAuth - For client-facing public login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials - For Admin & Employee logins
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        loginType: { label: 'Login Type', type: 'text' },
        twoFactorCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;

        // --- Security: Max Login Attempts ---
        const maxLoginsSetting = await db.siteSetting.findUnique({ where: { key: 'sec_max_logins' } });
        const maxLogins = parseInt(maxLoginsSetting?.value || '5');

        const attemptRecord = loginAttempts.get(email);
        if (attemptRecord && attemptRecord.lockedUntil > Date.now()) {
          const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 60000);
          throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`);
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!user.isActive) {
          throw new Error('Account is disabled. Contact your administrator.');
        }

        // Security role check based on login portal
        const loginType = credentials.loginType as string;
        
        const STAFF_ROLES = [
          'SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MARKETING', 
          'SUPPORT', 'CONTENT_EDITOR', 'FINANCE', 'EMPLOYEE'
        ];

        if (loginType === 'admin') {
          if (!STAFF_ROLES.includes(user.role)) {
            throw new Error('Access denied. Admin portal requires elevated privileges.');
          }
        } else if (loginType === 'client') {
          if (user.role !== 'CLIENT' && user.role !== 'GUEST') {
            throw new Error('Access denied. Please use the admin portal to log in.');
          }
        }

        const isPasswordValid = await comparePassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          // Record failed attempt
          const currentAttempts = (loginAttempts.get(email)?.count || 0) + 1;
          if (currentAttempts >= maxLogins) {
            loginAttempts.set(email, { count: currentAttempts, lockedUntil: Date.now() + 15 * 60 * 1000 }); // Lock for 15 mins
            throw new Error(`Account locked due to ${maxLogins} failed attempts. Try again in 15 minutes.`);
          } else {
            loginAttempts.set(email, { count: currentAttempts, lockedUntil: 0 });
          }
          return null;
        }

        // Reset attempts on successful login
        loginAttempts.delete(email);

        // --- Security: Two-Factor Authentication (2FA) ---
        const twoFaSetting = await db.siteSetting.findUnique({ where: { key: 'sec_2fa' } });
        const require2fa = twoFaSetting?.value; // 'all' | 'admin' | 'optional'

        let needs2fa = false;
        if (require2fa === 'all') needs2fa = true;
        if (require2fa === 'admin' && STAFF_ROLES.includes(user.role)) needs2fa = true;

        if (needs2fa) {
          const providedCode = credentials.twoFactorCode as string | undefined;
          
          if (providedCode) {
            // Verify code
            const tokenRecord = await db.verificationToken.findUnique({
              where: { identifier_token: { identifier: email, token: providedCode } },
            });

            if (!tokenRecord || tokenRecord.expires < new Date()) {
              throw new Error('Invalid or expired 2FA code.');
            }

            // Valid code! Delete it so it can't be used again
            await db.verificationToken.delete({
              where: { identifier_token: { identifier: email, token: providedCode } },
            });
            
            // Proceed to return user
          } else {
            // No code provided, generate one and send email
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            await db.verificationToken.upsert({
              where: { identifier_token: { identifier: email, token: code } },
              create: { identifier: email, token: code, expires: new Date(Date.now() + 10 * 60 * 1000) },
              update: { expires: new Date(Date.now() + 10 * 60 * 1000) },
            });

            await db.verificationToken.deleteMany({
              where: { identifier: email, token: { not: code } }
            });

            await sendEmail({
              to: email,
              subject: 'Your Login Verification Code',
              html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
                  <h2>Security Verification</h2>
                  <p>Please enter the following 6-digit code to complete your login:</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f0f0f0; border-radius: 8px; margin: 20px 0;">
                    ${code}
                  </div>
                  <p style="font-size: 13px; color: #666;">This code expires in 10 minutes. If you did not request this, please change your password immediately.</p>
                </div>
              `
            });

            throw new Error(`2FA_REQUIRED`);
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          department: user.department,
        };
      },
    }),
  ],

  callbacks: {
    // Inject role and department into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.loginTime = Date.now();
      }

      // --- Security: Dynamic Session Timeout ---
      if (token.loginTime) {
        // Fetch session timeout dynamically on each token refresh
        const timeoutSetting = await db.siteSetting.findUnique({ where: { key: 'sec_session_timeout' } });
        const timeoutHours = parseInt(timeoutSetting?.value || '24');
        const timeoutMs = timeoutHours * 60 * 60 * 1000;

        if (Date.now() - (token.loginTime as number) > timeoutMs) {
          // Token expired based on dynamic setting
          token.expired = true;
        }
      }

      return token;
    },

    // Expose role and department to the Session object on the client
    async session({ session, token }) {
      if (token.expired) {
        // Invalidate session by returning empty if the dynamic timeout was hit
        return {} as any;
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
      }
      return session;
    },
  },
});
