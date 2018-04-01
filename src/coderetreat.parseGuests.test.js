import assert from 'assert'
import fs from 'fs'
import {parseGuests} from './coderetreat'

describe('parseGuests', function() {
  it('should split lines to fields', function() {
    const res = parseGuests("id	present	@name	@email	group	institute\n1	да!	Липатов Максим	deytrino@yandex.ru	ИТ 02	ртф");
    assert.deepEqual(res, {
      1 : {
        "present": true,
        "@name": "Липатов Максим",
        "@email": "deytrino@yandex.ru",
        "group": "ИТ 02",
        "institute": "ртф"
      }
    });
  });
  it('should skip empty fields', function() {
    const res = parseGuests("id	present	@name	@email	group	institute\n1		Липатов Максим		ИТ 02");
    assert.deepEqual(res, {
      1: {
      "present": false,
      "@name": "Липатов Максим",
      "@email": "",
      "group": "ИТ 02",
      "institute": ""
      }});
  });
  it('should parse several lines', function() {
    const res = parseGuests("id	present	@name\n1\t1\tIvan\n3\t0\tSergey");
    assert.deepEqual(res, {
      1: {
      "present": true,
      "@name": "Ivan",
      },
      3: {
        "present": false,
        "@name": "Sergey"
      }});
  });
  it('should not fail on real data', function() {
    const contents = fs.readFileSync('guests-sample.tsv', 'utf8');
    const res = parseGuests(contents);
    assert.equal(Object.keys(res).length, 62);
    const presentCount = Object.keys(res).filter(id => res[id].present).length;
    assert.equal(presentCount, 40);
  });
});