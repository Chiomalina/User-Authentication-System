//mongodb
require('./config/db'); 

const express = require("express");
const app = express();
const port = 3000;

const UserRouter = require("./api/User");

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// For accepting post from data
const bodyParser = require("express").json;
app.use(bodyParser());


// Mount routes
app.use("/user", UserRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

