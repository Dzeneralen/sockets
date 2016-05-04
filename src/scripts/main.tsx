/// <reference path="./../../typings/tsd.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";


class HelloWorld extends React.Component<any, any> {
    
    render() {
        
        let today = new Date();
        
        return (
            <div>
            <h2>Welcome!</h2>
            <p>Hello World! The time is: {today.getHours()}:{today.getMinutes()}:{today.getSeconds()}</p></div>
        );
    }
    
    
    
}

ReactDOM.render(<HelloWorld />, document.getElementById("app-container"));