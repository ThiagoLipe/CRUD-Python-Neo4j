# Neo4j CRUD Python

Este repositório contém um exemplo de aplicação CRUD (Create, Read, Update, Delete) usando Node.js, Express e Neo4j. O aplicativo permite criar, ler, atualizar e excluir usuários em um banco de dados Neo4j através de uma API REST e uma interface de linha de comando (CLI).

## Requisitos

- Node.js
- Neo4j
- NPM (Node Package Manager)

## Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/neo4j-crud.git
   cd neo4j-crud
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Configure a conexão com o Neo4j no arquivo `db.js`:
   ```js
   const neo4j = require('neo4j-driver');
   const driver = neo4j.driver(
     'bolt://localhost:7687', // URL do seu banco de dados Neo4j
     neo4j.auth.basic('neo4j', 'senha') // Insira suas credenciais
   );
   module.exports = { driver };
   ```

4. Inicie o servidor:
   ```sh
   node app.js
   ```

## Endpoints da API

### Criar Usuário

- **POST /users**
- **Corpo da Requisição:** `{ "name": "nome", "age": "idade" }`
- **Resposta:** 201 Created

### Ler Usuário

- **GET /users/:name**
- **Resposta:** `{ "name": "nome", "age": "idade" }`

### Atualizar Usuário

- **PUT /users/:name**
- **Corpo da Requisição:** `{ "age": "novaIdade" }`
- **Resposta:** 200 OK

### Excluir Usuário

- **DELETE /users/:name**
- **Resposta:** 200 OK

### Listar Todos os Usuários

- **GET /users**
- **Resposta:** `[{ "name": "nome1", "age": "idade1" }, { "name": "nome2", "age": "idade2" }]`

## Tutorial de Funcionamento

1. **Conexão com Neo4j:**
   Ao iniciar o servidor, uma conexão com o banco de dados Neo4j é testada para garantir que está funcionando corretamente.
   ```js
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
   ```

2. **Servidor Express:**
   O servidor Express é configurado para ouvir na porta 3000 e processar solicitações JSON.
   ```js
   const app = express();
   const port = 3000;
   app.use(bodyParser.json());

   app.listen(port, () => {
     console.log(`Servidor rodando em http://localhost:${port}`);
     testConnection();
     displayMenu();
   });
   ```

3. **Operações CRUD:**
   - **Criar Usuário:**
     ```js
     app.post("/users", async (req, res) => {
       const { name, age } = req.body;
       const session = driver.session();
       try {
         await session.run("CREATE (u:User {name: $name, age: $age}) RETURN u", { name, age });
         res.status(201).send("Usuário adicionado");
       } catch (error) {
         res.status(500).send(error.message);
       } finally {
         await session.close();
       }
     });
     ```

   - **Ler Usuário:**
     ```js
     app.get("/users/:name", async (req, res) => {
       const { name } = req.params;
       const session = driver.session();
       try {
         const result = await session.run("MATCH (u:User {name: $name}) RETURN u", { name });
         res.send(result.records.map((record) => record.get(0).properties));
       } catch (error) {
         res.status(500).send(error.message);
       } finally {
         await session.close();
       }
     });
     ```

   - **Atualizar Usuário:**
     ```js
     app.put("/users/:name", async (req, res) => {
       const { name } = req.params;
       const { age } = req.body;
       const session = driver.session();
       try {
         await session.run("MATCH (u:User {name: $name}) SET u.age = $age", { name, age });
         res.send("Usuário atualizado");
       } catch (error) {
         res.status(500).send(error.message);
       } finally {
         await session.close();
       }
     });
     ```

   - **Excluir Usuário:**
     ```js
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
     ```

   - **Listar Todos os Usuários:**
     ```js
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
     ```

4. **Interface de Linha de Comando:**
   Um menu interativo é apresentado no terminal para facilitar as operações CRUD via CLI.
   ```js
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
         // Código para lidar com cada opção
       }
     });
   }
   ```
