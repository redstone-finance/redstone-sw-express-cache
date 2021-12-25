# redstone-sw-express-cache
An example of express SmartWeave app that serves current contract state.

### Installation 
```
yarn install
```

### Running
```
yarn start
```

### Reading contract state
```
curl http://localhost:18080/cache/state/<contractTxId>
```

eg.:
```
curl http://localhost:18080/cache/state/jj30ue4Gv7LISfL_gBfvcyBy2Jj3mTdxGuQyxx5vkd0
```
