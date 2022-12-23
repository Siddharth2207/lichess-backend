
const asyncHandler = require("express-async-handler");

const {  provider  } = require("../../config/constants");

const axios = require('axios') 

let lichess = require('lichess-api') 

const Auth = require('../../utils/auth')

const dotenv = require('dotenv');
dotenv.config();


// Verifu Contract initated with signer
let { Verify } = require("rain-sdk")  

const {ethers} = require('ethers'); 
const { request, response } = require("express");
const e = require("express");
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); 
 


// getLichess username and data from sg
async function getAIdandAccountFromToken(token) { 

    const liChessProfileData = await axios.get(
        'https://lichess.org/api/account',
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        },
    )   

    let liChessUsername = liChessProfileData.data.username
    let liChessByteId = convertToHex(liChessUsername)

    const sgData = await axios.post(
        'https://api.thegraph.com/subgraphs/name/beehive-innovation/rain-protocol-mumbai-v3',
        {
            query: `{
                verifyApproves(where: {data: "${liChessByteId}"}) {
                    sender
                    data
                    account
                }
            }
           `,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    )    

    return {
        liChessUsername : liChessUsername ,
        subgData : sgData.data.data.verifyApproves
    }
    

}

//Verify Function 
async function verify(address,liChessId){ 

    try { 

        verifyContract = new Verify('0xf5b81a2B44189a8819eDC4Bb3A543eF89359a6D1', wallet)   
        let enc = new TextEncoder()
        let bytes = enc.encode(liChessId)   

        let args = [
            {
                "account": address ,
                "data": bytes
            }
        ]
        let tx = await verifyContract.approve(args , {
            gasPrice : ethers.utils.parseUnits('500', 'gwei'),
            gasLimit :  '200000'
        })
    
        let receipt = await tx.wait()  
       
    
        return receipt
        
    } catch (error) { 
        console.log(error) 
        return null
        
    }
}  

//Helper Function
function hex_to_ascii(str1)
 {
 var hex  = str1.toString();
 var str = '';
 for (var n = 0; n < hex.length; n += 2) {
  str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
 } 
 return str.replace( /[\x00-\x1F\x7F-\xA0]+/g, '' );
 }  

 function convertToHex(str) {
    let hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return '0x'+hex
}  

exports.getNftContext = asyncHandler(async (request,response) => { 

    try {  

        const {  lichessToken } = request.body   

        let userChainData = await getAIdandAccountFromToken(lichessToken)    
        let botAddress = await wallet.getAddress()  

        

        if(userChainData.liChessUsername){ 

            let LiChessUserUint = ethers.BigNumber.from(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(userChainData.liChessUsername)))
                    
    
            const nftContext = [LiChessUserUint]   
            const nftMessageHash = ethers.utils.solidityKeccak256(['uint256[]'], [nftContext]);   
            const nftBotSig = await wallet.signMessage(ethers.utils.arrayify(nftMessageHash))
            const nftSignedContext = {
                signer: botAddress, // bot adddress  
                signature: nftBotSig, // bot sig 
                context: nftContext
            }  
            return response.status(200).send({ status: true, code: 200, data : { 
                username : LiChessUserUint ,
                nftContext : nftSignedContext
            } })

        }else{ 
            return response.status(500).send({ status: true, code: 500, message : "Incorret Token" })
        }

    } catch (error) { 
        console.log(error)
        return response.status(500).send({ status: true, code: 500, message : "Error" })
        
    }
})

 
exports.mapAddressAccount = asyncHandler(async (request,response) => {
    try {

        const {signature , lichessToken} = request.body   
        let userChainData = await getAIdandAccountFromToken(lichessToken)   

        if(userChainData.subgData.length == 0){

            let signerAddress =  Auth.recoverAddrFromSig('RAIN_LI_CHESS_ACCOUNT_VERFICATION' ,signature )               
            let receipt = await verify(signerAddress ,userChainData.liChessUsername ) 
            if(receipt){
                return response.status(200).send({ status: true, code: 200, message: "Wallet Mapped With Lichess Account"})
            }
            return response.status(200).send({ status: false, code: 200, message: "Failed to map"})
        }
        
        return response.status(200).send({ status: false, code: 200, message: "Account already registered"})

    } catch (error) {
        console.log(error);
        return response.status(500).send({ status: false, code: 500, message: "Failed to verify" })
    }
})



exports.verifyLichessAccoutnAndAddress = asyncHandler(async (request,response) => {  


    try { 

        const {address , lichessToken} = request.body  
        let userChainData = await getAIdandAccountFromToken(lichessToken) 
        
        if(userChainData.subgData.length > 0){ 
            
            //lichess id is mapped with address 
            if(address.toLowerCase() == userChainData.subgData[0].account.toLowerCase()) {
                return response.status(200).send({ status: true, code: 200, message: "Wallet Connect verified"})
            }
            return response.status(401).send({ status: false, code: 401, message: "Incorrect wallet connected"})
            
        }else{
            //no mapping  
            return response.status(404).send({ status: false, code: 404, message: "Wallet not mapped to LiChess Account"})
        
    
        }
        
    } catch (error) { 
        console.log(error);
        return response.status(500).send({ status: false, code: 500, message: "Failed to verify" })
    }
})

exports.processGame = asyncHandler(async (request,response) => {  


    try { 

        const { gameId , winnerAddress ,lichessToken } = request.body   

        let userChainData = await getAIdandAccountFromToken(lichessToken)   
       

        let gameIdUint = ethers.BigNumber.from(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(gameId))).toString()

      

        if(userChainData.subgData.length > 0){ 
            
            //lichess id is mapped with address 
            if(winnerAddress.toLowerCase() == userChainData.subgData[0].account.toLowerCase()) {   

            
                let gameData, whitePlayerData , blackPlayerData , isClaimantWinner , winnerColor
                let signingObject = [] 
                let botAddress = await wallet.getAddress()  

                gameData = await getGameData(gameId)  

                gameData = JSON.parse(gameData)
                
                
                winnerColor = gameData.winner
                isClaimantWinner = gameData.players[winnerColor].userId == userChainData.liChessUsername.toLowerCase() ? true : false 
                
                // console.log('isClaimantWinner : ' , isClaimantWinner )  

                whitePlayerData = await getPlayerData(gameData.players.white.userId) 
                whitePlayerData = JSON.parse(whitePlayerData);   
                
                blackPlayerData = await getPlayerData(gameData.players.black.userId) 
                blackPlayerData = JSON.parse(blackPlayerData);    
                
                if(isClaimantWinner){
                                            
                    if(gameData.winner == 'white'){
                        // white winner , black loser    
                        
                        blackPlayerData.title == 'GM' ? signingObject.push(1): signingObject.push(0) 
                        gameData.players.white.rating > gameData.players.black.rating ? signingObject.push(1): signingObject.push(0) 
                        signingObject.push('100000000000000000000') // to be computed according to game economy   ,


                    }else if(gameData.winner == 'black'){  

                        whitePlayerData.title == 'GM' ? signingObject.push(1): signingObject.push(0) 
                        gameData.players.black.rating > gameData.players.white.rating ? signingObject.push(1): signingObject.push(0) 
                        signingObject.push('100000000000000000000')  
                    }  
                }else {  

                    let loserColor = winnerColor == 'white' ? 'black' : 'white' 
                   
                    if(userChainData.liChessUsername.toLowerCase() == gameData.players[loserColor].userId) {
                    
                        signingObject.push(0) 
                        signingObject.push(0) 
                        signingObject.push('50000000000000000000')   
                    }else{ 
                        return response.status(200).send({ status: false, code: 200, message: "Incorrect claimant"})
                    }


                }  

                //context for tokens other than XP
                const context = [winnerAddress , signingObject[0], signingObject[1], signingObject[2] , gameIdUint  ]                 
                const messageHash = ethers.utils.solidityKeccak256(['uint256[]'], [context]);   
                const botSig = await wallet.signMessage(ethers.utils.arrayify(messageHash))
                const signedContext = {
                    signer: botAddress, // bot adddress  
                    signature: botSig, // bot sig 
                    context: context
                }    

                //context for XP
                const xpArg = ethers.utils.solidityKeccak256(
                    ["uint256[]"],
                    [[gameIdUint,winnerAddress]]
                  );
                const xpContext = [winnerAddress , signingObject[0], signingObject[1], signingObject[2] , xpArg  ]   
                const xpMessageHash = ethers.utils.solidityKeccak256(['uint256[]'], [xpContext]);   
                const xpBotSig = await wallet.signMessage(ethers.utils.arrayify(xpMessageHash))
                const xpSignedContext = {
                    signer: botAddress, // bot adddress  
                    signature: xpBotSig, // bot sig 
                    context: xpContext
                }     

                

                return response.status(200).send({ status: true, code: 200, data : [signedContext,xpSignedContext]     })
                
            }else{
                return response.status(200).send({ status: false, code: 200, message: "Incorrect wallet connected"})
            }
             
            
        }else{
            return response.status(200).send({ status: false, code: 200, message: "LiChess Account not mapped with an address"})    
        } 



        
    } catch (error) { 
        console.log(error);
        return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
    }
})  

exports.computeGame = asyncHandler(async (request,response) => {  
    
    try { 

        const { gameId , winnerAddress ,lichessToken } = request.body   

        let userChainData = await getAIdandAccountFromToken(lichessToken)   
       
        if(userChainData.subgData.length > 0){ 
            
            //lichess id is mapped with address 
            if(winnerAddress.toLowerCase() == userChainData.subgData[0].account.toLowerCase()) {   

            
                let gameData, whitePlayerData , blackPlayerData , isClaimantWinner , winnerColor
                let signingObject = {}

    
                gameData = await getGameData(gameId)  

                gameData = JSON.parse(gameData)
                   
                winnerColor = gameData.winner
                isClaimantWinner = gameData.players[winnerColor].userId == userChainData.liChessUsername.toLowerCase() ? true : false 
                

                whitePlayerData = await getPlayerData(gameData.players.white.userId) 
                whitePlayerData = JSON.parse(whitePlayerData);   
                
                blackPlayerData = await getPlayerData(gameData.players.black.userId) 
                blackPlayerData = JSON.parse(blackPlayerData);    
                
                if(isClaimantWinner){
                                            
                    if(gameData.winner == 'white'){
                        // white winner , black loser    
                        blackPlayerData.title == 'GM' ? signingObject["GM"] = 1 : signingObject["GM"] = 0
                        gameData.players.white.rating > gameData.players.black.rating ? signingObject["IMPRV"] = 1 : signingObject["IMPRV"] = 0
                        signingObject["XP"] = 100 // to be computed from game economy  
                        signingObject["WIN"] = 1
                    }else if(gameData.winner == 'black'){ 
                        whitePlayerData.title == 'GM' ? signingObject["GM"] = 1 : signingObject["GM"] = 0
                        gameData.players.black.rating > gameData.players.white.rating ? signingObject["IMPRV"] = 1 : signingObject["IMPRV"] = 0
                        signingObject["XP"] = 100  
                        signingObject["WIN"] = 1
                    }   
                }else {   
                    let loserColor = winnerColor == 'white' ? 'black' : 'white' 
                    if(userChainData.liChessUsername.toLowerCase() == gameData.players[loserColor].userId) {

                        signingObject = {
                            "GM": 0,
                            "IMPRV": 0,
                            "XP": 50,
                            "WIN": 0
                        }
                    }else{ 
                      
                        return response.status(200).send({ status: false, code: 200, message: "Incorrect claimant"})
                    } 
                    
                }  
        
                return response.status(200).send({ status: true, code: 200, data : signingObject })
                
            }else{
                return response.status(200).send({ status: false, code: 200, message: "Incorrect wallet connected"})
            }
             
            
        }else{
            return response.status(200).send({ status: false, code: 200, message: "LiChess Account not mapped with an address"})    
        } 



        
    } catch (error) { 
        console.log(error);
        return response.status(500).send({ status: false, code: 500, message: "Failed to create" })
    }


   
})  









// Converting lichess-api callbacks to promises 

const getGameData = (id) => {
    return new Promise((resolve, reject) => { 

        lichess.game(id,   (err, game) => {
            if (err) {
                return reject(err);
            }

            resolve(game);
        })  
       
    });
}  


const getPlayerData = (id) => {
    return new Promise((resolve, reject) => { 

        lichess.user(id,   (err, user) => {
            if (err) {
                return reject(err);
            }

            resolve(user);
        })  
       
    });
} 


