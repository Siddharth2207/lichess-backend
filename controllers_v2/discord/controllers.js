
const asyncHandler = require("express-async-handler");


let lichess = require('lichess-api') 

const dotenv = require('dotenv');
dotenv.config();

 
const {ethers} = require('ethers'); 


const provider = new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); 
 


 


exports.processGame = asyncHandler(async (request,response) => {  


    try { 

        const { gameId , winnerAddress  } = request.body;   
        let gameData, whitePlayerData , blackPlayerData 
        let signingObject = [] 
        let botAddress = await wallet.getAddress() 
        console.log(botAddress)
        
        lichess.game(gameId, async function (err, game) {  
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

                        lichess.user(gameData.players.black.userId, async  function (err, user) { 
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


                                

                                // to do : verify winner address from subgraph 
                                const context = [winnerAddress , signingObject[0], signingObject[1], signingObject[2]] 
                                const messageHash = ethers.utils.solidityKeccak256(['uint256[]'], [context]);   


                               
                                const botSig = await wallet.signMessage(ethers.utils.arrayify(messageHash))
                                const signedContext = {
                                    signer: botAddress, // bot adddress  
                                    signature: botSig, // bot sig 
                                    context: context
                                }   

                                console.log( "signedContext : " , signedContext )

                                return response.status(200).send({ status: true, code: 200, data : signedContext })



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

exports.computeGame = asyncHandler(async (request,response) => {  

   

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
                                   signingObject["WIN"] = 1

                               }else if(gameData.winner == 'black'){ 
                                   whitePlayerData.title == 'GM' ? signingObject["GM"] = 1 : signingObject["GM"] = 0
                                   gameData.players.black.rating > gameData.players.white.rating ? signingObject["IMPRV"] = 1 : signingObject["IMPRV"] = 0
                                   signingObject["XP"] = 100  
                                   signingObject["WIN"] = 1

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











