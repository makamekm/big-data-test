const hyperswarm = require("hyperswarm");
const memdb = require("random-access-memory");
const hypertrie = require("hypertrie");
const pump = require("pump");
const topicGen = require("./topic");
const { Writable } = require("stream");

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

module.exports = ({ key, protocol }) => {
  protocol = protocol || "tcp";

  const topic = topicGen(key);
  const db = hypertrie(memdb, topic, { valueEncoding: "json" });

  const swarm = hyperswarm({});

  swarm.on("connection", (socket, details) => {
    if (details.type === protocol) {
      console.log("sdfsdf", details);
      pump(
        socket,
        db.replicate(!details.client, {
          live: true,
          upload: true,
          download: true,
        }),
        socket
      );
    }
  });

  swarm.join(topic, {
    lookup: true,
    announce: true,
  });

  const h = db.createHistoryStream({ reverse: true });
  const ws = forEachChunk({ objectMode: true }, (data, enc, next) => {
    // const { key } = data;

    console.log("sdfsdf", data);

    // if (/operations/.test(key)) {
    //   console.log(data);
    // }

    next();
  });
  pump(h, ws);

  return { swarm, storage: db };
};
