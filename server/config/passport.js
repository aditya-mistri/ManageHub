// server/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Admin = require('../models/admin');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production' 
  ? 'https://assignmentx-k4ii.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback',


      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if admin already exists
          let admin = await Admin.findOne({ 
            $or: [
              { googleId: profile.id },
              { email: profile.emails[0].value }
            ]
          });

          if (admin) {
            // Update existing admin
            admin.lastLogin = Date.now();
            admin.name = profile.displayName;
            admin.avatar = profile.photos[0].value;
            await admin.save();
            return done(null, admin);
          }

          // Create new admin if not exists
          admin = new Admin({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            role: 'admin',
            lastLogin: Date.now()
          });

          await admin.save();
          return done(null, admin);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const admin = await Admin.findById(id);
      done(null, admin);
    } catch (err) {
      done(err, null);
    }
  });
};