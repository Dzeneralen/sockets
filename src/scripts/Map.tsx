import * as React from "react";
import * as ReactDOM from "react-dom";
import * as L from "leaflet";
import * as INSocket from "../NobilSocketInterfaces";

import Store from "./ChargerStationStore";
import MapStore from "./MapStore";

class Map extends React.Component<any, any> {

    map: L.Map;

    initialized: boolean;

    chargerStationLayer: L.FeatureGroup<any>;

    constructor() {
        super();

        this.initialized = false;

    }

    onUpdates(list: Array<INSocket.ChargerStationDBO>) {
        let markers = list.map(cs => {

            let m = L.circleMarker(JSON.parse(cs.geometry), this.getStyle(cs));

            m.bindPopup(this.getPopup(cs));

            return m;
        });

        this.chargerStationLayer.clearLayers();

        markers.forEach(m => {
            this.chargerStationLayer.addLayer(m);
        });

        if (this.initialized === false && this.map !== null && list.length > 0) {
            this.initialized = true;
            let bbox = this.chargerStationLayer.getBounds();
            this.map.fitBounds(bbox);
        }

    }

    getPopup(cs: INSocket.ChargerStationDBO): string {

        let divElem = (label, value) => {
            return ("<div class='popup-attribute'>" + "<span class='label'>" + label + ":</span> " + value + " </div>");
        }


        let stats = this.getChargingStationStats(cs);


        let html = "<h3>Chargingstation " + cs.internationalId + "</h3>";
        html = html + divElem("Name", cs.name)
            + divElem("City", cs.city)
            + divElem("Owner", cs.owner)
            + divElem("Available connectors", stats.available)
            + divElem("Occupied connectors", stats.occupied)
            + divElem("Errorneous connectors", stats.error)
            + divElem("Unknown connectors", stats.unknown);

        return html;
    }

    getChargingStationStats(cs: INSocket.ChargerStationDBO) {

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

    getStyle(cs: INSocket.ChargerStationDBO): L.PathOptions {

        let cssClass: string = null;

        let stats = this.getChargingStationStats(cs);



        if (stats.available > 0) {
            cssClass = "chargerstation-available";
        } else {
            if (stats.total === stats.unknown) {
                cssClass = "chargerstation-unknown";
            } else if (stats.total === stats.error) {
                cssClass = "chargerstation-error";
            } else {
                cssClass = "chargerstation-occupied";
            }
        }
        let options: L.PathOptions = {
            radius: 10,
            className: cssClass
        };

        return options;
    }

    render() {
        return (
            <div></div>
        );
    }

    componentDidMount() {
        let node = ReactDOM.findDOMNode<HTMLElement>(this);
        node.className = "nobil-map";

        let attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>. Data from <a href="http://info.nobil.no/">NOBIL</a>';


        setTimeout(() => {
            let map = L.map(node, {
                minZoom: 2,
                maxZoom: 18,
                layers: [
                    L.tileLayer("http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
                        attribution: attribution
                    })
                ],
                attributionControl: true
            });


            this.map = map;

            this.chargerStationLayer = L.featureGroup();
            this.chargerStationLayer.addTo(map);
            this.map.fitWorld();

            Store.Instance.subscribe(this.onUpdates.bind(this));

            this.map.on("moveend", () => {
                let bbox = this.map.getBounds();
                MapStore.Instance.updateBoundingBox({
                    xmin: bbox.getSouth(),
                    xmax: bbox.getNorth(),
                    ymin: bbox.getWest(),
                    ymax: bbox.getEast(),
                });
            });

        }, 100);


    }

    componentWillUnmount() {
        this.map = null;
    }

    shouldComponentUpdate() {
        return false;
    }
}

export default Map;