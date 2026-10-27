import test from "node:test";
import assert from "node:assert/strict";
import { meetsJobEligibility } from "../services/eligibilityService.js";

test("allows a student who meets the minimum CGPA exactly", () => {
    assert.equal(
        meetsJobEligibility({ minCgpa: 7.5, allowedBranches: [] }, { cgpa: 7.5, branch: "IT" }),
        true,
    );
});

test("rejects a student below the minimum CGPA", () => {
    assert.equal(
        meetsJobEligibility({ minCgpa: 7.5 }, { cgpa: 7.49, branch: "IT" }),
        false,
    );
});

test("rejects a missing CGPA when the job has a positive CGPA requirement", () => {
    assert.equal(meetsJobEligibility({ minCgpa: 6 }, { branch: "IT" }), false);
    assert.equal(meetsJobEligibility({ minCgpa: 6 }, { cgpa: null, branch: "IT" }), false);
});

test("treats zero or absent CGPA requirement as unrestricted", () => {
    assert.equal(meetsJobEligibility({ minCgpa: 0 }, { branch: "IT" }), true);
    assert.equal(meetsJobEligibility({}, { branch: "IT" }), true);
});

test("matches allowed branches case-insensitively and ignores surrounding whitespace", () => {
    assert.equal(
        meetsJobEligibility({ allowedBranches: [" Computer Science ", "IT"] }, { branch: " computer science " }),
        true,
    );
});

test("rejects a student whose branch is not allowed", () => {
    assert.equal(
        meetsJobEligibility({ allowedBranches: ["Computer Science", "IT"] }, { branch: "Mechanical" }),
        false,
    );
});

test("treats an empty branch list as unrestricted", () => {
    assert.equal(meetsJobEligibility({ allowedBranches: [] }, { branch: "Mechanical" }), true);
    assert.equal(meetsJobEligibility({}, { branch: "Mechanical" }), true);
});
