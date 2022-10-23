
const asyncHandler = require("express-async-handler");

const axios = require('axios') 
const Request = require("request"); 
let lichess = require('lichess-api') 
const { tall } = require('tall')


// Verifu Contract initated with signer
let { Verify } = require("rain-sdk") 
const {ethers} = require('ethers'); 
const { request, response } = require("express");
// let wallet = new ethers.Wallet('9fb5526fd6cb68eef6f93da85d0e69d7ffecd17b76b4381574d4daf2f11a945d', provider); 
 


 


exports.processGame = asyncHandler(async (request,response) => {  

     // sample computed data from backend
    //  let gameData = {  
    //     gameId : gameIdNumber , 
    //     isbeatenGM : false , // winner 
    //     winnersAddress : '0xD09c80BD55FcA5a3B2407106b65f6ab82E871F21' , 
    //     XPPoints : 10 , 
    //     beatenBetterPlayer : true
    //   }   
  

    try { 

        const { gameId } = request.body;   
        let gameData, whitePlayerData , blackPlayerData 
        let signingObject = []
        
        lichess.game(gameId, function (err, game) {  
            //get game data . 

            if(!err){ 
                let gameData = JSON.parse(game)
                console.log(gameData)  
                
                // get white player data
                lichess.user(gameData.players.white.userId, function (err, user) { 
                    if(err){
                        return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
                    }else{
                        whitePlayerData = JSON.parse(user);  
                        console.log(whitePlayerData)

                        lichess.user(gameData.players.black.userId, function (err, user) { 
                            if(err){
                                return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
                            }else{
                                blackPlayerData = JSON.parse(user)     

                                
                                if(gameData.winner == 'white'){
                                    // white winner , black loser    
                                    
                                    blackPlayerData.title == 'GM' ? signingObject.push(1): signingObject.push(0) 
                                    gameData.players.white.rating > gameData.players.black.rating ? signingObject.push(1): signingObject.push(0) 
                                    signingObject.push('100000000000000000000') // to be computed 

                                }else if(gameData.winner == 'black'){ 
                                    whitePlayerData.title == 'GM' ? signingObject.push(1): signingObject.push(0) 
                                    gameData.players.black.rating > gameData.players.white.rating ? signingObject.push(1): signingObject.push(0) 
                                    signingObject.push('100000000000000000000')  
                                } 

                                return response.status(200).send({ status: true, code: 200, data : signingObject })



                            }
                        })

                    }
                    
                  })

            }  

         }) 




        
    } catch (error) { 
        console.log(err);
        return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
    }
}) 

exports.computeWin = asyncHandler(async (request,response) => {  

   

   try { 

       const { gameId } = request.body;   
       let gameData, whitePlayerData , blackPlayerData 
       let signingObject = {}
       
       lichess.game(gameId, function (err, game) {  
           //get game data . 

           if(!err){ 
               let gameData = JSON.parse(game)
               console.log(gameData)  
               
               // get white player data
               lichess.user(gameData.players.white.userId, function (err, user) { 
                   if(err){
                       return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
                   }else{
                       whitePlayerData = JSON.parse(user);  
                       console.log(whitePlayerData)

                       lichess.user(gameData.players.black.userId, function (err, user) { 
                           if(err){
                               return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
                           }else{
                               blackPlayerData = JSON.parse(user)     

                              

                               if(gameData.winner == 'white'){
                                   // white winner , black loser    
                                   
                                   blackPlayerData.title == 'GM' ? signingObject["GM"] = 1 : signingObject["GM"] = 0
                                   gameData.players.white.rating > gameData.players.black.rating ? signingObject["IMPRV"] = 1 : signingObject["IMPRV"] = 0
                                   signingObject["XP"] = 100 // to be computed 

                               }else if(gameData.winner == 'black'){ 
                                   whitePlayerData.title == 'GM' ? signingObject["GM"] = 1 : signingObject["GM"] = 0
                                   gameData.players.black.rating > gameData.players.white.rating ? signingObject["IMPRV"] = 1 : signingObject["IMPRV"] = 0
                                   signingObject["XP"] = 100 
                               } 

                               return response.status(200).send({ status: true, code: 200, data : signingObject })



                           }
                       })

                   }
                   
                 })

           }  

        }) 




       
   } catch (error) { 
       console.log(err);
       return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
   }
})











