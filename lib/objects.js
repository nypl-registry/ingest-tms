'use strict'
var _ = require('highland')
var fs = require('fs')
var tmsUtils = require('../lib/utils.js')
var clc = require('cli-color')
var parseCsv = require('csv-parse')
var lexicon = require('nypl-registry-utils-lexicon')
var db = require('nypl-registry-utils-database')
var exec = require('child_process').exec

// file name
var tmsObjects = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsObjects}`

var insert = function (collections, callback) {
  // ask for a new bulk operation
  db.newRegistryIngestBulkOp('tmsObjects', (bulk) => {
    // insert all the operations
    collections.forEach((a) => bulk.insert(a))
    bulk.execute(function (err, result) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  })
}

var csv2Json = function (line, callback) {
  parseCsv(line, {}, function (err, item) {
    if (err) {
      console.log(clc.bgRedBright('--------------------------'))
      console.log(line)
      console.log(clc.bgRedBright('CSV PARSE Error ' + err))
      console.log(clc.bgRedBright('--------------------------'))
    }
    callback(err, item[0])
  })
}
function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

var ingestPrepare = function (cb) {
  db.prepareRegistryIngestTmsObjects(function () {
    // find out how many lines there are
    exec('wc -l ' + tmsObjects, function (error, results) {
      var totalLines = results.trim().split(' ')[0]
      if (isNaN(totalLines)) totalLines = 0
      totalLines = parseInt(totalLines)
      cb(error, totalLines)
    })
  })
}

exports.tmsObjectsIngest = function (lookupTables, cb) {
  var totalInserted = 0
  var previousPercent = -1

  ingestPrepare((err, totalLines) => {
    if (err) console.log(err)

    _(fs.createReadStream(tmsObjects))
      .split()
      .compact()
      .map(_.curry(csv2Json))
      .nfcall([])
      .series()
      .map((line) => {
        var obj = tmsUtils.mapObjectCsvToJson(line)

        var objectDb = parseInt(obj.ObjectID)

        // prolly the header line
        if (isNaN(objectDb)) return ''

        var insert = {
          _id: objectDb,
          objectID: objectDb,
          title: false,
          titleAlt: false,
          objectNumber: false,

          callNumber: false,
          acquisitionNumber: false,
          imageId: false,
          lcc: false,
          classmark: false

        }

        insert.materialTypeId = parseInt(obj.ClassificationID)
        insert.materialType = lookupTables.tmsClassificationLookup[parseInt(obj.ClassificationID)]

        // first lets get possible titles
        if (lookupTables.tmsTitlesLookup[objectDb]) {
          insert.titleAlt = []

          for (var x in lookupTables.tmsTitlesLookup[objectDb]) {
            insert.titleAlt.push(lookupTables.tmsTitlesLookup[objectDb][x].replace(/"/gi, ''))
          }
        }

        if (obj.Title) insert.title = capitalizeFirstLetter(obj.Title.toLowerCase())

        if (obj.ObjectNumber) insert.objectNumber = obj.ObjectNumber.trim()

        // lets find possible other ids //108 === objects tables only here
        for (var altNumX in lookupTables.tmsAltNumLookup[objectDb + '-108']) {
          var id = lookupTables.tmsAltNumLookup[objectDb + '-108'][altNumX]

          // if (!rolesObjects[id.type.toLowerCase()]) rolesObjects[id.type.toLowerCase()] = 0
          // rolesObjects[id.type.toLowerCase()]++

          if (id.type.toLowerCase() === 'catalog number') {
            if (id.value) insert.callNumber = id.value.trim()
          }
          if (id.type.toLowerCase() === 'acquisition number') {
            if (id.value) insert.acquisitionNumber = id.value.trim()
          }
          if (id.type.toLowerCase() === 'digital id') {
            if (id.value) insert.imageId = id.value.trim()
          }
          if (id.type.toLowerCase() === 'library of congress call number') {
            if (id.value) insert.lcc = id.value.trim()
          }
          if (id.type.toLowerCase() === 'classmark') {
            if (id.value) insert.classmark = id.value.trim()
          }
        }

        insert.agents = []

        // pull out the agents and their roles
        for (var xRefX in lookupTables.tmsObjConXrefLookup[objectDb]) {
          var r = lookupTables.tmsObjConXrefLookup[objectDb][xRefX].role.toLowerCase()
          var cId = lookupTables.tmsObjConXrefLookup[objectDb][xRefX].consituentId

          // grab the real info from the consituents tables
          if (lookupTables.tmsConsituentsLookup[cId]) {
            var agent = lookupTables.tmsConsituentsLookup[cId]
            agent.role = r

            // check if they have ids in the AltNum tables 23 === the consitutents tables
            for (var altNumX2 in lookupTables.tmsAltNumLookup[cId + '-23']) {
              var altId = lookupTables.tmsAltNumLookup[cId + '-23'][altNumX2]

              if (altId.type.toLowerCase() === 'ulan id') {
                agent.ulan = altId.value
              }
              if (altId.type.toLowerCase() === 'wikipedia') {
                agent.wikipedia = altId.value
              }
              if (altId.type.toLowerCase() === 'viaf') {
                agent.viaf = altId.value
              }
              if (altId.type.toLowerCase() === 'lccn') {
                agent.lccn = altId.value
              }
              if (altId.type.toLowerCase() === 'worldcat id') {
                agent.worldcatId = altId.value
              }
              if (altId.type.toLowerCase() === 'picid') {
                agent.picid = altId.value
              }
            }
            insert.agents.push(agent)
          }
        }

        // it is in wal by default
        insert.division = 'wal'

        if (lookupTables.tmsDepartmentsLookup[obj.DepartmentID.toString()]) {
          insert.division = lookupTables.tmsDepartmentsLookup[obj.DepartmentID.toString()]
        }

        insert.dates = []

        if (obj.DateBegin) {
          insert.dates.push({
            field: 'inclusive',
            type: false,
            value: (!isNaN(parseInt(obj.DateBegin))) ? parseInt(obj.DateBegin) : obj.DateBegin,
            keyDate: false,
            point: 'start',
            encoding: false

          })
        }

        if (obj.DateEnd) {
          insert.dates.push({
            field: 'inclusive',
            type: false,
            value: (!isNaN(parseInt(obj.DateEnd))) ? parseInt(obj.DateEnd) : obj.DateEnd,
            keyDate: false,
            point: 'end',
            encoding: false

          })
        }

        if (obj.Dated) {
          insert.dates.push({
            field: 'free',
            type: false,
            value: obj.Dated,
            keyDate: false,
            point: 'exact',
            encoding: false

          })
        }

        var notesFields = ['Medium', 'Dimensions', 'Signed', 'Inscribed', 'Markings', 'CreditLine', 'Chat', 'Description', 'Exhibitions', 'Provenance', 'PubReferences', 'Notes', 'CuratorialRemarks', 'RelatedWorks', 'Portfolio', 'State', 'CatRais', 'HistAttributions', 'Bibliography', 'Edition', 'PaperSupport', 'DateRemarks']

        // notes of various types
        insert.notes = []

        for (var notesX in notesFields) {
          if (obj[notesFields[notesX]]) {
            if (obj[notesFields[notesX]].trim() !== '') {
              insert.notes.push({
                type: notesFields[notesX].toLowerCase(),
                value: obj[notesFields[notesX]]
              }
              )
            }
          }
        }

        var percent = Math.floor(++totalInserted / totalLines * 100)

        if (percent > previousPercent) {
          previousPercent = percent
          if (process.stdout.cursorTo) {
            process.stdout.cursorTo(0)
            process.stdout.write(clc.black.bgYellowBright('tmsObjects: ' + percent + '%'))
          }
        }
        return insert
      })
      .compact()
      .batch(999)
      .map(_.curry(insert))
      .nfcall([])
      .series()
      .done(function () {
        console.log('Done tmsObjectsIngest')
        // write out results

        if (cb) {
          cb(true)
        }
      })
  })
}
