import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BookNotes",
    password: "postgres",
    port: 5433,
});
db.connect();

app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM reviews");
    const reviews = result.rows;
    res.render("index.ejs", { reviews });
});


app.post ("/add", async (req, res) => {
    let bookTitle = req.body.bookTitle;
    const bookRate = req.body.bookRate;
    const date = new Date();
    const reviewBody = req.body.reviewBody;

    let coverUrl = null;
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${bookTitle}`);
        const bookData = response.data.items[0];

        if (bookData && bookData.volumeInfo.imageLinks) {
            coverUrl = bookData.volumeInfo.imageLinks.thumbnail;
            bookTitle = bookData.volumeInfo.title;
        }
        await db.query("INSERT INTO reviews (book_title, rate, cover_url, date, review_body) VALUES ($1, $2, $3, $4, $5)", [bookTitle, bookRate, coverUrl, date, reviewBody])

        res.redirect("/");
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
