var express = require('express');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var fs = require('fs')
var logger = require('morgan')
const PORT = 5000;
var app = express()
const rateLimit = require("express-rate-limit");
const { constants } = require("./config/constants")


app.use(cors());
app.use(logger('dev'))
// LOGGING TO FILE
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' })
 
app.use(logger('dev', { stream: accessLogStream }));

// =====================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS POLICY
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'https://app.raingames.xyz' ,'https://rain-chess.on.fleek.co/' , 'http://localhost:5173/'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Authorization");
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname })
})

app.use(express.static(path.join(__dirname, "./public")));

// ============================================= Rate Limit
const publicEndPointRateLimiter = rateLimit({
    windowMs: constants.RATE_LIMIT_WINDOW, // 1 minutes
    max: constants.MAX_PUBLIC_REQUESTS, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    headers: true
})

const authEndPointRateLimiter = rateLimit({
    windowMs: constants.RATE_LIMIT_WINDOW, // 1 minutes
    max: constants.MAX_AUTH_REQUESTS, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    headers: true
})

// V2
// Authenticated
app.use('/api/v2/*', authEndPointRateLimiter);

// Public
app.use('/api/v2/get-nonce-to-sign', publicEndPointRateLimiter);
app.use('/api/v2/verify-signed-message', publicEndPointRateLimiter);

app.use('/api/v2/token/:token', publicEndPointRateLimiter);
// ============================================= Rate Limit Ends

app.use( 
    require('./routes_v2/discord/discordRoutes')

);

app.use('*', (req, res) => {
    res.status(404).sendFile('views/404.html', { root: __dirname })
})


app.listen(process.env.PORT || PORT , err => {
    if (err) console.error(err);
    console.log('Server started on :' , process.env.PORT );
  }); 


// app.listen(process.env.PORT || PORT, 'localhost')

module.exports = app

// console.log("App initialized")