var fs = require('fs')
var db = require('nypl-registry-utils-database')
var request = require('request')
var clc = require('cli-color')
var async = require('async')
var _ = require('highland')

var ulansToViaf = {}

var askViaf = exports.askViaf = function (item, cb) {
  var idsToViaf = {}

  async.each(item.agents, function (agent, eachCallback) {
    // find if this one exists

    if (agent.ulan) {
      // do we have it already?
      if (ulansToViaf[agent.ulan]) {
        idsToViaf[agent.id] = ulansToViaf[agent.ulan]
        eachCallback()
      } else {
        var options = {
          url: 'http://viaf.org/viaf/sourceID/JPG%7C' + agent.ulan,
          followRedirect: false
        }
        request(options, function (error, response, body) {
          if (error) console.log(error)
          if (response.statusCode === 301) {
            if (response.headers) {
              if (response.headers.location) {
                var viafId = response.headers.location
                viafId = viafId.split('/viaf/')[1]
                ulansToViaf[agent.ulan] = viafId
                idsToViaf[agent.id] = viafId
              }
            }
          }

          eachCallback()
        })
      }
    } else {
      eachCallback()
    }
  }, function (err) {
    if (err) console.log(err)
    // loop through an update with the new
    for (var x in item.agents) {
      if (idsToViaf[item.agents[x].id]) {
        item.agents[x].viaf = idsToViaf[item.agents[x].id]
      }
    }

    var update = {
      _id: item._id,
      agents: item.agents
    }
    if (item._id === 'TEST') {
      cb(null, update)
      return
    } else {
      // update tms
      db.returnCollectionRegistry('tmsObjects', function (err, tmsObjects) {
        if (err) console.log(err)
        tmsObjects.update({ _id: update._id }, { $set: update }, function (err, result) {
          if (err) console.log(err)
          cb(null, update)
        })
      })
    }
  })
}

exports.ulan2viaf = function (cb) {
  var counter = 0

  var ulansToViafFile = `${process.cwd()}/data/tmp_tms_ulan_lookup.json`

  fs.readFile(ulansToViafFile, 'utf8', function (err, data) {
    if (err) {
      console.log(err)
    } else {
      ulansToViaf = JSON.parse(data)
    }

    db.returnCollectionRegistry('tmsObjects', function (err, tmsObjects) {
      if (err) console.log(err)

      _(tmsObjects.find({}).stream())
        .map((item) => {
          process.stdout.cursorTo(25)
          process.stdout.write(clc.black.bgGreenBright('ULAN to VIAF: ' + ++counter + ' | ' + Object.keys(ulansToViaf).length))
          return item
        })
        .map(_.curry(askViaf))
        .nfcall([])
        .series()
        .done(function () {
          console.log('Done ulan2viaf')
          // write out results
          fs.writeFile(ulansToViafFile, JSON.stringify(ulansToViaf, null, 2), function (err) {
            if (err) console.log(err)
            if (cb) {
              cb(true)
            }
          })
        })
    })
  })
}
