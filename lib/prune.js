'use strict'
var db = require('nypl-registry-utils-database')

/**
 * Deletes the potrait file from TMS data (it is in MMS better)
 *
 * @param  {function} cb - lookup table returned
 */
exports.dropPotraitCollection = function (cb) {
  db.returnCollectionRegistry('tmsObjects', (err, tmsObjects) => {
    if (err) console.log(err)

    tmsObjects.remove({objectNumber: /Portraits/}, (err, results) => {
      if (err) console.log(err)
      console.log(results.result)
      if (cb) cb()
    })
  })
}
