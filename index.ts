import express, {Express, Request, Response} from "express";
import { fetchAndCacheData } from './controller.js';

const app: Express = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
    res.send('Welcome to file system JSON parser');
});

app.listen(port,() => {
    console.log(`Listening on port ${port}`);
});

app.get('/api/files', async (req: Request, res: Response) => {
    try {
        const data = await fetchAndCacheData();
        res.json(data); 
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});