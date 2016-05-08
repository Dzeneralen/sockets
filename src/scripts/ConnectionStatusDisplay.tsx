import * as React from "react";
import Counter from "./Counter";
import MapStore from "./MapStore";
import { ChargerStationDBO } from "../NobilSocketInterfaces";
import {  } from "./Map";

interface ChargerStationStatus {
    available: number;
    occupied: number;
    unknown: number;
    error: number;
    total: number;
}

class ConnectionStatusDisplay extends React.Component<any, ChargerStationStatus> {


    constructor() {
        super();

        
        
        this.state = {
            available: 0,
            occupied: 0,
            unknown: 0,
            error: 0,
            total: 0,
        };
    }
    
    componentDidMount() {
        MapStore.Instance.subscribe((stations) => {
               this.updateStatusDisplay(stations);         
        });
    }
    
    
    updateStatusDisplay(stations: ChargerStationDBO[]) {
        
        let individualStats = stations.map((cs) => {
            return this.getChargingStationStats(cs);
        });
        
        let totalStats = individualStats.reduce((prev, current) => {
            return {
                available: prev.available + current.available,
                occupied: prev.occupied + current.occupied,
                unknown: prev.unknown + current.unknown,
                error: prev.error + current.error,
                total: prev.total + current.total,
            };
        }, { available: 0, occupied: 0, unknown: 0, error: 0, total: 0 });
        
        this.setState(totalStats);
    }
    
    getChargingStationStats(cs: ChargerStationDBO) : ChargerStationStatus {

        let availConnectorsCount = cs.connectors.filter(c => {
            return c.status === 0 && c.error === 0;
        }).length;

        let occupiedConnectorsCount = cs.connectors.filter(c => {
            return c.status === 1;
        }).length;

        let unknownConnectorsCount = cs.connectors.filter(c => {
            return c.status === -1;
        }).length;

        let errorConnectorsCount = cs.connectors.filter(c => {
            return c.error === 1;
        }).length;

        let totalCount = availConnectorsCount + occupiedConnectorsCount + unknownConnectorsCount + errorConnectorsCount;

        return {
            available: availConnectorsCount,
            occupied: occupiedConnectorsCount,
            unknown: unknownConnectorsCount,
            error: errorConnectorsCount,
            total: totalCount,
        };
    }

    render() {
        return (
            <div className="connection-status-display">
                <div><h3 className="title">Status visible charging stations</h3></div>
                <div>
                    <Counter
                        label="Total connectors"
                        amount={this.state.total}
                        />
                    <Counter
                        label="Available connectors"
                        colorClass="green"
                        amount={this.state.available}
                        />
                    <Counter
                        label="Occupied connectors"
                        colorClass="yellow"
                        amount={this.state.occupied}
                        />
                    <Counter
                        label="Errorneous connectors"
                        colorClass="red"
                        amount={this.state.error}
                        />
                    <Counter
                        label="Unknown connectors"
                        amount={this.state.unknown}
                        />
                    <p className="description">A chargerstation often has several connectors. Each connector lets you charge your electric veichle.</p>
                </div>
            </div>
        );
    }

}

export default ConnectionStatusDisplay;