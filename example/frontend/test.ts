import {userByName} from "../common/endpoints";

const call = () =>
    userByName.call({
        name: "test",
    });

test("test", async () => {
    const spy = jest.spyOn(userByName, "call");
    spy.mockReturnValue({});

    await call();
    expect(spy).toHaveBeenCalled();
});
