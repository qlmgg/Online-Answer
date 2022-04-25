# Online-Answer
基于Vue.js的在线答题系统，技术栈：在线答题系统 Vue3 + Vite + Element Plus + Koa。


## 后端数据库部署
```
docker pull mongo
docker run -dit --name mongodb -p 27017:27017 -v $PWD/mongodb:/data/db 
docker exec -it mongodb bash
mongo
use onlineanswer
db.createUser({user: "oa",pwd:"123456",roles:[{role:"userAdmin",db:"onlineanswer"}]})
```
