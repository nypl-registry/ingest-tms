'use strict'
var _ = require('highland')
var fs = require('fs')
var async = require('async')
var tmsUtils = require('../lib/utils.js')
var clc = require('cli-color')
var parseCsv = require('csv-parse')
var lexicon = require('nypl-registry-utils-lexicon')

// file names
var tmsConsituents = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsConsituents}`
// var tmsObjects = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsObjects}`
var tmsObjConXref = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsObjConXref}`
var tmsAltNum = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsAltNum}`
var tmsTitles = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsTitles}`
var tmsDepartments = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsDepartments}`
var tmsClassification = `${process.cwd()}${lexicon.configs.dataSourceFiles.tmsClassification}`

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

exports.asyncAllLookup = function (cb) {
  async.parallel({
    tmsConsituentsLookup: (callback) => {
      exports.tmsConsituentsLookup((lookupData) => {
        callback(null, lookupData)
      })
    },
    tmsTitlesLookup: (callback) => {
      exports.tmsTitlesLookup((lookupData) => {
        callback(null, lookupData)
      })
    },
    tmsAltNumLookup: (callback) => {
      exports.tmsAltNumLookup((lookupData) => {
        callback(null, lookupData)
      })
    },
    tmsObjConXrefLookup: (callback) => {
      exports.tmsObjConXrefLookup((lookupData) => {
        callback(null, lookupData)
      })
    },
    tmsDepartmentsLookup: (callback) => {
      exports.tmsDepartmentsLookup((lookupData) => {
        callback(null, lookupData)
      })
    },
    tmsClassificationLookup: (callback) => {
      exports.tmsClassificationLookup((lookupData) => {
        callback(null, lookupData)
      })
    }
  }, function (err, results) {
    if (err) console.log(err)
    cb(results)
  })
}

exports.tmsConsituentsLookup = function (cb) {
  var tmsConsituentsLookup = {}

  // try to open the saved version of this if it exists otherwise make it from the extracts
  fs.readFile(tmsConsituents + '.json', function (err, data) {
    if (err) {
      _(fs.createReadStream(tmsConsituents))
        .split()
        .compact()
        .map(_.curry(csv2Json))
        .nfcall([])
        .series()
        .map((line) => {
          var cObj = tmsUtils.mapConsituentCsvToJson(line)

          // make a smaller  obj for it
          var r = Object.create(null)

          r.id = parseInt(cObj.ConstituentID)
          r.nameAlpha = cObj.AlphaSort
          r.nameLast = cObj.LastName
          r.nameFirst = cObj.FirstName
          r.nameDisplay = cObj.DisplayName
          r.dateStart = cObj.BeginDate
          r.dateEnd = cObj.EndDate
          r.nationality = cObj.Nationality
          tmsConsituentsLookup[parseInt(cObj.ConstituentID)] = JSON.parse(JSON.stringify(r))
          return r
        })
        .compact()
        .done(function () {
          console.log('Done tmsConsituentsLookup')
          // write out results
          fs.writeFile(tmsConsituents + '.json', JSON.stringify(tmsConsituentsLookup, null, 2), function (err) {
            if (err) {
              console.log(err)
            }
            if (cb) {
              cb(tmsConsituentsLookup)
            }
          })
        })
    } else {
      // just load the data in
      tmsConsituentsLookup = JSON.parse(data.toString())
      console.log('Done tmsConsituentsLookup')
      cb(tmsConsituentsLookup)
    }
  })
}

exports.tmsTitlesLookup = function (cb) {
  var tmsTitlesLookup = {}

  fs.readFile(tmsTitles + '.json', function (err, data) {
    if (err) {
      _(fs.createReadStream(tmsTitles))
        .split()
        .compact()
        .map(_.curry(csv2Json))
        .nfcall([])
        .series()
        .map((line) => {
          var cObj = tmsUtils.mapTitleCsvToJson(line)

          if (!tmsTitlesLookup[parseInt(cObj.ObjectID)]) tmsTitlesLookup[parseInt(cObj.ObjectID)] = []
          tmsTitlesLookup[parseInt(cObj.ObjectID)].push(JSON.stringify(cObj.Title))

          return cObj
        })
        .compact()
        .done(function () {
          console.log('Done tmsTitlesLookup')
          // write out results
          fs.writeFile(tmsTitles + '.json', JSON.stringify(tmsTitlesLookup, null, 2), function (err) {
            if (err) {
              console.log(err)
            }
            if (cb) {
              cb(tmsTitlesLookup)
            }
          })
        })
    } else {
      tmsTitlesLookup = JSON.parse(data.toString())
      console.log('Done tmsTitlesLookup')
      cb(tmsTitlesLookup)
    }
  })
}

exports.tmsAltNumLookup = function (cb) {
  var tmsAltNumLookup = {}

  fs.readFile(tmsAltNum + '.json', function (err, data) {
    if (err) {
      _(fs.createReadStream(tmsAltNum))
        .split()
        .compact()
        .map(_.curry(csv2Json))
        .nfcall([])
        .series()
        .map((line) => {
          // map the array to obj
          var cObj = tmsUtils.mapAltNumCsvToJson(line)
          var r = Object.create(null)

          // make a smaller  obj for it
          r.value = cObj.AltNum
          r.type = cObj.Description
          r.table = parseInt(cObj.TableID)

          if (r.type !== 'Previous Number' && r.type !== '' && r.value !== '') {
            if (!tmsAltNumLookup[parseInt(cObj.ID) + '-' + r.table]) tmsAltNumLookup[parseInt(cObj.ID) + '-' + r.table] = []
            tmsAltNumLookup[parseInt(cObj.ID) + '-' + r.table].push(JSON.parse(JSON.stringify(r)))
          }

          return r
        })
        .compact()
        .done(function () {
          console.log('Done tmsAltNumLookup')
          // write out results
          fs.writeFile(tmsAltNum + '.json', JSON.stringify(tmsAltNumLookup, null, 2), function (err) {
            if (err) {
              console.log(err)
            }
            if (cb) {
              cb(tmsAltNumLookup)
            }
          })
        })
    } else {
      tmsAltNumLookup = JSON.parse(data.toString())
      console.log('Done tmsAltNumLookup')
      cb(tmsAltNumLookup)
    }
  })
}

exports.tmsObjConXrefLookup = function (cb) {
  var tmsObjConXrefLookup = {}

  fs.readFile(tmsObjConXref + '.json', function (err, data) {
    if (err) {
      _(fs.createReadStream(tmsObjConXref))
        .split()
        .compact()
        .map(_.curry(csv2Json))
        .nfcall([])
        .series()
        .map((line) => {
          // map the array to obj
          var cObj = tmsUtils.mapObjConXrefCsvToJson(line)

          // make a smaller  obj for it
          var r = Object.create(null)
          r.consituentId = parseInt(cObj.ConstituentID)
          r.role = cObj.Role

          if (!tmsObjConXrefLookup[parseInt(cObj.ObjectID)]) tmsObjConXrefLookup[parseInt(cObj.ObjectID)] = []

          tmsObjConXrefLookup[parseInt(cObj.ObjectID)].push(JSON.parse(JSON.stringify(r)))
          return r
        })
        .compact()
        .done(function () {
          console.log('Done tmsObjConXrefLookup')
          // write out results
          fs.writeFile(tmsObjConXref + '.json', JSON.stringify(tmsObjConXrefLookup, null, 2), function (err) {
            if (err) {
              console.log(err)
            }
            if (cb) {
              cb(tmsObjConXrefLookup)
            }
          })
        })
    } else {
      tmsObjConXrefLookup = JSON.parse(data.toString())
      console.log('Done tmsObjConXrefLookup')
      cb(tmsObjConXrefLookup)
    }
  })
}

exports.tmsDepartmentsLookup = function (cb) {
  var tmsDepartmentsLookup = {}

  _(fs.createReadStream(tmsDepartments))
    .split()
    .compact()
    .map(_.curry(csv2Json))
    .nfcall([])
    .series()
    .map((line) => {
      // map the array to obj
      tmsDepartmentsLookup[parseInt(line[0])] = line[1].trim()
      return line
    })
    .compact()
    .done(function () {
      console.log('Done tmsDepartmentsLookup')
      if (cb) {
        cb(tmsDepartmentsLookup)
      }
    })
}

exports.tmsClassificationLookup = function (cb) {
  var tmsClassificationLookup = {}

  _(fs.createReadStream(tmsClassification))
    .split()
    .compact()
    .map(_.curry(csv2Json))
    .nfcall([])
    .series()
    .map((line) => {
      // map the array to obj
      tmsClassificationLookup[parseInt(line[0])] = line[1].trim()
      return line
    })
    .compact()
    .done(function () {
      console.log('Done tmsClassificationLookup')
      if (cb) {
        cb(tmsClassificationLookup)
      }
    })
}
