/* global describe, it */

'use strict'
var assert = require('assert') // eslint-disable-line
var should = require('should') // eslint-disable-line
var tmsUtils = require('../lib/utils.js')

describe('tmsUtils', function () {
  it('should parse tmsConsituentsLookup row results into mapped obj', function () {
    var data = [ '6548', '1', '1', 'Bolen, Edwin S. Sr.', 'Bolen', 'Edwin S.', '', '', '', '', '', 'Edwin S. Bolen Sr.', '1884', '1940', 'American, 1884-1940', "Edwin S. Bolen, (Sr) was born August  1884, in Bentonville, VA. He enlisted in the US Navy in 1917, as a Yeoman 2nd class. He was selected for the Navy's Paymaster school in Washington, DC. Upon completion of that training, he was commissioned Ensign and assigned to duty in the New York area. In 1933 he was appointed City Clerk of Richmond, VA, where he served until his death in June of 1940, at age 55. [From e-mail correspondence with the photographer's son, 2012]", 'PIC', 'American', '', 'dlowe', '2006-09-06 14:45:38.2', '0', '', '', '', 'Sr.', '', '(BINARY DATA)', '', '', '', 'true', 'true', 'true', '17534', '0', '0' ]
    var r = tmsUtils.mapConsituentCsvToJson(data)
    r.LastName.should.equal('Bolen')
    r.BeginDate.should.equal('1884')
  })

  it('should parse tmsTitlesLookup row results into mapped obj', function () {
    var data = ['2411', '1583', '14', 'Christopher and Bleeker Streets', '', '1', 'Conversion', '2006-07-13 18:30:24.74', '1', '1', '0', '(BINARY DATA)', '', 'false']
    var r = tmsUtils.mapTitleCsvToJson(data)
    r.Title.should.equal('Christopher and Bleeker Streets')
    r.EnteredDate.should.equal('2006-07-13 18:30:24.74')
  })
  it('should parse tmsAltNumLookup row results into mapped obj', function () {
    var data = ['3320', '3299', '108', 'MFZ+ (Valentine) 81-802', 'Catalog Number', 'Conversion', '2006-07-13 00:00:00.0', '', '', '']
    var r = tmsUtils.mapAltNumCsvToJson(data)
    r.AltNum.should.equal('MFZ+ (Valentine) 81-802')
    r.Description.should.equal('Catalog Number')
  })
  it('should parse tmsObjConXrefLookup row results into mapped obj', function () {
    var data = ['293928', '119898', '2426', '18', '0', '0', '', 'dlowe', '2011-03-10 18:00:53.68', '', '1', '1', '1', '', '', '', '', 'Photographer']
    var r = tmsUtils.mapObjConXrefCsvToJson(data)
    r.ObjectID.should.equal('119898')
    r.Role.should.equal('Photographer')
  })

  it('should parse tmsObjects row results into mapped obj', function () {
    var data = ['2401', 'CNY Inventory # 1217                      ', 'CNY   Inventory   1217                                  ', '1', '1', '1', '9', '0', '0', '0', '1935', '1935', '', '1935, December 19', 'FIREHOUSE [SUBTITLE: PARK AVENUE AND EAST 135TH STREET.]', 'Gelatin silver print', 'Print Size: 7 3/8 x 9 1/2 in. (18.7 x 24.1 cm)', '', '', '', '', '', '', 'Printed on matte double weight paper. FAP-CNY Block stamp verso. FAP-CNY stamp verso. Image size: 7 3/8 x 9 1/2.', '', '', '', 'CNY Block Code I.D.2.', '', '', 'Changing New York [Manhattan]', '0.0000', '0.0000', '0.0000', '0.0000', '0.0000', '1', '1', '0', '0', 'Conversion', '2006-07-13 00:00:00.0', '0', '', '0', '3', '0', '', '', 'ABBOTT, BERENICE', '', '', '', '', '', '', '', '', '', '', 'CNY # 064', '', '', '', 'Unknown', '', '', '', '', '0.0000', '(BINARY DATA)', '0', '1991-08-20', '', '0', '', '', '', '', '', 'true']
    var r = tmsUtils.mapObjectCsvToJson(data)
    r.ObjectNumber.should.equal('CNY Inventory # 1217                      ')
    r.DateBegin.should.equal('1935')
    r.Title.should.equal('FIREHOUSE [SUBTITLE: PARK AVENUE AND EAST 135TH STREET.]')
  })
})
