import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import User from '../../../lib/models/user';
import Account from '../../../lib/models/account';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent", // Always ask for consent, good for testing to get refresh_token
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // `user` initially comes from the provider (email, name, image)
      // `account` has provider details (provider, type, providerAccountId, access_token, etc.)
      // `profile` is the raw profile from the provider (profile.email_verified, profile.email)

      if (account.provider === 'google') {
        if (!profile.email_verified || !profile.email) {
          console.log("Google account not verified or email missing.");
          return false; // Or redirect: '/auth/error?error=GoogleEmailNotVerified'
        }

        try {
          // Check if this OAuth account is already linked
          const existingLinkedAccount = await Account.getAccountByProvider(account.provider, account.providerAccountId);

          let dbUser;
          if (existingLinkedAccount) {
            // Account already linked, fetch the associated user
            dbUser = await User.findById(existingLinkedAccount.userId);
            if (!dbUser) {
              // This case is unlikely if data is consistent: linked account exists but user doesn't.
              console.error(`User not found for linked account: userId ${existingLinkedAccount.userId}`);
              // Optionally, could try to delete the orphaned account link here.
              return false; // Or redirect to an error page
            }
          } else {
            // OAuth account not yet linked. Try to find user by email or create a new one.
            dbUser = await User.findOrCreateForOAuth({
              email: profile.email,
              name: profile.name,
              image: profile.picture, // Google calls it 'picture'
            });

            if (!dbUser || !dbUser.id) {
              console.error('Could not find or create user for OAuth.');
              return false; // Or redirect to an error page
            }

            // Link the new OAuth account to our local user record
            await Account.linkAccount({
              userId: dbUser.id,
              type: account.type, // 'oauth'
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              scope: account.scope,
              session_state: account.session_state,
              token_type: account.token_type,
            });
          }

          // Pass internal user details (id, role) to the JWT callback via the `user` object.
          // `next-auth` will pass this `user` object to the `jwt` callback on the first call.
          user.id = dbUser.id; // This is your internal DB user ID
          user.role = dbUser.role;
          user.name = dbUser.name; // Use name from your DB
          user.email = dbUser.email; // Use email from your DB
          user.image = dbUser.profilePictureUrl; // Use image from your DB (mapped from profile.picture)

          return true; // Allow sign-in

        } catch (error) {
          console.error('NextAuth signIn callback error:', error);
          return false; // Or redirect to an error page
        }
      }
      return true; // Default for other providers or if not 'google'
    },

    async jwt({ token, user, account }) {
      // `user` is available only on the first call (after signIn)
      // `account` is available only on the first call
      if (user) { // This block runs on initial sign-in
        token.id = user.id; // Persist your internal user ID to the token
        token.role = user.role; // Persist role
        token.name = user.name; // Persist name
        token.email = user.email; // Persist email
        token.picture = user.image; // Persist image (profilePictureUrl)

        if (account) { // Persist OAuth specific tokens if needed for API calls from your backend
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token; // If available
          token.provider = account.provider;
        }
      }
      // On subsequent calls, `token` is the existing token, `user` and `account` are undefined.
      // The data (id, role, name, email, picture) is already in the token from the first call.
      return token;
    },

    async session({ session, token }) {
      // `token` is the JWT from the `jwt` callback.
      // `session` is what the client will receive.
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.accessToken = token.accessToken; // Pass OAuth access token if needed client-side (less common)
        session.provider = token.provider;
      }
      return session;
    },
  },
  // Specify pages if you have custom sign-in, sign-out, error pages
  // pages: {
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error', // Error code passed in query string as ?error=
  //   verifyRequest: '/auth/verify-request', // (used for email provider)
  //   newUser: null // If you want to redirect new users to a specific page
  // },
  // Add secret for signing JWTs, etc. Already mentioned for .env
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
