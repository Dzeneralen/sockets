
import { ChargerStationDBO } from "../NobilSocketInterfaces";

let findIndexOfStation = (list: Array<ChargerStationDBO>, id: string) => {
    let index = null;
    
    for(let i = 0; i < list.length; i++) {
        if(list[i].internationalId === id) {
            index = i;
            break;
        }
    }
    
    return index;
}

interface IChargerStore {
    
    chargerStations: Array<ChargerStationDBO>;
    onChanges: Array<Function>;
    
    subscribe(onChange);
    inform();
    
    updateChargerStation(station: ChargerStationDBO);
    
}

class ChargerStore implements IChargerStore {
    
    static Instance : ChargerStore = new ChargerStore();
    
    chargerStations: Array<ChargerStationDBO>;
    onChanges: Array<(stations: ChargerStationDBO[]) => void>;
    
    
    constructor() {
        if(ChargerStore.Instance) {
            throw Error("Do not new up this class, use the Instance property instead.");
        }
        
        this.chargerStations = [];
        this.onChanges = [];
    }
    
    subscribe(onChange: (stations: ChargerStationDBO[]) => void) {
        this.onChanges.push(onChange);
        onChange(this.chargerStations);
    }
    
    inform() {
        this.onChanges.forEach(callback => {
            callback(this.chargerStations);
        });
    }
    
    setInitialChargerStations(stations: Array<ChargerStationDBO>) {
        this.chargerStations = stations;
        this.inform();
    }
    
    updateChargerStation(station: ChargerStationDBO) {
        let index = findIndexOfStation(this.chargerStations, station.internationalId);
        
        this.chargerStations = [].concat(this.chargerStations.slice(0, index), [station], this.chargerStations.slice(index + 1, this.chargerStations.length));
        
        this.inform();
    }
}

export default ChargerStore;