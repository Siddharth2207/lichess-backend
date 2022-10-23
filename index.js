var express = require('express');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var fs = require('fs')
var logger = require('morgan')
const PORT = 5001;
var app = express()




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
    const allowedOrigins = ['http://localhost:3000', 'https://app.raingames.xyz' , 'http://localhost:5173' , 'https://rain-chess.on.fleek.co'] ;
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



app.use(
   
    require('./routes_v2/discord/discordRoutes')

);

app.use('*', (req, res) => {
    res.status(404).sendFile('views/404.html', { root: __dirname })
})

app.listen(process.env.PORT || PORT, 'localhost')

module.exports = app

console.log("App initialized")