
import { ChargerStationDBO } from "../NobilSocketInterfaces";
import ChargerStationStore from "./ChargerStationStore";

interface BoundingBox {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
}

class MapStore  {
    
    static Instance : MapStore = new MapStore();
    
    boundingBox: BoundingBox;
    chargerStations: Array<ChargerStationDBO>;
    chargerStationsInView: Array<ChargerStationDBO>;
    
    onChanges: Array<(chargerStations: Array<ChargerStationDBO>) => void>;
    
    
    constructor() {
        if(MapStore.Instance) {
            throw Error("Do not new up this class, use the Instance property instead.");
        }
        this.onChanges = [];
        
        this.chargerStations = [];
        this.chargerStationsInView = [];
        this.boundingBox = null;
        
        ChargerStationStore.Instance.subscribe((stations) => {
            this.updateChargerStations(stations);
        });
    }
    
    subscribe(onChange: (chargerStations: Array<ChargerStationDBO>) => void) {
        this.onChanges.push(onChange);
        onChange(this.chargerStationsInView);
    }
    
    inform() {
        this.onChanges.forEach(callback => {
            callback(this.chargerStationsInView);
        });
    }

    
    updateBoundingBox(bbox : BoundingBox) {
        this.boundingBox = bbox;
        this.recalculate();
    }
    
    updateChargerStations(chargerStations: Array<ChargerStationDBO>) {
        
        this.chargerStations = chargerStations;
        this.recalculate();
    }
    
    recalculate() {
        if(this.boundingBox === null) {
            return;
        }
        
        let bbox = this.boundingBox;
        
        this.chargerStationsInView = this.chargerStations
        .filter(cs => {
            
            let geom : number[] = JSON.parse(cs.geometry);
            
            let x = geom[0];
            let y = geom[1];
            
            if(x > bbox.xmin && x < bbox.xmax) {
                if(y > bbox.ymin && y < bbox.ymax) {
                    return true;
                }
            }
            return false;
        });
        
        this.inform();
    }
}

export default MapStore;