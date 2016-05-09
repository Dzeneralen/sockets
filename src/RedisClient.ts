import * as Redis from "redis";
import * as Promise from "promise";

interface ClientParameters {
    port?: number;
    host?: string;
}

class RedisClient {
    
    private _client: Redis.RedisClient;
    private _isConnected: boolean;
    private _host: string;
    private _port: number;
    
    constructor({ host = "localhost", port = 6379 } : ClientParameters) {
        this._client = null;
        this._isConnected = false;
        this._host;
        this._port;
    }
    
    connect() {
        let promise = new Promise<boolean>((resolve, reject) => {
            if(this._isConnected === true) {
                resolve(true);
            }
            
            this._client = Redis.createClient(this._port ,this._host);
            
            this._client.on("connect", () => {
                this._isConnected = true;
                resolve(true);
            });
            
            this._client.on("error", (error => {
                this._isConnected = false;
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
    
    getKey(key: string) {
        let promise = new Promise<string>((resolve, reject) => {
            
            this._client.get(key, (err, valueString: string) => {
                
                if(err) {
                    reject(err);
                }
                
                resolve(valueString);
            });
        });
        return promise;
    }
    
    getValuesForKeys<T>(keys: string[]) : Promise.IThenable<Array<T>> {
        let promise = new Promise((resolve, reject) => {
            this._client.mget(keys, (err, res) => {
                if(err) {
                    reject(err);
                }
                
                resolve(res);
            });
        });
        
        return promise;
    }
    
    addToSet(key: string, value:string ) {
        this._client.sadd(key, value);
    }
    
    getMembersForSet(key: string) {
        let promise = new Promise<Array<string>>((resolve, reject) => {
            this._client.smembers(key, (err, members) => {
                if(err) {
                    reject(null);
                }
                resolve(members);
            });
        })
        return promise;
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