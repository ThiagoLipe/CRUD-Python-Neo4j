const neo4j = require('neo4j-driver');
const express = require("express");
const bodyParser = require("body-parser");

const { driver } = require("./db");

const app = express();
const port = 3000;
app.use(bodyParser.json());

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testConnection() {
  const session = driver.session();

  try {
    const result = await session.run("RETURN 1");
    console.log("Conectado com Sucesso", result.records[0].get(0));
  } catch (error) {
    console.error("Algo deu errado:", error);
  } finally {
    await session.close();
  }
}

app.get("/", (req, res) => {
  res.send("Servidor Rodando");
});

app.post("/users", async (req, res) => {
  const { name, age } = req.body;
  const session = driver.session();

  try {
    await session.run("CREATE (u:User {name: $name, age: $age}) RETURN u", {
      name,
      age,
    });
    res.status(201).send("Usuário adicionado");
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.get("/users", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run("MATCH (u:User) RETURN u");
    res.send(result.records.map((record) => record.get(0).properties));
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.delete("/users/:name", async (req, res) => {
  const { name } = req.params;
  const session = driver.session();

  try {
    await session.run("MATCH (u:User {name: $name}) DELETE u", { name });
    res.send("Usuário deletado");
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.put("/users/:name", async (req, res) => {
  const { name } = req.params;
  const { age } = req.body;
  const session = driver.session();

  try {
    await session.run("MATCH (u:User {name: $name}) SET u.age = $age", {
      name,
      age,
    });
    res.send("Usuário atualizado");
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

function displayMenu() {
  console.log(`
  == Neo4j CRUD ==
  1. Adicionar Usuário
  2. Ler Usuário
  3. Atualizar Usuário
  4. Excluir Usuário
  5. Exibir Todos os Usuários
  0. Sair
  `);

  rl.question("Selecione: ", async (option) => {
    switch (option) {
      case "1":
        rl.question("Nome: ", async (name) => {
          rl.question("Idade: ", async (age) => {
            const response = await fetch("http://localhost:3000/users", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, age }),
            });
            const result = await response.text();
            console.log(result);
            displayMenu();
          });
        });
        break;
      case "2":
        rl.question("Nome: ", async (name) => {
          const response = await fetch(`http://localhost:3000/users/${name}`);
          const result = await response.json();
          console.log(result);
          displayMenu();
        });
        break;
      case "3":
        rl.question("Nome: ", async (name) => {
          rl.question("Nova idade: ", async (age) => {
            const response = await fetch(`http://localhost:3000/users/${name}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ age }),
            });
            const result = await response.text();
            console.log(result);
            displayMenu();
          });
        });
        break;
      case "4":
        rl.question("Nome: ", async (name) => {
          const response = await fetch(`http://localhost:3000/users/${name}`, {
            method: "DELETE",
          });
          const result = await response.text();
          console.log(result);
          displayMenu();
        });
        break;
      case "5":
        const response = await fetch("http://localhost:3000/users");
        const result = await response.json();
        console.log(result);
        displayMenu();
        break;
      case "0":
        rl.close();
        process.exit(0);
        break;
      default:
        console.log("Ação inválida.");
        displayMenu();
        break;
    }
  });
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  testConnection();
  displayMenu();
});