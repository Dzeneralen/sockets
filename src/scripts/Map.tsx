import * as React from "react";
import * as ReactDOM from "react-dom";
import * as L from "leaflet";

class Map extends React.Component<any, any> {
    
    map: L.Map;
    
    constructor() {
        super();
        
    }
    
    render() {
        return (
            <div class="map"></div>
        );
    }
    
    componentDidMount() {
        let node = ReactDOM.findDOMNode<HTMLElement>(this);
        
        let map = L.map(node, {
           minZoom: 2,
           maxZoom: 20,
           layers: [
               L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'})
           ], 
           attributionControl: false
        });
        
        
        this.map = map;
        map.fitWorld();
        
        node.className = "map";
    }
    
    componentWillUnmount() {
        this.map = null;
    }
    
    shouldComponentUpdate() {
        return false;
    }
}

export default Map;