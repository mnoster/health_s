# Health Server

# Development

- Start testrpc using same mnemonic

```bash
npm run testrpc
```

testrpc -m 'axis entry advice cash way emotion tenant actual negative garbage elbow mistake'


#### Update contracts/Health.json file on health_server
- Copy ABI into Sever
cp build/contracts/Health.json ../health_server/src/contracts/

#### Start health_server

```
npm run start
```
## Test REQ CMDS

- Register: 
```
curl -X GET "http://localhost:8000/register?address=0xef7a1d98b4ea5ab057fab8323186d1ba46802af5&company=healthinc" -H "accept: application/json"
```

- Check Is Registered: 
```
curl -i  http://localhost:8000/company?address=0xef7a1d98b4ea5ab057fab8323186d1ba46802af5
```

- Add Medical Record
```
curl -X POST "http://localhost:8000/addMedicineRecord" -d 'company=healthinc&address=0xef7a1d98b4ea5ab057fab8323186d1ba46802af5&timestamp=345803&medType=benzodiazapine&location=losangeles&optional=metadata'  -H "accept: application/json"
```

- Check Medical Record
```
curl -X POST "http://localhost:8000/getMedicineRecord" -d 'company=healthinc&address=0xef7a1d98b4ea5ab057fab8323186d1ba46802af5&timestamp=345803&medType=benzodiazapine&location=losangeles&optional=metadata'  -H "accept: application/json"
```
- Get Events 
```
curl -X POST "http://localhost:8000/getEventHistory
```
# License

MIT
