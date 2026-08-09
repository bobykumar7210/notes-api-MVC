const mongoose = require("mongoose");
const logger = require('../middlewares/logger');

const connectDB = async () => {
    
    await mongoose.connect(
        process.env.MONGO_URI,
    );

    logger.info("MongoDB Connected");

};

module.exports = connectDB;