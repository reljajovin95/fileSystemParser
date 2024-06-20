import fetch from 'node-fetch';

interface NestedDirectoryStructure {
    [directoryName: string]: string[] | NestedDirectoryStructure[];
}

interface DirectoryStructure {
    [ipAddress: string]: (string | NestedDirectoryStructure)[];
}

let cachedResponse: DirectoryStructure | null = null;

export async function fetchAndCacheData(): Promise<void> {
    try {
        const response = await fetch('https://rest-test-eight.vercel.app/api/test');
        const data = await response.json();
        
        cachedResponse = transformResponse(data);

        console.log('Data cached successfully');
    } catch (error) {
        console.error('Error fetching or caching data:', error);
        throw error;
    }
}

export function getCachedData(): DirectoryStructure | null {
    return cachedResponse;
}

function transformResponse(response: any): DirectoryStructure {
    const fileStructure: DirectoryStructure = {};

    response.items.forEach((item: any) => {
        const fileUrl = item.fileUrl;
        const ipAddress = extractIpAddress(fileUrl);
        const directoryPath = extractDirectoryPath(fileUrl);
        const fileName = extractFileName(fileUrl);

        if (!fileStructure[ipAddress]) {
            fileStructure[ipAddress] = [];
        }

        if (directoryPath === '') {
            fileStructure[ipAddress].push(fileName);
        }else {
            let currentLevel = fileStructure[ipAddress];
            const directories = directoryPath.split('/');

            directories.forEach((directory, index) => {
                let directoryObject = currentLevel.find(
                    dir => typeof dir === 'object' && dir !== null && directory in dir
                ) as NestedDirectoryStructure | undefined;

                if (!directoryObject) {
                    directoryObject = { [directory]: [] };
                    currentLevel.push(directoryObject);
                }

                if (index === directories.length - 1 && fileName !== '') {
                    if (Array.isArray(directoryObject[directory])) {
                        (directoryObject[directory] as string[]).push(fileName);
                    }
                } else {
                    if (Array.isArray(directoryObject[directory])) {
                        currentLevel = directoryObject[directory] as (string | NestedDirectoryStructure)[];
                    }
                }
            });
        }

    });

    return fileStructure;
}

function extractIpAddress(fileUrl: string): string {
    const ipAddressRegex = /\/\/([^\/]+)\//;
    const match = fileUrl.match(ipAddressRegex);
    return match ? match[1] : '';
}

function extractDirectoryPath(fileUrl: string): string {
    const urlParts = fileUrl.split('/').slice(3); // Skip http://34.8.32.234:48183/
    return urlParts.slice(0, -1).join('/');
}

function extractFileName(fileUrl: string): string {
    return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
}