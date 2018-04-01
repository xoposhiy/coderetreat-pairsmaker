import assert from 'assert'
import fs from 'fs'
import { getGuestPairScore, getBestPairFor, generateNextSession, getSessionScore, generateExperts, parseGuests, assignTables } from './coderetreat'

describe('getGuestPairScore', function () {
  it('should add bonus for pair with expert', function () {
    const res = getGuestPairScore(1, 2, [], {1: {}, 2: {expert: true}})
    assert.equal(res, 100)
  })

  it('should return expert bonus for pair with himself (case of odd number of guests)', function () {
    const res = getGuestPairScore(1, 1, [], {1: {}})
    assert.equal(res, 100)
  })

  it('should give penalty for pair repetition', function () {
    const res = getGuestPairScore(1, 2, [2], {1: {}, 2: {}})
    assert.equal(res, -1000)
  })

  it('should give penalty for expert-expert pair', function () {
    const res = getGuestPairScore(1, 2, [], {1: {expert: true}, 2: {expert: true}})
    assert.equal(res, -1000)
  })

  it('should give penalty for pair from the same group as guest', function () {
    const scoreWithPenalty = getGuestPairScore(1, 2, [], {1: {group: 'x'}, 2: {group: 'x'}})
    const scoreWithoutPenalty = getGuestPairScore(1, 2, [], {1: {group: 'x'}, 2: {group: 'y'}})
    assert.equal(scoreWithPenalty, -10)
    assert.equal(scoreWithoutPenalty, 0)
  })

  it('should give penalty for pair from the same group as prev pairs', function () {
    const scoreWithPenalty = getGuestPairScore(1, 3, [2], {1: {group: 'x'}, 2: {group: 'y'}, 3: {group: 'y'}})
    assert.equal(scoreWithPenalty, -1)
  })

  it('should NOT consider guest initial score', function () {
    const score = getGuestPairScore(1, 2, [], {1: {initialScore: -1000}, 2: {}})
    assert.equal(score, 0)
  })
})

describe('getBestPairFor', function () {
  it('should eventually select the best pair', function () {
    const guests = {
      1: {group: 'x', present: true},
      2: {group: 'x', present: true},
      3: {group: 'y', present: true},
      4: {expert: true, present: false},
      5: {expert: true, group: 'x', present: true}
    }
    const res = getBestPairFor(1, [], guests, [])
    assert.deepEqual(res, {pairId: 5, score: 90})
  })

  it('should not use excluded guests', function () {
    const guests = {
      1: {group: 'x', present: true},
      2: {group: 'x', present: true},
      3: {group: 'y', present: true},
      4: {expert: true, present: false},
      5: {expert: true, group: 'x', present: true}
    }
    const res = getBestPairFor(1, [], guests, [3, 5])
    assert.deepEqual(res, {pairId: 2, score: -10})
  })

  it('should give randomized result', function () {
    const guests = {
      1: {group: 'x', present: true},
      2: {group: 'x', present: true},
      3: {group: 'y', present: true},
      4: {group: 'z', present: true}
    }
    let possiblePairs = [...Array(100).keys()].map(i => getBestPairFor(1, [], guests, []).pairId)
    assert.deepEqual([...new Set(possiblePairs)].sort(), [3, 4])
  })
})

function assertPossibleSession (session, guests) {
  const guestIds = Object.keys(guests).filter(id => guests[id].present)
  const actualGuestsAssigned = Object.keys(session)
  assert.deepEqual(actualGuestsAssigned.sort(), guestIds.sort())
  for (let id of actualGuestsAssigned) {
    const pairId = session[id].pairId
    assert.equal(session[pairId].pairId, id)
    assert.equal(session[pairId].table, session[id].table)
  }
}

describe('generateNextSession', function () {
  it('should generate the first session', function () {
    const guests = {
      1: {group: 'x', present: true},
      2: {group: 'x', present: true},
      3: {group: 'y', present: true},
      4: {expert: true, present: false},
      5: {expert: true, group: 'x', present: true}
    }
    const res = generateNextSession(guests, [])
    assertPossibleSession(res, guests)
  })

  it('should generate 3 sessions', function () {
    const guests = {
      1: {group: 'x', present: true},
      2: {group: 'x', present: true},
      3: {group: 'y', present: true},
      4: {expert: true, present: false},
      5: {expert: true, group: 'x', present: true}
    }
    const session1 = generateNextSession(guests, [])
    const session2 = generateNextSession(guests, [session1])
    const session3 = generateNextSession(guests, [session1, session2])
    assertPossibleSession(session2, guests)
    assertPossibleSession(session3, guests)
  })

  it('should generate realistic session', function () {
    const contents = fs.readFileSync('guests-sample.tsv', 'utf8')
    const students = parseGuests(contents)
    const experts = generateExperts(15, 100)
    const guests = Object.assign({}, students, experts)

    const sessions = []
    for (let i = 0; i < 4; i++) {
      const session = generateNextSession(guests, sessions)
      assertPossibleSession(session, guests)
      sessions.push(session)
      console.log("after session #" + (i+1) + " score " + getSessionScore(sessions, guests))
      assert(getSessionScore(sessions, guests) > (i >1 ? 99 : 0), getSessionScore(sessions, guests))
    }
  })
  it('should generate session after new guest came', function () {
    const guests = {
      1: {present: true},
      2: {present: true},
      3: {present: false},
      4: {expert: true, present: true},
      5: {expert: true, present: true}
    }
    const session1 = generateNextSession(guests, [])
    guests[3].present = true;
    guests[4].present = false;
    const session2 = generateNextSession(guests, [session1])
    guests[1].present = false;
    guests[5].present = false;
    const session3 = generateNextSession(guests, [session1, session2])
    assert(getSessionScore([session1, session2, session3], guests) > 100)
    assert(getSessionScore([session1, session2], guests) > 100)
    
  })
})

describe('assignTables', function () {
  const guests = {
    1: {present: true},
    2: {present: true},
    100: {expert: true, present: true, table: 1},
    101: {expert: true, present: true, table: 2}
  }

  it('should not move experts', function () {
    const session = {
      1: {pairId: 100},
      2: {pairId: 101},
      100: {pairId: 1},
      101: {pairId: 2}
    }
    assignTables(session, guests)
    assertPossibleSession(session, guests)
    assert.equal(session[1].table, 1)
    assert.equal(session[2].table, 2)
    assert.equal(session[100].table, 1)
    assert.equal(session[101].table, 2)
  })
  
  it('should assign tables for non expert pairs', function () {
    const guests = {
      1: {present: true},
      2: {present: true},
      3: {present: true},
      4: {present: true},
    }
    const session = {
      1: {pairId: 2},
      2: {pairId: 1},
      3: {pairId: 4},
      4: {pairId: 3},
    }
    assignTables(session, guests)
    assertPossibleSession(session, guests)
    assert.equal(session[1].table, 1)
    assert.equal(session[2].table, 1)
    assert.equal(session[3].table, 2)
    assert.equal(session[4].table, 2)
  })
})
