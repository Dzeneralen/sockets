import * as React from "react";

interface BrandProps {
    logoUrl: string;
    logoAlt: string;
    name: string;
}

class Brand extends React.Component<BrandProps, any> {
    
    render() {
        return (
            <div className="brand">
                <img className="logo" src={this.props.logoUrl} alt={this.props.logoAlt}/>
                <h1 className="name"><span>{this.props.name}</span></h1>
            </div>            
        );
    }
    
}

export default Brand;