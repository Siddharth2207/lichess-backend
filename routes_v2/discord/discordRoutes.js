var express = require('express');
var router = express.Router();


// var Helper = {
//     Auth: require('../../utils/auth'), 
   
// }

var Controller = {
    DiscordController: require('../../controllers_v2/discord/controllers')
};


router.post(
    '/lichess/api/v2/processGame' , 
    Controller.DiscordController.processGame 

) 

router.post(
    '/lichess/api/v2/computeGame' ,
    Controller.DiscordController.computeGame
) 

router.post(
    '/lichess/api/v2/verifyAccount' ,
    Controller.DiscordController.verifyLichessAccoutnAndAddress
) 

router.post(
    '/lichess/api/v2/registerWallet' ,
    Controller.DiscordController.mapAddressAccount
) 

router.post(
    '/lichess/api/v2/getNftContext' ,
    Controller.DiscordController.getNftContext
) 







 
 




module.exports = router;
