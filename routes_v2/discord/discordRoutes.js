var express = require('express');
var router = express.Router();


// var Helper = {
//     Auth: require('../../utils/auth'), 
   
// }

var Controller = {
    DiscordController: require('../../controllers_v2/discord/controllers')
};



router.post(
    '/api/v2/processGame' ,
    Controller.DiscordController.processGame
) 

router.post(
    '/api/v2/computeWin' ,
    Controller.DiscordController.computeWin
)



// router.post(
//     '/api/v2/verifyGame',  
//     Controller.DiscordController.gameVerify
// ); 

// router.post(
//     '/api/v2/verifyChessTurns',  
//     Controller.DiscordController.chessTurnsVerify
// ); 

// router.post(
//     '/api/v2/verifyChessGame',  
//     Controller.DiscordController.chessGameVerify
// ); 


 
 




module.exports = router;
