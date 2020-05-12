const createAdministratorServer = require("./communication");

const run = async () => {
  const administrator = createAdministratorServer({
    key: "administration",
    isMain: true,
    minConnections: 2,
    onData: (data, connection) => {
      console.log("data from manager", data);
    },
    onConnection: (connection) => {
      console.log("connected with a manager");
    },
    onDisconnection: (connection) => {
      console.log("disconnected with a manager");
    },
  });

  await administrator.waitForMinConnections();

  administrator.outcomeToAll.write({ foo: "I am an administrator" });
};

run();
