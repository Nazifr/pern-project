
/*
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
*/

/*// Route to test database connection
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Spells LIMIT 1"); // Replace "your_table_name" with an actual table in your database
        res.json(result.rows); // Send retrieved rows as JSON
    } catch (err) {
        console.error("Error querying database:", err.message);
        res.status(500).send("Database connection error");
    }
});*/

/*
// Route that responds when you visit the root URL
app.get("/", (req, res) => {
    res.send("PERN backend is running!");
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

*/


// SERVER: Backend Logic (Node.js with Express)
// Handles database queries and the main logic for checking battle requirements.

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL database connection

// Middleware to parse JSON requests
app.use(bodyParser.json());

// PostgreSQL database connection configuration
const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'wizard_inventory',
    password: 'your_password',
    port: 5432,
});

// Helper function to query the database
const queryDB = async (query, params) => {
    try {
        const res = await pool.query(query, params);
        return res.rows;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
};

// Route to authenticate a wizard by ID
app.post('/authenticate', async (req, res) => {
    const { wizard_id } = req.body;
    try {
        const wizard = await queryDB('SELECT * FROM Wizards WHERE wizard_id = $1', [wizard_id]);
        if (wizard.length > 0) {
            res.json({ success: true, wizard: wizard[0] });
        } else {
            res.status(404).json({ success: false, message: 'Wizard not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Route to fetch a creature's data by ID
app.post('/creature', async (req, res) => {
    const { creature_id } = req.body;
    try {
        const creature = await queryDB('SELECT * FROM Magical_Creatures WHERE creature_id = $1', [creature_id]);
        if (creature.length > 0) {
            res.json({ success: true, creature: creature[0] });
        } else {
            res.status(404).json({ success: false, message: 'Creature not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Route to check if the wizard can defeat a creature
app.post('/check-battle', async (req, res) => {
    const { wizard_id, creature_id } = req.body;
    try {
        // Fetch wizard and creature data
        const wizard = (await queryDB('SELECT * FROM Wizards WHERE wizard_id = $1', [wizard_id]))[0];
        const creature = (await queryDB('SELECT * FROM Magical_Creatures WHERE creature_id = $1', [creature_id]))[0];

        if (!wizard || !creature) {
            return res.status(404).json({ success: false, message: 'Wizard or creature not found' });
        }

        // Fetch inventory data
        const inventory = await queryDB('SELECT * FROM Potions WHERE wizard_id = $1', [wizard_id]);

        // Determine level difference
        const levelDifference = wizard.level - creature.level;
        let requiredPotions = 0;
        let requiredSpells = 0;

        // Determine battle requirements based on level difference
        if (levelDifference >= 10) {
            requiredPotions = 0; // No potions required except special ones
            requiredSpells = 0;
        } else if (levelDifference >= 5) {
            requiredPotions = 1;
            requiredSpells = 1;
        } else if (levelDifference >= -5) {
            requiredPotions = 2;
            requiredSpells = 2;
        } else if (levelDifference >= -10) {
            requiredPotions = 3;
            requiredSpells = 3;
        } else {
            return res.json({ success: false, message: 'Battle impossible due to level difference' });
        }

        // Check if the wizard has enough potions and spells
        const counterElement = getCounterElement(creature.affinity); // Function to determine counter element
        const potions = inventory.filter(item => item.effect === 'damage' && item.affinity === counterElement);

        if (potions.length >= requiredPotions) {
            res.json({ success: true, message: 'Wizard can defeat the creature' });
        } else {
            res.json({ success: false, message: 'Wizard needs more items to defeat the creature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Helper function to determine the counter element
const getCounterElement = (element) => {
    const counter = {
        water: 'fire',
        fire: 'earth',
        earth: 'air',
        air: 'light',
        dark: 'light',
        light: 'dark',
    };
    return counter[element] || null;
};

// Route to update wizard inventory
app.post('/update-inventory', async (req, res) => {
    const { wizard_id, items } = req.body; // Items to add
    try {
        for (const item of items) {
            await queryDB(
                'INSERT INTO Potions (name, effect, affinity, wizard_id) VALUES ($1, $2, $3, $4)',
                [item.name, item.effect, item.affinity, wizard_id]
            );
        }
        res.json({ success: true, message: 'Inventory updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


