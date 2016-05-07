export interface IStatusInit {
    type: "status:init";
    data: IChargerStation[]
}

export interface IStatusUpdate {
    type: "status:update";
    data: IChargerStation;
}

export interface IStatusRaw {
    type: "status:raw";
    code: number;
    data: {
        uuid: string;
        connector: number;
        status: number;
        error: number;
        timestamp: number;
    }
}

export interface IChargerStation{
    uuid: string;
    status: number;
    connectors: IConnector[];
}

export interface IConnector {
    status: number;
    error: number;
    timestamp: number;
}
