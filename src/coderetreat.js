export function parseGuests (tsvText) {
  function fixValue (field, name) {
    if (name === 'present')
      return [true, 'true', 'TRUE', '1'].includes(field) || field.startsWith('да')
    return field || ''
  }
  function parseGuestsLine (fields, fieldNames) {
    let res = {}
    let id = -1
    for (let i = 0; i < fieldNames.length; i++) {
      const name = fieldNames[i]
      if (name === 'id')
        id = fixValue(fields[i], name)
      else
        res[name] = fixValue(fields[i], name)
    }
    return {[id]: res}
  }

  const lines = tsvText.split(/\n\r?/).map(line => line.split('\t'))
  const records = lines.slice(1).map(line => parseGuestsLine(line, lines[0]))
  const res = {}
  for (let record of records) {
    Object.assign(res, record)
  }
  return res
}

export function createExpert (guests) {
  const ids = Object.keys(guests).map(id => +id).sort()
  const newId = expertIds.length > 0 ? +expertIds[expertIds.length-1]+1 : 500
  let table = 1;
  while (expertIds.some(e => guests[e].table == table)) table++;
  return {[newId]: {expert:true, present: true, table: table}};
}

export function generateExperts (count, startId) {
  const res = {}
  for (let i = 0; i < count; i++)
    res[startId++] = {present: true, expert: true, table: i + 1}
  return res
}

export function getGuestPairScore (guestId, pairId, prevPairs, guests) {
  const g = guests[guestId]
  const p = guests[pairId]
  if (!p) return 0
  if (g.expert && p.expert) return -1000
  if (g.expert) return 100
  let score = 0
  if (pairId === guestId || p.expert) score += 100 // pairId === guestId => organizer person will be the pair. He is an expert
  if (prevPairs.includes(pairId)) score -= 1000
  if (g.group !== undefined && g.group === p.group) score -= 10
  if (p.group !== undefined && prevPairs.some(id => guests[id] && guests[id].group === p.group)) score -= 1
  return score
}

export function getSessionScore (sessions, guests) {
  let score = Number.MAX_VALUE
  let sumScore = 0;
  for (let guestId of getGuestIds(guests)) {
    const newScore = getGuestScore(+guestId, sessions, guests)
    sumScore += newScore;
    if (newScore < score) {
      score = newScore
    }
  }
  return score + sumScore / getGuestIds(guests).length / 100.0 / sessions.length;
}

export function getGuestScore (guestId, prevSessions, guests) {
  let score = guests[guestId].initialScore || 0
  const prevPairs = []
  for (let session of prevSessions) {
    if (session[guestId] === undefined) continue;
    score += getGuestPairScore(guestId, session[guestId].pairId, prevPairs, guests)
    prevPairs.push(session[guestId].pairId)
  }
  return score
}

export function getBestPairFor (guestId, prevPairs, guests, excludedGuests) {
  let bestScore = Number.NEGATIVE_INFINITY
  let bestPairId = undefined
  const candidates = getGuestIds(guests).filter(id => !excludedGuests.includes(+id) && id != guestId)
  shuffle(candidates)
  for (let pairId of candidates) {
    const score = getGuestPairScore(guestId, pairId, prevPairs, guests)
    if (score > bestScore) {
      bestPairId = pairId
      bestScore = score
    }
  }
  return {pairId: bestPairId, score: bestScore}
}
export function generateNextSession (guests, prevSessions) {
  let bestSession = tryGenerateNextSession (guests, prevSessions)
  let bestScore = getSessionScore([...prevSessions, bestSession], guests)
  for(let i=0; i<20; i++){
    const newSession = tryGenerateNextSession (guests, prevSessions);
    const score = getSessionScore([...prevSessions, newSession], guests);
    if (score > bestScore){
      bestScore = score;
      bestSession = newSession;
    }
  }
  return bestSession;
}

export function tryGenerateNextSession (guests, prevSessions) {
  prevSessions = prevSessions || []
  const session = {}
  const guestIdsFromLeastScore = shuffle(getGuestIds(guests))
    .sort((id1, id2) => getGuestScore(id1, prevSessions, guests) - getGuestScore(id2, prevSessions, guests))
  const excludedGuests = []
  for (let guestId of guestIdsFromLeastScore) {
    if (session[guestId]) continue
    const prevPairs = prevSessions.filter(s => s[guestId] !== undefined).map(s => s[guestId].pairId)
    const pair = getBestPairFor(guestId, prevPairs, guests, excludedGuests)
    const pairId = pair.pairId || guestId
    const prevPairs2 = prevSessions.filter(s => s[pairId] !== undefined).map(s => s[pairId].pairId)
    excludedGuests.push(pairId)
    excludedGuests.push(guestId)
    session[guestId] = {pairId: pairId, score: pair.score}
    session[pairId] = {pairId: guestId, score: getGuestPairScore(pairId, guestId, prevPairs2, guests)}
  }
  assignTables(session, guests)
  return session
}

function getGuestIds (guests) {
  return Object.keys(guests).filter(id => guests[id].present).map(id => +id)
}

function shuffle (a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function assignTables (session, guests) {
  const usedTables = []

  function setTable (guestId, table) {
    usedTables.push(table)
    session[guestId].table = table
    const pairId = session[guestId].pairId
    session[pairId].table = table
  }

  for (let guestId in session) {
    const guest = guests[guestId]
    if (guest.table === undefined || guest.table == "") continue
    setTable(guestId, guest.table)
  }

  let table = 1
  for (let guestId in session) {
    const t = session[guestId].table
    if (t !== "" && t !== undefined) continue
    while (usedTables.includes(table)) table++
    setTable(guestId, table)
  }
}

