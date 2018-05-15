require('dotenv').config()
const tc = require('truffle-contract')
const {utils}= require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const pify = require('pify')
const { soliditySHA3 } = require('ethereumjs-abi')

const Health = require('./contracts/Health.json')
const mnemonic =  "axi entry advice cash way emotion tenant actual negative garbage elbow mistake"

const providerUrl =  'http://localhost:8545' //'https://rinkeby.infura.io:443' 
const WalletProvider = require("truffle-wallet-provider");

//const keystore = {"address":"03e277534906765629a2b278aff9a5cfb895045a","crypto":{"cipher":"aes-128-ctr","ciphertext":"d778a596cab2228a2d616c2f7d0dac085b9e414318f86015ee30bb30b414c3d4","cipherparams":{"iv":"28164b188a7a01e1c08053d9b327df83"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"f51a58f94bd8336aea99b2f6086e24be364a5c0c1ea6991c4da3d5e985c637ad"},"mac":"cd52f7bbef82d99dca48af290c43b61a47fc13ba3f426ce0e78b9295ffcdce66"},"id":"32ba9b01-b8c1-488d-85ac-70818b94275d","version":3}
const keystore = {"address":"82b4ac04e5c998f7a87887db4fc8881ddbf02435","crypto":{"cipher":"aes-128-ctr","ciphertext":"0d67e68761151e316ff9f92e3daf3bf73a94132685b7d10eb526f63e06c46476","cipherparams":{"iv":"c84955deb209ad0ea499180181606f94"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"aa540d6b111c91853ddc47a9cd4d2f207f6d9a9e026f94eb12b6d9162837b7be"},"mac":"7dc661adb33bf041067290642026631346f1034f86379bcb92d96e75b29e8ffb"},"id":"f1acc34d-6a3c-4d4d-ad19-80fc9ab09d5d","version":3}
var wallet = require('ethereumjs-wallet').fromV3(keystore,'');

const provider = new WalletProvider(wallet, providerUrl);
const hex2ascii = require('hex2ascii')

let instance = null
let balance = null 
let account = null
let allEvents = null

async function setInstance () {
  instance = tc(Health)
  instance.setProvider(provider)
  const { web3 } = instance
  const accounts = await pify(web3.eth.getAccounts)()
  balance = () => { 
    return new Promise ((resolve, reject) => {
      web3.eth.getBalance(accounts[0], (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })
  }
  console.log("accounts: ",accounts, "balance", await balance())
  account = accounts[0]
  instance = await instance.deployed()
}

async function registerCompanyAddress(company, address) {
  console.log("company & address:", company, address)
  if (typeof company !== 'string' || typeof address !== 'string') {
    return false
  }

  company = company.toLowerCase()
  address = address.toLowerCase()

  console.log("company: ",company, "address: ", address, "account: ", account)
  try {
    await instance.registerCompanyAddress(company, address, {from: account})
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

async function updateCompanyAddress (company, address) {
  if (typeof company !== 'string') {
    return false
  }
  if (typeof address !== 'string') {
    return false
  }

  company = company.toLowerCase()
  address = address.toLowerCase()

  try {
    await instance.updateCompanyAddress(company, address, {from: account, gas: 70000})
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}


function setUpEvents () {
  let res
 instance.allEvents({fromBlock: 0, toBlock: 'latest'})
  .get((error, logs) => {
    if (error) {
      console.error(error)
      return false
    }
    // let d = logs.map((log)=>{
    //   return [log.event ,hex2ascii(log.args.company),hex2ascii(log.args.medicineHash)]
    // })
    console.log(logs)
    allEvents = logs
    res = logs 
  })

  setTimeout(()=>{
      return res
    },2000)
}

function getEventHistory(call){ 
    let respo = instance.allEvents({fromBlock: 0, toBlock: 'latest'}).get(call)
    return respo
    // res = response.map((log) => {
    //   return [log.event , "Company: " + hex2ascii(log.args.company),"Medicine Record: " + hex2ascii(log.args.medicineHash)]
    // })
}


async function getCompanyByCompanyAddress(address) {
  if (typeof address !== 'string') {
    return false
  }

  address = address.toLowerCase()

  try {
    const company = await instance.companies.call(address)
    console.log("company: ", company)
    if (company === `0x0000000000000000000000000000000000000000000000000000000000000000`) {
      return []
    } else {
      return [utils.toUtf8(company)]
    }
  } catch (error) {
    console.error(error)
    return [] 
  }
}

async function isRegisteredCompany (company) {
  if (typeof company !== 'string') {
    return false
  }

  company = company.toLowerCase()

  try {
    const isReg = await instance.isRegisteredCompany(company, {from: account})

    return isReg
  } catch (error) {
    console.error(error)
    return false
  }
}

async function getCompanyAddressByCompany (company) {
  if (typeof company !== 'string') {
    return false
  }

  company = company.toLowerCase()
  pubcompany = `0x${soliditySHA3(["bytes32"], [company.toLowerCase().trim()]).toString('hex')}`

  try {
    const pubKey = await instance.companyAddress.call(company)
     return pubKey
  } catch (error) {
    console.error(error)
    return false
  }
}

async function getMedicineRecord (company, timestamp, medType, location, optional) {

  if (typeof company !== 'string') {
    throw new Error('CompanyAddress company is required')
  }

  if (typeof medType !== 'string') {
    throw new Error('med type is required')
  }

  if (typeof timestamp !== 'string') {
    throw new Error('timestamp ID is required')
  }

  if (typeof location !== 'string') {
    throw new Error('location is required')
    return false
  }
    if (typeof optional !== 'string') {
    throw new Error('optional is required')
    return false
  }

  companyHash = `0x${soliditySHA3(["bytes32"], [company.toLowerCase().trim()]).toString('hex')}`
  const medicineRecordHash = String([parseInt(timestamp.toLowerCase().trim()), medType.toLowerCase().trim(), location.toLowerCase().trim(), optional.toLowerCase().trim().replace(/ /g, '')])  
  console.log(company, timestamp, medType, location, optional, {from: account}, "CompanyHash:", medicineRecordHash )

  let response = await instance.medicines.call(companyHash, medicineRecordHash)
  // response is Boolean
  return response
}

function getInstance () {
  return instance
}

async function init () {
  await setInstance()
}

module.exports = {
  init,
  isRegisteredCompany,
  getCompanyAddressByCompany,
  registerCompanyAddress,
  updateCompanyAddress,
  getCompanyByCompanyAddress,
  getMedicineRecord,
  setUpEvents,
  getEventHistory,
  instance,
  allEvents
}
