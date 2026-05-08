const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {

    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = new User({
          firstName: profile.name.givenName,
          email: profile.emails[0].value,
          username: profile.id,
          password: "google-auth",
          profilePic: profile.photos[0].value
        });

        await user.save();
      }

      return done(null, user);

    } catch (err) {
      return done(err, null);
    }
  }
));

// session store
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});