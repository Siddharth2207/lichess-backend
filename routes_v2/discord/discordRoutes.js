var express = require('express');
var router = express.Router();




var Controller = {
    DiscordController: require('../../controllers_v2/discord/controllers')
};



router.post(
    '/api/v2/processGame' ,
    Controller.DiscordController.processGame
) 

router.post(
    '/api/v2/computeGame' ,
    Controller.DiscordController.computeGame
)





 
 




module.exports = router;
