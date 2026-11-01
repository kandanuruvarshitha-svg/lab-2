
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = "./books.db";

let db;

// GET all books
app.get("/books/", async (request, response) => {
    const books = await db.all("SELECT * FROM book");
    response.status(200).send(books);
});

// GET a single book
app.get("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const book = await db.get(
        "SELECT * FROM book WHERE id = ?",
        [bookId]
    );

    if (book === undefined) {
        response.status(404).send({ error: "Book not found" });
    } else {
        response.status(200).send(book);
    }
});

// POST a new book
app.post("/books/", async (request, response) => {
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
        return response.status(400).send({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?)
    `;

    const result = await db.run(query, [title, author, price, pages]);

    response.status(201).send({
        message: "Book added successfully",
        bookId: result.lastID
    });
});

// PUT update a book
app.put("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const query = `
        UPDATE book
        SET title = ?, author = ?, price = ?, pages = ?
        WHERE id = ?
    `;

    const result = await db.run(query, [
        title,
        author,
        price,
        pages,
        bookId
    ]);

    if (result.changes === 0) {
        response.status(404).send({ error: "Book not found" });
    } else {
        response.status(200).send({ message: "Book updated successfully" });
    }
});

// DELETE a book
app.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const result = await db.run(
        "DELETE FROM book WHERE id = ?",
        [bookId]
    );

    if (result.changes === 0) {
        response.status(404).send({ error: "Book not found" });
    } else {
        response.status(200).send({ message: "Book deleted successfully" });
    }
});

// Initialize database and start server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log("Database connected successfully");

        const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();
