import * as Promise from "promise";

interface NOBILDataDump {
    
    Provider: string;
    Rights: string;
    apiver: string;
    
    chargerstations: ChargerStation[];
}

interface ChargerStation {
    attr: ChargerStationAttributes;
    csmd: ChargerStationInformation;
}

interface ChargerStationAttributes {
    conn: ChargerStationConnectionAttributes;
    st: ChargerStationGeneralAttributes;
}

interface ChargerStationInformation {
    Available_charging_points: number;
    City: string;
    Contact_info: string;
    County: string;
    County_ID: string;
    Created: string;
    Description_of_location: string;
    House_number: string;
    Image: string;
    International_id: string;
    Land_code: string;
    Municipality: string;
    Municipality_ID: string;
    Number_charging_points: number;
    Owned_by: string;
    Position: string;
    Station_status: number;
    Street: string;
    Updated: string;
    User_comment: string;
    Zipcode: string;
    id: number;
    name: string;
}

interface ChargerStationConnectionAttributes {
    [num: string] : ChargerStationGeneralAttribute;
}

interface ChargerStationGeneralAttributes {
    [num: string] : ChargerStationGeneralAttribute
}

interface ChargerStationGeneralAttribute {
    attrname: string;
    attrtypeid: number;
    attrvalid: number;
    trans: string;
}

class DataClient {
    
    constructor() {
    }
    
    readNOBILDataDump(path: string) {
        let promise = new Promise<NOBILDataDump>((resolve, reject) => {
            let dataFromJSON : NOBILDataDump = require(path);
            
            resolve(dataFromJSON);
        });
        
        return promise;
    }
    
}

export default DataClient;