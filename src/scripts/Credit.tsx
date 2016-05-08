import * as React from "react";

interface CreditProps {
    name: string;
    year: number;
    href: string;
}

class Credit extends React.Component<CreditProps, any> {
    
    render() {
        return (
            <div className="credit">
            Created by {this.props.name}, {this.props.year}. <a href={this.props.href}>GitHub</a>
            </div>
            
        );
    }
}

export default Credit;