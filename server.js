const http = require("http")
const fs = require("fs")
const url = require("url")
const dataBase = require("./dataBase.json")

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/users') {
        fs.readFile("dataBase.json", (err, dataBase) => {
            if (err) {
              throw err
            }

            const data = JSON.parse(dataBase)

            res.writeHead(200, { "Content-Type": "application/json"})
            res.write(JSON.stringify(data.users))
            res.end()
        })
    } else if (req.method === 'GET' && req.url === '/api/books') {
        fs.readFile('dataBase.json', (err, dataBase) => {
            if (err) {
                throw err
            } 

            const data = JSON.parse(dataBase)

            res.writeHead(200, { "Content-Type": "application/json"})
            res.write(JSON.stringify(data.books))
            res.end()
        })
    } else if (req.method === 'DELETE' && req.url.startsWith('/api/books')) {
        const parsedUrl = url.parse(req.url, true)
        const bookID = parsedUrl.query.id

        const newBooks = dataBase.books.filter((book) => book.id != bookID)

        if (newBooks.length === dataBase.books.length) {
            res.writeHead(401, { "Content-Type": "application/json"})
            res.write(JSON.stringify({message: "Book Not Found !!!"}))
            res.end()
        } else {
            fs.writeFile(
                "dataBase.json",
                JSON.stringify({...dataBase, books: newBooks}),
                (err) => {
                    if (err) {
                        throw err
                    }
    
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(JSON.stringify({message: 'book removed successfully :))))'}))
                    res.end()
                }
            )
        }
    } else if (req.method === 'POST' && req.url === '/api/books') {
        let book = ""

        req.on('data', (data) => {
            book = book + data.toString()
        })

        req.on('end', () => {
            const newBook = { id: crypto.randomUUID(), ...JSON.parse(book), free: 1}

            dataBase.books.push(newBook)

            fs.writeFile(
                "dataBase.json",
                JSON.stringify(dataBase), 
                (err) => {
                    if(err) {
                        throw err
                    }
                    res.writeHead(201, { "Content-Type": "application/json" })
                    res.write(JSON.stringify({message: "New Book Added Successfully :)))"}))
                    res.end()
            })
        })
    } else if (req.method === "PUT" && req.url.startsWith("/api/books/return")) {
        const parsedUrl = url.parse(req.url, true);
        const bookID = parsedUrl.query.id;
    
        dataBase.books.forEach((book) => {
          if (book.id === Number(bookID)) {
            book.free = 1;
          }
        });
    
        fs.writeFile("./dataBase.json", JSON.stringify(dataBase), (err) => {
          if (err) {
            throw err;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ message: "Book returned Successfully" }));
          res.end();
        });
    } else if (req.method === 'PUT' && req.url.startsWith('/api/books')) {
        const parsedUrl = url.parse(req.url, true)
        const bookID = parsedUrl.query.id

        let bookEditedInfos = ""

        req.on("data", (data) => {
            bookEditedInfos = bookEditedInfos + data.toString()
        })

        req.on("end", () => {
            const bodyReq = JSON.parse(bookEditedInfos)

            dataBase.books.forEach((book) => {
                if(book.id === Number(bookID)) {
                    book.title = bodyReq.title
                    book.author = bodyReq.author
                    book.price = bodyReq.price
                }
            })

            fs.writeFile(
                "./dataBase.json",
                JSON.stringify(dataBase),
                (err) => {
                    if (err) {
                        throw err
                    }
                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.write(JSON.stringify({message:"Book Edited Successfully :)))"}))
                    res.end()
                }
            )
        })
    } else if (req.method === 'POST' && req.url === '/api/users') {
        let user = "";

        req.on("data", (data) => {
        user = user + data.toString();
        });

        req.on("end", () => {
        const { name, username, email } = JSON.parse(user);

        const isUserExist = dataBase.users.find(
            (user) => user.email === email || user.username === username
          );
          if (name === "" || username === "" || email === "") {
            res.writeHead(422, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User data is not valid !!!" }));
            res.end();
          } else if (isUserExist) {
            res.writeHead(409, { "Content-Type": "application/json" });
            res.write(
              JSON.stringify({ message: "email or username already exists" })
            );
            res.end();
          } else {
            const newUser = {
              id: crypto.randomUUID(),
              name,
              username,
              email,
              lateFee: 0,
            };
            
        dataBase.users.push(newUser);
    
        fs.writeFile("./dataBase.json", JSON.stringify(dataBase), (err) => {
            if (err) {
            throw err;
            }
        });
        res.writeHead(201, { "Content-Type": "application/json" });
        res.write(
            JSON.stringify({ message: "New User Registered Successfully" })
        );
        res.end();
        }
    })

    } else if (req.method === "PUT" && req.url.startsWith("/api/users/upgrade")) {
        const parsedUrl = url.parse(req.url, true);
        const userID = parsedUrl.query.id;
    
        dataBase.users.forEach((user) => {
          if (user.id === Number(userID)) {
            user.role = "ADMIN";
          }
        });
    
        fs.writeFile("./dataBase.json", JSON.stringify(dataBase), (err) => {
          if (err) {
            throw err;
          }
    
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ message: "User Upgraded Successfully" }));
          res.end();
        });
      } else if (req.method === "PUT" && req.url.startsWith("/api/users")) {
        const parsedUrl = url.parse(req.url, true);
        const userID = parsedUrl.query.id;
        let bodyReq = "";
    
        req.on("data", (data) => {
          bodyReq = bodyReq + data.toString();
        });
    
        req.on("end", () => {
          const { lateFee } = JSON.parse(bodyReq);
    
          dataBase.users.forEach((user) => {
            if (user.id === Number(userID)) {
              user.lateFee = lateFee;
            }
          });
    
          fs.writeFile("./dataBase.json", JSON.stringify(dataBase), (err) => {
            if (err) {
              throw err;
            }
    
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "lateFee Set Successfully" }));
            res.end();
          });
        });
      } else if (req.method === "POST" && req.url === "/api/users/login") {
        let user = "";
    
        req.on("data", (data) => {
          user = user + data.toString();
        });
    
        req.on("end", () => {
          const { username, email } = JSON.parse(user);
    
          const mainUser = dataBase.users.find(
            (user) => user.username === username && user.email === email
          );
    
          if (mainUser) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(
              JSON.stringify({ username: mainUser.username, email: mainUser.email })
            );
            res.end();
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "User Not Found" }));
            res.end();
          }
        });
      } else if (req.method === "POST" && req.url === "/api/books/rent") {
        let bodyReq = "";
    
        req.on("data", (data) => {
          bodyReq = bodyReq + data.toString();
        });
    
        req.on("end", () => {
          let { userID, bookID } = JSON.parse(bodyReq);
    
          const isFreeBook = dataBase.books.some(
            (book) => book.id === Number(bookID) && book.free === 1
          );
    
          if (isFreeBook) {
            dataBase.books.forEach((book) => {
              if (book.id === Number(bookID)) {
                book.free = 0;
              }
            });
    
            const newRent = {
              id: crypto.randomUUID(),
              userID,
              bookID,
            };
    
            dataBase.rents.push(newRent);
    
            fs.writeFile("./dataBase.json", JSON.stringify(dataBase), (err) => {
              if (err) {
                throw err;
              }
    
              res.writeHead(201, { "Content-Type": "application/json" });
              res.write(JSON.stringify({ message: "Book Reserved Successfully" }));
              res.end();
            });
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ message: "This book is not free" }));
            res.end();
          }
        });
      }   
})

server.listen(3000, () => {
    console.log('Server Running on Port 3000');
})