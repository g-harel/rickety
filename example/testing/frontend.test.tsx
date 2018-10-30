import {mount} from "enzyme";
import React from "react";

import {userByName} from "../common/endpoints";
import {App} from "../frontend/app";

test("button clicks call endpoint correctly", async () => {
    const spy = jest.spyOn(userByName, "call");
    spy.mockReturnValue({});

    const wrapper = mount(<App />);
    const button = wrapper.find("#byName");
    button.simulate('click');

    expect(spy).toHaveBeenCalled();
});
