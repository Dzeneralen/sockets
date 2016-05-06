import * as Redis from "redis";
import * as Promise from "promise";

interface ClientParameters {
    port?: number;
    host?: string;
}

class RedisClient {
    
    private _client: Redis.RedisClient;
    
    constructor({ host = "127.0.0.1", port = 6379 } : ClientParameters) {
        this._client = Redis.createClient();
    }
    
    connect() {
        let promise = new Promise<boolean>((resolve, reject) => {
            
            this._client.on("connect", () => {
                resolve(true);
            });
            
            this._client.on("error", (error => {
                resolve(false);
            }));
        });
        return promise;
    }
    
    getKeys(pattern: string) {
        let promise = new Promise<string[]>((resolve, reject) => {
            let keys : string[] = [];
            this._client.keys(pattern, (err, keyCollection: string[]) => {
                keys = keyCollection;
            });
            resolve(keys);
        });
        
        return promise;
    }
    
    setKey(key: string, value: string) {
        this._client.set(key, value);
    }
    
    clearKeys(keys: string[]) {
        interface DeleteResult {
                key: string;
                deleted: boolean;
            }
        
        let promise = new Promise<DeleteResult[]>((resolve, reject) => {
            let results : DeleteResult[] = [];
            keys.forEach((key) => {
                let didDelete = this._client.del(key);
                results = [].concat(results, [{ key: key, deleted: didDelete }]);
            });
            resolve(results);
        });
        
        return promise;
    }
    
    clearAllKeys() {
        console.log("Clearing all keys from redis DB..");
        this.getKeys("*").then(keys => {
            this.clearKeys(keys);
        });
    }
}

export default RedisClient;