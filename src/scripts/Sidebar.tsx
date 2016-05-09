import * as React from "react";
import Brand from "./Brand";
import Credit from "./Credit";
import ConnectionStatusDisplay from "./ConnectionStatusDisplay";

class Sidebar extends React.Component<any, any> {
    
    constructor() {
        super();
        
    }
    
    render() {
        return (
            <div className="sidebar">
                <Brand 
                    name="Sockethub" 
                    logoAlt="Image" 
                    logoUrl="icon.svg"
                />
                <Credit 
                    name="Dzenan"
                    year={2016}
                    href="https://github.com/Dzeneralen"
                />
                <ConnectionStatusDisplay />
            </div>            
        );
    }
    
}

export default Sidebar;