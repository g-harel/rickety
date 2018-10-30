import {mount} from "enzyme";
import React from "react";
import {link} from "rickety/link";

import {App} from "../frontend/app";
import {app} from "../backend/app";
import * as database from "../backend/database";
import {User} from "../common/types";

link.express(app);

const readUser = jest.spyOn(database, "readUser");

test("button click displays data from database", async () => {
    const user: User = {
        id: Math.random(),
        name: "Jane Doe",
        account: {
            email: "jane.doe@example.com",
            username: "jane.doe",
        }
    };
    readUser.mockClear();
    readUser.mockReturnValueOnce(user);

    const wrapper = mount(<App />);
    const button = wrapper.find("#byName");
    button.simulate('click');

    // Wait for component re-render after async "fetch".
    // https://github.com/airbnb/enzyme/issues/823
    await new Promise(r => setTimeout(r, 100));

    expect(readUser).toHaveBeenCalled();
    expect(wrapper.text()).toMatch(String(user.id));
});
