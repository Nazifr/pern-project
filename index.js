/*const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");



const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow handling JSON requests

// Connect to PostgreSQL
const pool = new Pool({
    user: "postgres",  // PostgreSQL username
    host: "localhost", // Host for the PostgreSQL server
    database: "pern_project", // Your database name
    password: "your_password", // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

// Route that responds when you visit the root URL
app.get("/", (req, res) => {
    res.send("PERN backend is running!");
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});

*/

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow handling JSON requests

// Connect to PostgreSQL
const pool = new Pool({
    user: "postgres",  // PostgreSQL username
    host: "localhost", // Host for the PostgreSQL server
    database: "pern_project", // Your database name
    password: "159753" , // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

// Route to test database connection
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Wizards LIMIT 1"); // Replace "your_table_name" with an actual table in your database
        res.json(result.rows); // Send retrieved rows as JSON
    } catch (err) {
        console.error("Error querying database:", err.message);
        res.status(500).send("Database connection error");
    }
});

// Route that responds when you visit the root URL
app.get("/", (req, res) => {
    res.send("PERN backend is running!");
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});



