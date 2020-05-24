const discovery = require("discovery-swarm");
const memdb = require("random-access-memory");
const swarmDefaults = require("dat-swarm-defaults");
const hypertrie = require("hypertrie");
const pump = require("pump");
const { Writable } = require("stream");
const topicGen = require("./topic");
// const hyperid = require("hyperid");

// const uuid = hyperid();

class ForEachChunk extends Writable {
  constructor(opts, cb) {
    if (!cb) {
      cb = opts;
      opts = {};
    }
    super(opts);

    this.cb = cb;
  }

  _write(chunk, enc, next) {
    this.cb(chunk, enc, next);
  }
}

const forEachChunk = (...args) => new ForEachChunk(...args);

module.exports = async ({ key, name, port }) => {
  const topic = topicGen(key);

  const db = hypertrie(memdb, topic, { valueEncoding: "json" });

  const ready = () => {
    return new Promise((resolve) => db.ready(resolve));
  };

  // const authorize = async (key) => {
  //   return new Promise((resolve, reject) => {
  //     db.authorized(key, (err, auth) => {
  //       if (err) return reject(err);

  //       if (auth) {
  //         return resolve();
  //       }

  //       console.log("try to authorize", key);
  //       db.authorize(key, (err) => {
  //         console.log("authorized~", err);
  //         if (err) return reject(err);
  //         resolve();
  //       });
  //     });
  //   });
  // };

  const swarm = discovery(
    // swarmDefaults(
    {
      // id: topic.toString("hex"),
      // id: key,
      // stream: (peer) => {
      //   return db.replicate(!peer.initiator, {
      //     live: true,
      //     // upload: true,
      //     // download: true,
      //     // userData: db.local.key,
      //   });
      // },
    }
    // )
  );

  swarm.on("connection", (socket, peer) => {
    // connect(socket);
    // console.log(socket);
    pump(
      socket,
      db.replicate(peer.initiator, {
        live: true,
        // upload: true,
        // download: true,
        // userData: db.local.key,
      }),
      socket
    );
  });

  await ready();

  // swarm.listen(port);
  swarm.join(key);

  // const h = db.createHistoryStream({ reverse: true, live: true });
  // const ws = forEachChunk({ objectMode: true }, (data, enc, next) => {
  //   console.log("history data!!!", data);
  //   // const { key, value } = data;

  //   // if (/operations/.test(key)) {
  //   //   console.log(data);
  //   // }

  //   next();
  // });
  // pump(h, ws);

  // const writeOperation = (operation) => {
  //   const key = `operations/${uuid()}`;
  //   const data = {
  //     key,
  //     operation,
  //     timestamp: +Date.now(),
  //   };

  //   return new Promise((resolve, reject) => {
  //     db.put(key, data, (err) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(key);
  //       }
  //     });
  //   });
  // };

  return { swarm, storage: db };
};
