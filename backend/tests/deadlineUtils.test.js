import test from "node:test";
import assert from "node:assert/strict";
import { getDeadlineEndAt, isDeadlinePassed } from "../services/deadlineUtils.js";

test("maps a date-only deadline to 23:59:59.999 Asia/Kolkata", () => {
    assert.equal(
        getDeadlineEndAt("2026-10-26").toISOString(),
        "2026-10-26T18:29:59.999Z",
    );
});

test("returns null for a missing or invalid deadline", () => {
    assert.equal(getDeadlineEndAt(null), null);
    assert.equal(getDeadlineEndAt("not-a-date"), null);
});

test("does not consider a deadline passed before or at its final millisecond", () => {
    const end = new Date("2026-10-26T18:29:59.999Z");
    assert.equal(isDeadlinePassed("2026-10-26", new Date(end.getTime() - 1)), false);
    assert.equal(isDeadlinePassed("2026-10-26", end), false);
});

test("considers a deadline passed one millisecond after its end", () => {
    assert.equal(
        isDeadlinePassed("2026-10-26", new Date("2026-10-26T18:30:00.000Z")),
        true,
    );
});

test("treats a missing or invalid deadline as not passed", () => {
    assert.equal(isDeadlinePassed(null, new Date("2026-10-27T00:00:00.000Z")), false);
    assert.equal(isDeadlinePassed("not-a-date", new Date("2026-10-27T00:00:00.000Z")), false);
});

test("accepts a date-like value for the current time", () => {
    assert.equal(isDeadlinePassed("2026-10-26", "2026-10-26T18:30:00.000Z"), true);
});
