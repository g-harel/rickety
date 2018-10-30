import React from "react";

import {userByID, userByName} from "../common/endpoints";
import {User} from "../common/types";

interface State {
    user: User | null;
}

export class App extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {user: null};
    }

    async loadUserByID(id: number) {
        const user = await userByID.call(id);
        this.setState({user});
    }

    async loadUserByName(name: string) {
        const user = await userByName.call({name});
        this.setState({user});
    }

    loadNullUser() {
        this.setState({user: null});
    }

    render() {
        return (
            <div>
                <button id="byID" onClick={this.loadUserByID.bind(this, 321)}>
                    Load user by ID (321)
                </button>
                <br />
                <button id="byName" onClick={this.loadUserByName.bind(this, "John Doe")}>
                    Load user by Name (John Doe)
                </button>
                <br />
                <button onClick={this.loadNullUser.bind(this)}>
                    Reset user (null)
                </button>
                <br />
                <pre>{JSON.stringify(this.state.user, null, 2)}</pre>
            </div>
        )
    }
}
