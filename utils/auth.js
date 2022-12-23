
const { ethers } = require('ethers')


// idToken comes from the client app

module.exports = {

   

    /*
    *   Recovering address from signature sent by user
    */
    recoverAddrFromSig: function (message, signature) {
        const digest = ethers.utils.arrayify(ethers.utils.hashMessage(message.toString()));
        const address = ethers.utils.recoverAddress(digest, signature)
        return address;
    },

}


