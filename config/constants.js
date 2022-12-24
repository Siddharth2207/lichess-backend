const { ethers } = require('ethers')
const pinataSDK = require('@pinata/sdk')
const dotenv = require('dotenv')
var { Document } = require(`flexsearch`);
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET)
const API_KEY = `${process.env.API_KEY}`
const EXPIRY_TIME = `${process.env.EXPIRY_TIME}`

// =================== ADDRESS CACHING
const NodeCache = require("node-cache");
const addressCache = new NodeCache();

const erc20Index = new Document({
  id: "address",
  index: ["name", "symbol", "address"],
  store: true,
  tokenize: "forward",
  preset: "performance",
  cache: true,
  context: false,
});

let roles = Object.freeze({
  ROLE_SUPERADMIN: 'SUPERADMIN',
  ROLE_ADMIN: 'ADMIN',
  ROLE_DEPLOYER: 'DEPLOYER',
  ROLE_CLASS_CREATOR: 'CLASS_CREATOR',
  ROLE_ASSET_CREATOR: 'ASSET_CREATOR',
})

let constants = Object.freeze({
  // DB PATHS
  CLASS_NODE: 'class',
  ASSETS_NODE: 'assets',
  GAMES_NODE: 'games',
  USERS_NODE: 'users',
  TOKEN_NODE: 'tokens',
  ADDRESSES_NODE: 'addresses',
  RECENT_ADDRESSES_NODE: 'recentAddresses',
  EMISSIONS_NODE: 'emissions',
  STAKE_NODE: 'stake', 
  RULES_NODE: 'rules',
  DISCORD_NODE: 'discord',
  CHESS_NODE: 'chess',

  // ======================= ROLE PERMISSIONS

  // ASSETS
  createAssetDraftPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_ASSET_CREATOR,
  ],
  publishAssetDraftPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_DEPLOYER,
  ],
  editAssetDraftPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_ASSET_CREATOR,
  ],
  deleteAssetDraftPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_ASSET_CREATOR,
  ],
  getAssetDraftPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_ASSET_CREATOR,
  ],

  // CLASS
  createClassPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_CLASS_CREATOR,
  ],
  publishClassPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_DEPLOYER,
    roles.ROLE_CLASS_CREATOR,
  ],
  editClassPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_CLASS_CREATOR,
  ],
  deleteClassPermission: [
    roles.ROLE_SUPERADMIN,
    roles.ROLE_ADMIN,
    roles.ROLE_CLASS_CREATOR,
  ],

  // USER_MANAGEMENT
  changeUserRolePermission: [roles.ROLE_SUPERADMIN, roles.ROLE_ADMIN],
  addUserPermission: [roles.ROLE_SUPERADMIN, roles.ROLE_ADMIN],

  // MAX IMAGE SIZE [IN BYTES]
  MAX_IMAGE_SIZE: 104857600, // 100 MB
  MAX_ANIMATION_SIZE: 104857600, // 100 MB

  // Accepted file formats
  // Images:
  imageFileFormats: ['png', 'jpg', 'jpeg', 'svg'],
  animationFileFormats: ['mp4', 'gif', 'webm'],

  // Storage API to generate URL

  STORAGE_API: 'https://storage.googleapis.com',
  IPFS_BASE_URL: 'https://ipfs.io/ipfs',
  GQL_ENDPOINT: `${process.env.GQL_URI}`,
  GRAPH_URI: `${process.env.GRAPH_URI}`,
  GRAPH_NAME: `${process.env.GRAPH_NAME}`,
  STORAGE_BUCKET: 'rain-game-engine.appspot.com',
  AUTH_TOKEN_API: 'https://securetoken.googleapis.com',

  // RATE LIMIT
  RATE_LIMIT_WINDOW: 1 * 60 * 100, // 1 MINUTE WINDOW
  MAX_PUBLIC_REQUESTS: 1000, // 20 Requests in 1 minute for public endpoints
  MAX_AUTH_REQUESTS: 1000, // 50 Requests in 1 minute for authenticated endpoints

  // ATTRIBUTES
  DISPLAY_TYPES: [
    'properties',
    'rankings',
    'number',
    'boost_percentage',
    'boost_number',
    'date',
  ],

  // ATTRIBUTE DATA TYPES
  DISPLAY_TYPE_DATATYPE: {
    properties: 'string',
    rankings: 'number',
    number: 'number',
    boost_percentage: 'number',
    boost_number: 'number',
    date: 'number',
  },

  // ASSET DEPLOY STATUS
  ASSET_STATUS: {
    PENDING_GRAPH_SYNC: 'PENDING_GRAPH_SYNC',
    ASSET_HASH_MISMATCHED: 'ASSET_HASH_MISMATCHED',
    ASSET_PUBLISHED: 'ASSET_PUBLISHED',
    PENDING_DEPLOYMENT: 'PENDING_DEPLOYMENT',
    DEPLOYMENT_FAILED: 'DEPLOYMENT_FAILED',
  },

  // USED TO WAIT FOR AN ASSET TO GET DEPLOYED
  REFRESH_BUFFER: 300000, // 5 minutes

  // IPFS URLs
  FROM_IPFS_URL: 'ipfs:/',
  // FROM_IPFS_URL: 'https://gateway.pinata.cloud/ipfs',
  TO_IPFS_URL: 'https://api.thegraph.com/ipfs/api/v0/',
  MAX_IPFS_PINNING_RETRIES: 5,

  // RECENT ATTRIBUTES
  MAX_RECENT_ADDRESSES: 5,
  ADDRESS_CACHE_TTL: 300,
  // Address Types
  ADDRESS_TYPE: {
    ERC20: 0,
    ERC721: 1,
    ERC1155: 2,
    WALLET: 3,
    TIER_CONTRACT: 4,
    SALE_CONTRACT: 5,
    STAKING_CONTRACT: 6,

    0 : "ERC20",
    1 : "ERC721",
    2 : "ERC1155",
    3 : "WALLET",
    4 : "TIER_CONTRACT",
    5 : "SALE_CONTRACT",
    6 : "STAKING_CONTRACT"
  },
 
  // Emissions Types
  EMISSIONS_TYPE: {
    LINEAR: 0,
    SEQUENTIAL: 1,
  },

})

module.exports = {
  roles,
  constants,
  provider,
  API_KEY,
  EXPIRY_TIME,
  pinata,
  addressCache,
  erc20Index
}
