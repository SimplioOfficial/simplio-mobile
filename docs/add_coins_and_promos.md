# Add new support coin or promo to coinlist

Create post request to https://data.simplio.io/addcoindata with data - you can use postman
1. To add new coin/token
```{
  "token": "sjdfjsdhfkshfksdfsd",
  "env": "beta",
  "coins": [
    {
      "type": 31,
      "name": "Star Atlas",
      "ticker": "ATLAS",
      "unique_id": 10002,
      "contractAddress": "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
      "origin": "Native"
    }
  ],
  "promo": []
}
```
2. To add promo coin/token
```{
    "token": "sjdfjsdhfkshfksdfsd",
    "env": "beta",
    "coins": [],
    "promo": [
    {
      "type": 31,
      "name": "Star Atlas",
      "ticker": "ATLAS",
      "unique_id": 10002,
      "contractAddress": "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
      "origin": "Native"
    }
  ]
}
```
3. You can also add both coin and promo in 1 request
```{
  "token": "sjdfjsdhfkshfksdfsd",
  "env": "beta",
  "coins": [
    {
      "type": 31,
      "name": "Star Atlas",
      "ticker": "ATLAS",
      "unique_id": 10002,
      "contractAddress": "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
      "origin": "Native"
    }
  ],
  "promo": [
    {
      "type": 31,
      "name": "Star Atlas",
      "ticker": "ATLAS",
      "unique_id": 10002,
      "contractAddress": "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
      "origin": "Native"
    }
  ]
}
```

* token must be correct, don't change it
* type is the value of enum in data.ts => WalletType type
* ticker is the value of the enum in coins.ts => coinNames type
* env beta for testing, env prod for production

# Remove coin or promo from coinlist

Data is the same with above example, just need to change url to https://data.simplio.io/removecoindata

# Check coin list
* Prod: https://data.simplio.io/coins
* Beta: https://data.simplio.io/coinsbeta
