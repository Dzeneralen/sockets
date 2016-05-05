import * as React from "react";
import Map from "./Map";
import Sidebar from "./Sidebar";

class Application extends React.Component<any, any> {
    
    render() {
        return (
            <div className="application-container">
                <Map />
                <Sidebar />
            </div>
        );
    }
    
}

export default Application;