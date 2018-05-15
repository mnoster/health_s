const Koa = require('koa')
const route = require('koa-path-match')()
const cors = require('koa-cors')
const serve = require('koa-static')
const koaSwagger = require('koa2-swagger-ui')
const app = new Koa()
const axios = require("axios")
const bodyParser = require('koa-bodyparser')()
const convert = require('koa-convert')
const util = require('util')
const hex2ascii = require('hex2ascii')
const delay = require('delay')
const {
  initialize,
  addMedicineRecord,
  addMedicineRecords,
  removeMedicineRecord,
  removeMedicineRecords
} = require('./HealthService.js')

app.use(require('kcors')())

const {
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
} = require('./contract')

const isValidAddress = require('./isValidAddress')

app.use(serve(__dirname + '/../public'))
app.use(convert(bodyParser))

// const allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Methods', 'GET,POST');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');

//     next();
// }
// app.use(allowCrossDomain)

app.use(koaSwagger({
  title: 'HEALTH API',
  routePrefix: '/v1',
  swaggerOptions: {
    url: 'swagger.yml',
    validatorUrl: false
  },
  hideTopbar: true,
}))

app.use(route('/').get(ctx => {
  ctx.body = 'HEALTH API'
}))

app.use(route('/register').get(async (ctx) => {
  try {
    let {company, address} = ctx.request.query
    console.log("company: ", company)
    console.log("company addr: ", address)

    if (!company) {
      ctx.body = {error: 'company is required'}
      return false
    }

    address = address.toLowerCase()
    console.log("company: ",company)

    const isReg = await isRegisteredCompany(company)
    if (isReg) {
      // Update to new pub
      const pubKey = await getCompanyAddressByCompany(company)
      console.log("pubkey: ",pubKey)
      console.log("DA: ",address)

      if (pubKey === address) {
        ctx.body = {error: 'company is already in registry'}
        return false
      } else {
        // Update to new address
        const updateReg = await updateCompanyAddress(company, address)
        if (updateReg) {
          ctx.body = {message: 'company updated'}
        } else {
          ctx.body = {error: 'There was an error trying to update'}
        }        
      }
    } else {
      // Register new pub
      const didReg = await registerCompanyAddress(company, address)
      if (didReg) {
        ctx.body = {message: 'company registered'}
      } else {
        ctx.body = {error: 'There was an error trying to register'}
      }
    }
  } catch (error) {
    console.error(error)
    ctx.body = {error: 'There was an error with the request'}
  }
}))


app.use(route('/company').get(async (ctx) => {
  try {
    const {
      address,
    } = ctx.request.query
    console.log("Address: ", address)
    if (!isValidAddress(address)) {
      ctx.body = {error: 'Invalid public key address'}
      return false
    }

    const companies = await getCompanyByCompanyAddress(address)
    ctx.body = {companies}
  } catch (error) {
    console.error(error)
    ctx.body = {message: 'There was an error with the request'}
  }
}))


app.use(route('/medicine_record').get(async (ctx) => {
  try {
    const {
      company,
      timestamp,
      medType,
      location,
      optional
    } = ctx.request.query

    const isReg = await isRegisteredCompany(company)
    console.log("IS REG: ", isReg)

    if (isReg) {
      const medicine = await getMedicineRecord(company, timestamp, medType, location, optional)

      if (parseInt(medicine.hash, 16) !== 0) {
        ctx.body = {medicine}
      } else {
        ctx.body = {error: 'Not a Medicine Record'}
      }
    } else {
      ctx.body = {error: 'Company Address is not in contract'}
    }

  } catch (error) {
    console.error(error)
    ctx.body = {message: 'There was an error with the request'}
  }
}))

app.use(route('/getMedicineRecord').post(async (ctx)=>{
  try {
    const {
      address,
      company,
      timestamp,
      medType,
      location,
      optional
    } = ctx.request.body

    const isReg = await isRegisteredCompany(company)
    console.log("IS REG: ", isReg)

    if (isReg) {

      const medicine = await getMedicineRecord(company, timestamp, medType, location, optional)
      console.log("medicine.hash: ",medicine)
      if (parseInt(medicine.hash, 16) !== 0) {
        ctx.body = {medicine}
      } else {
        console.log("error: " , error)

        ctx.body = {error: 'Not a Medicine Record'}
      }
    } else {
      ctx.body = {error: 'Company Address is not in contract'}
    }

  } catch (error) {
    console.error(error)
    ctx.body = {message: 'There was an error with the request'}
  }
}))

app.use(route('/getEventHistory').post(async (ctx) => {
  let events
  let tt = await getEventHistory((error, response) => {
        events = response 
        return events
  })
  await delay(2000)
  console.log("events: ", events)
  ctx.body = events
}))

app.use(route('/addMedicineRecord').post(async (ctx)=>{
  try {
    const {
      company,
      address,
      timestamp,
      medType,
      location,
      optional
    } = ctx.request.body

    const isReg = await isRegisteredCompany(company)
    console.log("IS REG: ", isReg)

    if (isReg) {
      
      const init = await initialize(address)
      const medicine = await addMedicineRecords([{timestamp, medType, location, optional}], address)

      if (parseInt(medicine.hash, 16) !== 0) {
        ctx.body = {medicine}
      } else {
        console.log("error: " , error)
        ctx.body = {error: 'Not a Medicine Record'}
      }
    } else {
      ctx.body = {error: 'Company Address is not in contract'}
    }

  } catch (error) {
    console.error(error)
    ctx.body = {message: 'There was an error with the request'}
  }
}))

app.use(route('/removeMedicineRecord').post(async (ctx)=>{
  try {
    const {
      company,
      address,
      timestamp,
      medType,
      location,
      optional
    } = ctx.request.body

    const isReg = await isRegisteredCompany(company)
    console.log("IS REG: ", isReg)

    if (isReg) {
      
      const init = await initialize(address)
      const medicine = await removeMedicineRecords([{timestamp, medType, location, optional}], address)

      if (parseInt(medicine.hash, 16) !== 0) {
        ctx.body = {medicine}
      } else {
        console.log("error: " , error)
        ctx.body = {error: 'Not a Medicine Record'}
      }
    } else {
      ctx.body = {error: 'Company Address is not in contract'}
    }

  } catch (error) {
    console.error(error)
    ctx.body = {message: 'There was an error with the request'}
  }
}))

const port = process.env.PORT || 8000

async function main() {
  await init()

  app.listen(port, () => {
    console.log(`listening on port ${port}`)
    //setUpEvents()

  })
}

main()