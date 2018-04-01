import assert from 'assert'
import fs from 'fs'
import {generateExperts} from './coderetreat'

describe('generateExperts', function() {
  it('should return experts with tables and sequential ids', function() {
    const experts = generateExperts(2, 5);
    assert.deepEqual(experts, {
      5: {present:true, expert:true, table:1},
      6: {present:true, expert:true, table:2}
    });
  });
});