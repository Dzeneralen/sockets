import * as React from "react";

interface CounterProps {
    label: string;
    colorClass?: "green" | "red" | "yellow";
    amount: number;
}

class Counter extends React.Component<CounterProps,any> {
    
    
    render() {
        
        let amountSpan = <span>{this.props.amount}</span>
        if(this.props.colorClass) {
            amountSpan = <span className={this.props.colorClass}>{this.props.amount}</span>;
        }
        
        return(
            <div className="counter">
                <div className="label">{this.props.label}</div>
                <div className="amount">
                    {amountSpan}
                </div>
            </div>
        );
    }
}

export default Counter;