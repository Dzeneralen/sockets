
export interface INOBILDataDump {
    
    Provider: string;
    Rights: string;
    apiver: string;
    
    chargerstations: IChargerStation[];
}

export interface IChargerStation {
    attr: IChargerStationAttributes;
    csmd: ChargerStationInformation;
}

export interface IChargerStationAttributes {
    conn: IChargerStationConnectionAttributes;
    st: IChargerStationGeneralAttributes;
}

export interface ChargerStationInformation {
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

export interface IChargerStationConnectionAttributes {
    [num: string] : IChargerStationGeneralAttribute;
}

export interface IChargerStationGeneralAttributes {
    [num: string] : IChargerStationGeneralAttribute
}

export interface IChargerStationGeneralAttribute {
    attrname: string;
    attrtypeid: number;
    attrvalid: number;
    trans: string;
}
