import mysql from 'mysql2/promise';

// Define the connection configuration
const config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'react',
    port: 3306
};

// Function to create a database connection
const connectToDatabase = async () => {
    try {
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected to the database');
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

export default connectToDatabase;
