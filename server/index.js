const dotenv = require("dotenv");
dotenv.config();
require("newrelic");
const pg = require("/home/ec2-user/postgres/postgres.js");
const redisDB = require("/home/ec2-user/redis/redis.js");
const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http
  .createServer((req, res) => {
    if (req.method === "GET") {
      if (req.url === "/restNames") {
        redisDB.get("popular", (err, result) => {
          if (result) {
            res.writeHead(200, {
              "Content-Type": "application/json"
            });
            res.end(result);
          } else {
            let quer = "SELECT id,date,name FROM restaurants LIMIT 25";
            pg.query(quer).then(popResp => {
              redisDB.set("popular", JSON.stringify(popResp.rows));
              res.writeHead(200, {
                "Content-Type": "application/json"
              });
              res.end(JSON.stringify(popResp.rows));
            });
          }
        });
      } else if (isNaN(req.url.substr(1)) !== true) {
        let id = req.url.substr(1);
        redisDB.get(id, (err, result) => {
          if (result) {
            res.writeHead(200, {
              "Content-Type": "application/json"
            });
            res.end(result);
          } else {
            let quer = `SELECT photoobj FROM restaurants WHERE id=${id}`;
            pg.query(quer)
              .then(photos => {
                redisDB.set(id, JSON.stringify(photos.rows));
                res.writeHead(200, {
                  "Content-Type": "application/json"
                });
                res.end(JSON.stringify(photos.rows));
              })
              .catch(err => console.log(err));
          }
        });
      }
    } else if (req.method === "DELETE") {
      let id = req.url.substr(1);
      let quer = `DELETE FROM restaurants WHERE id=${id}`;
      pg.query(quer)
        .then(resp => {
          res.writeHead(200, {
            "Content-Type": "application/json"
          });
          res.end(JSON.stringify(resp));
        })
        .catch(err => console.log(err));
    } else if (req.method === "POST") {
      let dataCatch = "";
      req.on("data", chunk => {
        dataCatch += chunk;
      });
      req.on("end", () => {
        let { name, date, photoobj } = JSON.parse(dataCatch);
        photoobj = JSON.stringify(photoobj);
        let quer = `INSERT INTO restaurants (date,name,photoobj) VALUES ('${date}', '${name}', '${photoobj}')`;
        pg.query(quer)
          .then(resp => {
            res.writeHead(200, {
              "Content-type": "application/json"
            });
            res.end(JSON.stringify(resp));
          })
          .catch(err => console.log(err));
      });
    } else if (req.method === "PATCH") {
      let dataCatch = "";
      req.on("data", chunk => {
        dataCatch += chunk;
      });
      req.on("end", () => {
        let { name, date, photoobj } = JSON.parse(dataCatch);
        photoobj = JSON.stringify(photoobj);
        let quer = `UPDATE restaurants SET date='${date}', name='${name}', photoobj='${photoobj}' WHERE id=${id}`;
        pg.query(quer)
          .then(resp => {
            console.log(resp);
            res.writeHead(200, {
              "Content-type": "application/json"
            });
            res.end(JSON.stringify(resp));
          })
          .catch(err => console.log(err));
      });
    }
  })
  .listen(PORT, () => console.log(`SERVER LISTENING ON ${PORT}`));
