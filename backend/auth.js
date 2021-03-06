const request = require('request')
const passport = require('passport')
const BearerStrategy = require('passport-http-bearer').Strategy

/**
 * Name of the strategy used for passport authentication
 * @type {string}
 */
const STRATEGY_NAME = 'bearer'

/**
 * Endpoint to fetch used-related data
 * More info: https://developers.miro.com/reference#section-get-current-token-context
 * @type {string}
 */
const MIRO_TOKEN_CONTEXT_ENDPOINT = 'https://api.miro.com/v1/oauth-token'

// Registering HTTP Bearer strategy for passport
passport.use(STRATEGY_NAME, new BearerStrategy((token, done) => {
  request(
    MIRO_TOKEN_CONTEXT_ENDPOINT, {
      json: true,
      auth: {
        bearer: token
      }
    },
    (err, res, body) => {
      if (err) {
        return done(err)
      } else if (res.statusCode !== 200) {
        return done(body)
      } else {
        return done(null, {
          ...body,
          token
        })
      }
    });
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj));

/**
 * Socket IO middleware has different signature (socket, next) as opposed to Connect middleware (req, res, next).
 * That's why we have to "wrap" it like this
 * @param {Socket} socket
 * @param {Function} next
 */
function initializeSocketMiddleware(socket, next) {
  passport.initialize()(socket.request, {}, next)
}

/**
 * @param {Socket} socket
 * @param {Function} next
 */
function authenticateSocketMiddleware(socket, next) {
  passport.authenticate(STRATEGY_NAME, {session: false}, (err, user) => {
    if (err) {
      return next(err);
    } else {
      // This will set current user to socket.request.session.passport
      // More info: https://github.com/jwalton/passport-api-docs#passportauthenticatestrategyname-options-callback
      socket.request.login(user, next);
    }
  })(socket.handshake)
}

module.exports = {
  STRATEGY_NAME,
  passport,
  initializeSocketMiddleware,
  authenticateSocketMiddleware
}