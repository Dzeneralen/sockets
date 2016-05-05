import * as React from "react";
import Brand from "./Brand";
import Credit from "./Credit";

class Sidebar extends React.Component<any, any> {
    
    render() {
        return (
            <div className="sidebar">
                <Brand 
                    name="Sockets" 
                    logoAlt="Image" 
                    logoUrl=""
                />
                
                <div className="content">
                content goes heres
                </div>
                
                <Credit 
                    name="Dzenan"
                    year={2016}
                    href="#"
                />
            </div>            
        );
    }
    
}

export default Sidebar;