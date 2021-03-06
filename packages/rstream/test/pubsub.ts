import { EquivMap } from "@thi.ng/associative";
import * as tx from "@thi.ng/transducers";
import * as assert from "assert";
import * as rs from "../src/index";
import { TIMEOUT } from "./config";

describe("PubSub", () => {
    let pub: rs.PubSub<any, any>;

    it("simple", () => {
        const acc: any = { a: [], b: [] };
        const collect = { next: (x: any) => acc[x].push(x) };
        pub = rs.pubsub({ topic: (x) => x });
        const a = pub.subscribeTopic("a", collect);
        const b = pub.subscribeTopic("b", collect);
        rs.fromIterableSync("abcbd").subscribe(pub);
        assert.deepEqual(acc, { a: ["a"], b: ["b", "b"] });
        assert.equal(pub.getState(), rs.State.DONE);
        assert.equal(a.getState(), rs.State.DONE);
        assert.equal(b.getState(), rs.State.DONE);
    });

    it("complex keys", () => {
        const acc = new EquivMap<[string, number], [string, number][]>();
        const collect = {
            next: (x: any) => {
                let v = acc.get(x);
                v ? v.push(x) : acc.set(x, [x]);
            }
        };
        pub = rs.pubsub({ topic: (x) => x });
        pub.subscribeTopic(["a", 0], collect);
        pub.subscribeTopic(["a", 1], collect);
        pub.subscribeTopic(["b", 2], collect);
        rs.fromIterableSync([
            ["a", 0],
            ["a", 1],
            ["b", 2],
            ["a", 0],
            ["c", 3]
        ]).subscribe(pub);
        assert.deepEqual(
            [...acc],
            [
                [["a", 0], [["a", 0], ["a", 0]]],
                [["a", 1], [["a", 1]]],
                [["b", 2], [["b", 2]]]
            ]
        );
        assert.equal(pub.getState(), rs.State.DONE);
    });

    it("transducer", () => {
        const acc: any = { a: [], b: [], c: [], d: [] };
        const collect = { next: (x: any) => acc[x[0]].push(x) };
        pub = rs.pubsub({
            topic: (x) => x[0],
            xform: tx.mapIndexed<string, [string, number]>((i, x) => [x, i])
        });
        pub.subscribeTopic("a", collect);
        pub.subscribeTopic("b", collect);
        rs.fromIterableSync("abcbd").subscribe(pub);
        assert.deepEqual(acc, {
            a: [["a", 0]],
            b: [["b", 1], ["b", 3]],
            c: [],
            d: []
        });
        assert.equal(pub.getState(), rs.State.DONE);
    });

    it("unsubTopic", function(done) {
        this.timeout(TIMEOUT * 8);
        const acc: any = { a: [], b: [] };
        const collect = {
            next: (x: any) => {
                acc[x].push(x);
            }
        };
        pub = rs.pubsub({ topic: (x) => x });
        pub.subscribeTopic("a", collect);
        const b = pub.subscribeTopic("b", collect);
        rs.fromIterable("abcbd", TIMEOUT).subscribe(pub);
        setTimeout(() => {
            pub.unsubscribeTopic("b", b);
        }, TIMEOUT * 2.5);
        setTimeout(() => {
            assert.deepEqual(acc, { a: ["a"], b: ["b"] });
            assert.equal(pub.getState(), rs.State.DONE);
            done();
        }, TIMEOUT * 7);
    });
});
