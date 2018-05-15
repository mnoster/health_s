require('dotenv').config()
const Eth = require('ethjs')
const tc = require('truffle-contract')
const HDWalletProvider = require('truffle-hdwallet-provider')
const pify = require('pify')
const { soliditySHA3 } = require('ethereumjs-abi')
const Health = require('./contracts/Health.json')
// import BN from "bn.js"

// Contract Input Params: Array of hash({SellerDomain, SellerID, SellerRelationship})


  let companyAddress = null
  let user = null
  let address = null
  let contract = null

  async function initialize (companyAddress) {
      await assignContractAndAccount(companyAddress)
  }

  async function assignContractAndAccount (companyAddress) {
    contract = tc(Health)
    contract.setProvider(new Eth.HttpProvider('http://localhost:8545'))
    contract.defaults({from: '0x82b4ac04e5c998f7a87887db4fc8881ddbf02435'})
    contract = await contract.deployed()
    // this.setUpEvents()
  }

  async function  addMedicineRecord (medicineRecordData) {
    console.log('Add Medicine Data: ', medicineRecordData)
    try {
      // contract.defaults({from: companyAddress})
      return contract.addMedicineRecord(formatMedicineRecordData(medicineRecordData)[0])
    } catch (error) {
      console.log('Error')
    }
  }

  async function  addMedicineRecords (medicineRecordData) {
    console.log('Add Medicine Data: ', medicineRecordData)
    try {
      return contract.addMedicineRecords(formatMedicineRecordData(medicineRecordData))
    } catch (error) {
      console.log('Error Adding Medicine Record: ', error)
    }
  }

  async function  removeMedicineRecord (medicineRecordData) {
    console.log('Remove Seller Data: ', medicineRecordData)
    return contract.removeMedicineRecord(formatMedicineRecordData(medicineRecordData)[0])
  }

  async function  removeMedicineRecords (medicineRecordData) {
    console.log('Remove Sellers Data: ', medicineRecordData, formatMedicineRecordData(medicineRecordData))
    try {
      return contract.removeMedicineRecords(formatMedicineRecordData(medicineRecordData))
    } catch (error) {
      console.log('Error Removing Medicine Record')
    }
  }

  function  formatMedicineRecordData (medicineRecordData) {
    return medicineRecordData.map((data) => {
      return String([parseInt(data.timestamp.toLowerCase().trim()), data.medType.toLowerCase().trim(), data.location.toLowerCase().trim(), data.optional.toLowerCase().trim().replace(/ /g, '')])
    })
  }

module.exports = {
  initialize,
  addMedicineRecord,
  addMedicineRecords,
  removeMedicineRecord,
  removeMedicineRecords
}

