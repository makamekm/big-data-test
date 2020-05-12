const createAdministratorClient = require("./communication");

const run = async () => {
  const administrator = createAdministratorClient({
    key: "administration",
    isMain: false,
    minConnections: 1,
    onData: (data, connection) => {
      console.log("data from administrator", data);
    },
    onConnection: (connection) => {
      console.log("connected with an administrator");
    },
    onDisconnection: (connection) => {
      console.log("disconnected with an administrator");
    },
  });

  await administrator.waitForMinConnections();

  administrator.outcomeToAll.write({ foo: "I am a manager!" });

  // const io = {};

  // io.registerManager("generate_lines_of_words", async (manager) => {
  //   const data =
  //     "hi name bosido name \ndasd name hi\nasdasd name bosido bosido name\ndfdsf\ndddsd\nhi";
  //   const lines = data.split("\n");
  //   let cursor = -1;
  //   setInterval(() => {
  //     cursor++;
  //     if (lines.length >= cursor) {
  //       cursor = 0;
  //     }
  //     manager.write(lines[cursor]);
  //   }, 1000);
  // });

  // io.registerManager("count_words", async (manager) => {
  //   manager.subscribe("count_words", (data) => {
  //     manager.write(lines[cursor]);
  //   });
  // });
};

run();

// async function runManagerNode(manager) {
//   const data =
//     "hi name bosido name \ndasd name hi\nasdasd name bosido bosido name\ndfdsf\ndddsd\nhi";
//   const lines = data.split("\n");
//   let cursor = -1;
//   setInterval(() => {
//     cursor++;
//     if (lines.length >= cursor) {
//       cursor = 0;
//     }
//     manager.write(lines[cursor]);
//   }, 1000);
// }

async function runWorkerNode(worker, data) {
  // console.log(data);
  const words = data.split(/\W/gi).filter((w) => !w.trim());
  // for (const word of words) {
  //   worker.updateState({
  //     [word]: worker.state[word]++
  //   })
  // }
  for (const word of words) {
    worker.send("word_count", worker.state[word]++);
  }
}
