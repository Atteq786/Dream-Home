import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
dotenv.config();
import authRoutes from './routes/auth.route.js';


mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB successfully!');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000 !!!');
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API!'
    });
}
);

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        sucess: 'false',
        statusCode,
        message
    });
});
