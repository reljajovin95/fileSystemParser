import express, {Express, Request, Response} from "express";
import { fetchAndCacheData, getCachedData } from './controller.js';

const app: Express = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
    res.send('Welcome to file system JSON parser');
});

app.listen(port, async () => {
    console.log(`Listening on port ${port} and caching data`);
    try {
        await fetchAndCacheData();
    } catch (error) {
        console.error('Error caching data at startup:', error);
    }
});

app.get('/api/files', async (req: Request, res: Response): Promise<any> => {
    try {
        const cachedData = getCachedData();
        if (!cachedData) {
            return res.status(404).json({ error: 'Cached data not found' });
        }
        res.json(cachedData); 
    } catch (error) {
        console.error('Error fetching cached data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/cache', async (req: Request, res: Response) => {
    try {
        await fetchAndCacheData();
        res.json({ message: 'Data cached successfully' });
    } catch (error) {
        console.error('Error caching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});