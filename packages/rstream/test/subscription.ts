import * as tx from "@thi.ng/transducers";
import * as assert from "assert";
import * as rs from "../src/index";
import { TIMEOUT } from "./config";

describe("Subscription", () => {
    let src: rs.Stream<number>;

    beforeEach(() => {});

    it("new sub receives last", function(done) {
        this.timeout(TIMEOUT * 5);
        let buf: any[] = [];
        src = rs.fromIterable([1, 2, 3], TIMEOUT);
        src.subscribe({
            next(x) {
                buf.push(x);
            }
        });
        setTimeout(
            () =>
                src.subscribe({
                    next(x) {
                        buf.push(x);
                    },
                    done() {
                        assert.deepEqual(buf, [1, 2, 2, 3, 3]);
                        done();
                    }
                }),
            TIMEOUT * 2.5
        );
    });

    it("unsub does not trigger Subscription.done()", function(done) {
        this.timeout(TIMEOUT * 5);
        let buf: any[] = [];
        let called = false;
        src = rs.fromIterable([1, 2, 3], TIMEOUT);
        const sub = src.subscribe({
            next(x) {
                buf.push(x);
            },
            done() {
                called = true;
            }
        });
        setTimeout(() => sub.unsubscribe(), TIMEOUT * 1.5);
        setTimeout(() => {
            assert.deepEqual(buf, [1]);
            assert.equal(src.getState(), rs.State.DONE);
            assert.equal((<any>src).subs.length, 0);
            assert(!called);
            done();
        }, TIMEOUT * 4);
    });

    it("no new values after unsub", function(done) {
        this.timeout(TIMEOUT * 5);

        let buf: any[] = [];
        let called = false;
        src = rs.fromIterable([1, 2, 3], TIMEOUT);
        const sub = src.subscribe(
            {
                next(x) {
                    buf.push(x);
                },
                done() {
                    called = true;
                }
            },
            tx.partition(2, true)
        );
        setTimeout(() => sub.unsubscribe(), TIMEOUT * 2.5);
        setTimeout(() => {
            assert.deepEqual(buf, [[1, 2]]);
            assert.equal(src.getState(), rs.State.DONE);
            assert(!called);
            done();
        }, TIMEOUT * 4);
    });

    it("completing transducer sends all values", (done) => {
        let buf: any[] = [];
        src = rs.fromIterable([1, 2, 3], 10);
        src.subscribe(
            {
                next(x) {
                    buf.push(x);
                },
                done() {
                    assert.deepEqual(buf, [[1, 2], [3]]);
                    assert.equal(src.getState(), rs.State.DONE);
                    done();
                }
            },
            tx.partition(2, true)
        );
    });
});
